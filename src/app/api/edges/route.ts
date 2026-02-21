import { createEdgeSchema } from "@/lib/schemas";
import { requireUser } from "@/lib/db";
import { json } from "@/lib/utils";
import { track } from "@/lib/telemetry";

async function invalidateConnectedNodes(
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
  sourceNodeId: string,
  targetNodeId: string,
) {
  await supabase
    .from("nodes")
    .update({ validation_status: null, validation_critique: null })
    .in("id", [sourceNodeId, targetNodeId]);
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser();
    const parsed = createEdgeSchema.safeParse(await request.json());

    if (!parsed.success) {
      return json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { data: edge, error } = await supabase
      .from("edges")
      .insert(parsed.data)
      .select("*")
      .single();

    if (error || !edge) {
      return json({ error: error?.message ?? "Failed to create edge" }, { status: 500 });
    }

    await invalidateConnectedNodes(supabase, edge.source_node_id, edge.target_node_id);
    track("edge_created", { user_id: user.id, system_id: edge.system_id });

    return json({ edge });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }
}
