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
