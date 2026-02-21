import { createNodeSchema } from "@/lib/schemas";
import { requireUser } from "@/lib/db";
import { json } from "@/lib/utils";
import { track } from "@/lib/telemetry";
import { foundationalNodeUpdates } from "@/lib/foundation-layout";
import { NodeRow } from "@/lib/types";
import { FOUNDATIONAL_TIER_ID, normalizeSystemTiers } from "@/lib/tiers";

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser();
    const parsed = createNodeSchema.safeParse(await request.json());

    if (!parsed.success) {
      return json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { data: system } = await supabase
      .from("systems")
      .select("id,tiers")
      .eq("id", parsed.data.system_id)
      .single();
    if (!system) {
      return json({ error: "System not found" }, { status: 404 });
    }
    const tiers = normalizeSystemTiers(system.tiers);
    if (!tiers.some((tier) => tier.id === parsed.data.tier_id)) {
      return json({ error: "Invalid tier id for this system" }, { status: 400 });
    }

    const d = parsed.data;
    const insertPayload = {
      system_id: d.system_id,
      tier_id: d.tier_id,
      title: d.title,
      description: d.description ?? "",
      notes: d.notes ?? "",
      x_position: d.x_position,
      y_position: d.y_position,
      confidence: d.confidence ?? null,
      scripture_refs: d.scripture_refs ?? null,
      tags: d.tags ?? null,
      grounds: d.grounds ?? "",
      warrant: d.warrant ?? "",
      backing: d.backing ?? "",
      qualifier: d.qualifier ?? null,
      rebuttal: d.rebuttal ?? "",
      epistemic_sources: Array.isArray(d.epistemic_sources) ? d.epistemic_sources : [],
    };

    const { data: node, error } = await supabase
      .from("nodes")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error || !node) {
      return json(
        { error: error?.message ?? "Failed to create node", details: error?.details },
        { status: 500 }
      );
    }

    track("node_created", { user_id: user.id, system_id: node.system_id });

    if (node.tier_id === FOUNDATIONAL_TIER_ID) {
      const { data: currentNodes } = await supabase
        .from("nodes")
        .select("*")
        .eq("system_id", node.system_id);
      const updates = foundationalNodeUpdates((currentNodes ?? []) as NodeRow[], tiers);
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

    return json({ node });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }
}
