import { patchNodeSchema } from "@/lib/schemas";
import { shouldClearValidationOnNodePatch } from "@/lib/invalidation";
import { requireUser } from "@/lib/db";
import { json } from "@/lib/utils";
import { foundationalNodeUpdates } from "@/lib/foundation-layout";
import { NodeRow } from "@/lib/types";
import { FOUNDATIONAL_TIER_ID, normalizeSystemTiers } from "@/lib/tiers";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { supabase } = await requireUser();
    const parsed = patchNodeSchema.safeParse(await request.json());

    if (!parsed.success) {
      return json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { data: current } = await supabase
      .from("nodes")
      .select("id,is_locked,tier_id,system_id")
      .eq("id", id)
      .single();

    if (!current) {
      return json({ error: "Node not found" }, { status: 404 });
    }

    if (current.is_locked && parsed.data.tier_id && parsed.data.tier_id !== current.tier_id) {
      return json({ error: "Locked nodes cannot change tier" }, { status: 400 });
    }

    if (parsed.data.tier_id) {
      const { data: system } = await supabase
        .from("systems")
        .select("tiers")
        .eq("id", current.system_id)
        .single();
      const tiers = normalizeSystemTiers(system?.tiers);
      if (!tiers.some((tier) => tier.id === parsed.data.tier_id)) {
        return json({ error: "Invalid tier id for this system" }, { status: 400 });
      }
    }

    const payload: Record<string, unknown> = { ...parsed.data };

    if (shouldClearValidationOnNodePatch(parsed.data)) {
      payload.validation_status = null;
      payload.validation_critique = null;
    }

    if (Object.keys(payload).length === 0) {
      return json({ node: current });
    }

    const { data: nodesData, error } = await supabase
      .from("nodes")
      .update(payload)
      .eq("id", id)
      .select("*");

    if (error || !nodesData || nodesData.length === 0) {
      console.error("DEBUG PATCH ERROR:", error, "Data:", nodesData);
      require("fs").appendFileSync("debug-patch-errors.txt", JSON.stringify({ error, payload, id }) + "\n");
      return json({ error: error?.message ?? "Failed to update node", dbError: error, payloadUsed: payload, dataRaw: nodesData }, { status: 500 });
    }

    const node = nodesData[0];

    return json({ node });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { supabase } = await requireUser();

    const { data: current } = await supabase
      .from("nodes")
      .select("id,is_locked,tier_id,system_id")
      .eq("id", id)
      .single();

    if (!current) {
      return json({ error: "Node not found" }, { status: 404 });
    }

    if (current.is_locked) {
      return json({ error: "Locked nodes cannot be deleted" }, { status: 400 });
    }

    const { error } = await supabase.from("nodes").delete().eq("id", id);
    if (error) {
      return json({ error: error.message }, { status: 500 });
    }

    if (current.tier_id === FOUNDATIONAL_TIER_ID) {
      const { data: system } = await supabase
        .from("systems")
        .select("tiers")
        .eq("id", current.system_id)
        .single();
      const tiers = normalizeSystemTiers(system?.tiers);
      const { data: remainingNodes } = await supabase
        .from("nodes")
        .select("*")
        .eq("system_id", current.system_id);
      const updates = foundationalNodeUpdates((remainingNodes ?? []) as NodeRow[], tiers);
      if (updates.length) {
        await Promise.all(
          updates.map((update) =>
            supabase
              .from("nodes")
              .update({ x_position: update.x_position, y_position: update.y_position })
              .eq("id", update.id),
          ),
        );
      }
    }

    return json({ ok: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }
}
