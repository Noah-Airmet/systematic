import { requireUser } from "@/lib/db";
import { json } from "@/lib/utils";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { supabase } = await requireUser();

    const [{ data: system }, { data: nodes }, { data: edges }] = await Promise.all([
      supabase.from("systems").select("*").eq("id", id).single(),
      supabase.from("nodes").select("*").eq("system_id", id),
      supabase.from("edges").select("*").eq("system_id", id),
    ]);

    if (!system) {
      return json({ error: "Not found" }, { status: 404 });
    }

    return json({ system, nodes: nodes ?? [], edges: edges ?? [] });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { supabase, user } = await requireUser();

    // Verify the system belongs to the current user
    const { data: system } = await supabase
      .from("systems")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!system) {
      return json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    // First, unlock all locked nodes in this system so they can be deleted
    const { error: unlockError } = await supabase
      .from("nodes")
      .update({ is_locked: false })
      .eq("system_id", id)
      .eq("is_locked", true);

    if (unlockError) {
      return json({ error: "Failed to unlock nodes: " + unlockError.message }, { status: 500 });
    }

    // Delete the system (cascading deletes will handle nodes and edges)
    const { error } = await supabase.from("systems").delete().eq("id", id);

    if (error) {
      return json({ error: error.message }, { status: 500 });
    }

    return json({ success: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }
}
