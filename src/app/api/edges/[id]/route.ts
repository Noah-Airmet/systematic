import { requireUser } from "@/lib/db";
import { json } from "@/lib/utils";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { supabase } = await requireUser();

    const { data: edge } = await supabase.from("edges").select("*").eq("id", id).single();
    if (!edge) {
      return json({ error: "Edge not found" }, { status: 404 });
    }

    const { error } = await supabase.from("edges").delete().eq("id", id);
    if (error) {
      return json({ error: error.message }, { status: 500 });
    }

    await supabase
      .from("nodes")
      .update({ validation_status: null, validation_critique: null })
      .in("id", [edge.source_node_id, edge.target_node_id]);

    return json({ ok: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }
}
