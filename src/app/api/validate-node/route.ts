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

    // Fetch node with expanded fields, system, edges, and linked definitions in parallel
    const [{ data: system }, { data: node }, { data: edges }, { data: nodeDefLinks }] = await Promise.all([
      supabase.from("systems").select("id,presuppositions").eq("id", body.system_id).single(),
      supabase
        .from("nodes")
        .select("id,title,description,notes,tier_id,confidence,grounds,warrant,backing,qualifier,rebuttal,epistemic_sources")
        .eq("id", body.node_id)
        .single(),
      supabase
        .from("edges")
        .select("source_node_id,target_node_id,relationship_type,inference_type")
        .eq("system_id", body.system_id),
      supabase
        .from("node_definitions")
        .select("definition_id")
        .eq("node_id", body.node_id),
    ]);

    if (!system || !node) {
      return json({ error: "Node or system not found" }, { status: 404 });
    }

    // Fetch linked definitions
    const defIds = (nodeDefLinks ?? []).map((l: { definition_id: string }) => l.definition_id);
    const { data: linkedDefinitions } = defIds.length
      ? await supabase.from("definitions").select("term,definition").in("id", defIds)
      : { data: [] };

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
      .select("id,title,description,notes,tier_id,confidence")
      .in("id", neighborIds);

    const neighbors = related
      .map((edge) => {
        const id = edge.source_node_id === node.id ? edge.target_node_id : edge.source_node_id;
        const row = (neighborRows ?? []).find((n) => n.id === id);
        if (!row) return null;
        return {
          ...row,
          relationship_type: edge.relationship_type,
          inference_type: edge.inference_type,
          direction: edge.source_node_id === node.id ? "outgoing" : "incoming",
        };
      })
      .filter(Boolean);

    const presuppositions = filterNotFoundational(system.presuppositions ?? {});

    track("validation_requested", { user_id: user.id, system_id: system.id });

    // Build the Toulmin structure for the prompt
    const toulmin = {
      grounds: node.grounds || null,
      warrant: node.warrant || null,
      backing: node.backing || null,
      qualifier: node.qualifier || null,
      rebuttal: node.rebuttal || null,
    };
    const hasToulmin = Object.values(toulmin).some(v => v !== null && v !== "");

    const prompt = `You are a philosophical theology assistant specializing in rigorous systematic theology within the Latter-day Saint tradition. Analyze the target node for:

1. INTERNAL COHERENCE: Does this claim cohere with its connected neighbors and the user's presuppositions?
2. ARGUMENT SOUNDNESS: ${hasToulmin ? "The user provided a Toulmin argument structure. Assess whether the reasoning is valid. Does the warrant actually connect the grounds to the claim? Is the backing sufficient?" : "No structured argument was provided. Note if one would strengthen the claim."}
3. INFERENCE VALIDITY: Check that the inference types on connected edges match their actual logical strength. A "deductive" edge should represent a conclusion that necessarily follows. An "inductive" edge should represent a probabilistic conclusion.
4. QUALIFIER-CONFIDENCE ALIGNMENT: ${node.qualifier && node.confidence ? `The user set qualifier "${node.qualifier}" and confidence "${node.confidence}". Flag any tension between these.` : "Check for any mismatch between stated argument strength and confidence level."}
5. DEFINITIONAL CONSISTENCY: ${(linkedDefinitions ?? []).length > 0 ? "The user linked definitions to this node. Check whether the node's content uses those terms consistently." : "No definitions linked."}
6. EPISTEMIC SOURCE ADEQUACY: ${(node.epistemic_sources ?? []).length > 0 ? `Sources claimed: ${(node.epistemic_sources ?? []).join(", ")}. Note if these seem insufficient for the tier "${node.tier_id}".` : "No epistemic sources specified."}

Context:
- Node: ${JSON.stringify({ id: node.id, title: node.title, description: node.description, notes: node.notes, tier_id: node.tier_id, confidence: node.confidence })}
- Toulmin Structure: ${JSON.stringify(toulmin)}
- Epistemic Sources: ${JSON.stringify(node.epistemic_sources ?? [])}
- Linked Definitions: ${JSON.stringify(linkedDefinitions ?? [])}
- Neighbors (with inference types): ${JSON.stringify(neighbors)}
- User Presuppositions: ${JSON.stringify(presuppositions)}

Return strict JSON with keys: rating (consistent|warning|contradiction), critique (string — 2-4 sentences explaining the assessment, referencing specific Toulmin elements or definitional issues when relevant).

Important: Reason from the user's own presuppositions, not from a default theological position. Identify traditional tensions rather than making normative theological claims.`;

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
