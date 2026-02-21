import { createSystemSchema } from "@/lib/schemas";
import { DEFAULT_PRESUPPOSITIONS, FOUNDATIONAL_NODES } from "@/lib/constants";
import { foundationPosition } from "@/lib/foundation-layout";
import { requireUser } from "@/lib/db";
import { json } from "@/lib/utils";
import { track } from "@/lib/telemetry";
import { defaultSystemTiers, FOUNDATIONAL_TIER_ID } from "@/lib/tiers";

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser();
    const parsed = createSystemSchema.safeParse(await request.json());

    if (!parsed.success) {
      return json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { data: system, error } = await supabase
      .from("systems")
      .insert({
        user_id: user.id,
        title: parsed.data.title,
        presuppositions: DEFAULT_PRESUPPOSITIONS,
        tiers: defaultSystemTiers(),
      })
      .select("*")
      .single();

    if (error || !system) {
      return json({ error: error?.message ?? "Failed to create system" }, { status: 500 });
    }

    const seeded = FOUNDATIONAL_NODES.map((title, idx) => {
      const pos = foundationPosition(idx, FOUNDATIONAL_NODES.length, defaultSystemTiers());
      return {
        system_id: system.id,
        tier_id: FOUNDATIONAL_TIER_ID,
        title,
        description: "",
        notes: "",
        is_locked: true,
        x_position: pos.x,
        y_position: pos.y,
      };
    });

    const { error: seedError } = await supabase.from("nodes").insert(seeded);
    if (seedError) {
      return json({ error: seedError.message }, { status: 500 });
    }

    track("system_created", { user_id: user.id, system_id: system.id });

    return json({ system });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 401 });
  }
}
