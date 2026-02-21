import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { currentUsageDate, DAILY_VALIDATION_LIMIT, nextResetWindow } from "@/lib/rate-limit";
import { requireUser } from "@/lib/db";
import { filterNotFoundational } from "@/lib/presuppositions";
import { VALIDATOR_DISCLAIMER } from "@/lib/constants";
import { json } from "@/lib/utils";
import { track } from "@/lib/telemetry";
import { validateNodeRequestSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const bodyParsed = validateNodeRequestSchema.safeParse(await request.json());
    if (!bodyParsed.success) {
      return json({ error: "Invalid request: system_id and node_id must be valid UUIDs" }, { status: 400 });
    }
    const body = bodyParsed.data;
    const { supabase, user } = await requireUser();

    const usageDate = currentUsageDate();
    const { data: usageRow } = await supabase
      .from("validator_daily_usage")
      .select("count")
      .eq("user_id", user.id)
      .eq("usage_date", usageDate)
      .single();

    const currentCount = usageRow?.count ?? 0;
    if (currentCount >= DAILY_VALIDATION_LIMIT) {
      return json(
        {
          error: "Daily validation limit reached",
          next_reset_at: nextResetWindow(),
        },
        { status: 429 },
      );
    }

    const [{ data: system }, { data: node }, { data: edges }] = await Promise.all([
      supabase.from("systems").select("id,presuppositions").eq("id", body.system_id).single(),
      supabase
        .from("nodes")
        .select("id,title,description,notes,tier_id")
        .eq("id", body.node_id)
        .single(),
      supabase
        .from("edges")
        .select("source_node_id,target_node_id,relationship_type")
        .eq("system_id", body.system_id),
    ]);

    if (!system || !node) {
      return json({ error: "Node or system not found" }, { status: 404 });
    }

    const related = (edges ?? []).filter(
      (edge) => edge.source_node_id === node.id || edge.target_node_id === node.id,
    );

    const neighborIds = Array.from(
      new Set(
        related.map((edge) =>
          edge.source_node_id === node.id ? edge.target_node_id : edge.source_node_id,
        ),
      ),
    );

    const { data: neighborRows } = await supabase
      .from("nodes")
      .select("id,title,description,notes,tier_id")
      .in("id", neighborIds);

    const neighbors = related
      .map((edge) => {
        const id = edge.source_node_id === node.id ? edge.target_node_id : edge.source_node_id;
        const row = (neighborRows ?? []).find((n) => n.id === id);
        if (!row) return null;
        return {
          ...row,
          relationship_type: edge.relationship_type,
          direction: edge.source_node_id === node.id ? "outgoing" : "incoming",
        };
      })
      .filter(Boolean);

    const presuppositions = filterNotFoundational(system.presuppositions ?? {});

    track("validation_requested", { user_id: user.id, system_id: system.id });

    const prompt = `You are a theological consistency assistant. Analyze the target node for internal coherence with its one-degree neighborhood and presuppositions.\n\nReturn strict JSON with keys: rating (consistent|warning|contradiction), critique (string).\n\nSystem ID: ${body.system_id}\nNode: ${JSON.stringify(node)}\nNeighbors: ${JSON.stringify(neighbors)}\nPresuppositions: ${JSON.stringify(presuppositions)}`;

    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      prompt,
      temperature: 0.2,
    });

    let parsed = { rating: "warning", critique: "Unable to parse provider response." };
    try {
      parsed = JSON.parse(result.text);
    } catch {
      parsed = { rating: "warning", critique: result.text.slice(0, 1200) };
    }

    const rating = ["consistent", "warning", "contradiction"].includes(parsed.rating)
      ? parsed.rating
      : "warning";

    const critique = typeof parsed.critique === "string" ? parsed.critique : "No critique returned.";

    const { error: saveError } = await supabase
      .from("nodes")
      .update({ validation_status: rating, validation_critique: critique })
      .eq("id", node.id);

    if (saveError) {
      return json({ error: saveError.message }, { status: 500 });
    }

    await supabase
      .from("validator_daily_usage")
      .upsert(
        {
          user_id: user.id,
          usage_date: usageDate,
          count: currentCount + 1,
        },
        { onConflict: "user_id,usage_date" },
      );

    track("validation_succeeded", { user_id: user.id, system_id: system.id });

    return json({ rating, critique, disclaimer: VALIDATOR_DISCLAIMER });
  } catch (error) {
    track("validation_failed", { user_id: "unknown", system_id: "unknown" });
    return json({ error: error instanceof Error ? error.message : "Validation failed" }, { status: 500 });
  }
}
