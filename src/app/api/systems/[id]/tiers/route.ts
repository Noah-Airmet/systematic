import { patchTiersSchema } from "@/lib/schemas";
import { requireUser } from "@/lib/db";
import { json } from "@/lib/utils";
import { FOUNDATIONAL_TIER_ID, normalizeSystemTiers } from "@/lib/tiers";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { supabase } = await requireUser();
    const parsed = patchTiersSchema.safeParse(await request.json());

    if (!parsed.success) {
      return json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const tiers = normalizeSystemTiers(parsed.data.tiers);
    if (!tiers.some((tier) => tier.id === FOUNDATIONAL_TIER_ID)) {
      return json({ error: "Foundational tier is required" }, { status: 400 });
    }

    const { data: system, error } = await supabase
      .from("systems")
      .update({ tiers })
      .eq("id", id)
      .select("id,tiers")
      .single();

    if (error || !system) {
      return json({ error: error?.message ?? "Failed to update tiers" }, { status: 500 });
    }

    return json({ system });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }
}
