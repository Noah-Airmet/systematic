import { requireUser } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireUser();

  const [{ data: system }, { data: nodes }, { data: edges }, { data: definitions }] = await Promise.all([
    supabase.from("systems").select("*").eq("id", id).single(),
    supabase.from("nodes").select("*").eq("system_id", id),
    supabase.from("edges").select("*").eq("system_id", id),
    supabase.from("definitions").select("*").eq("system_id", id).order("term"),
  ]);

  if (!system) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(
    JSON.stringify(
      {
        system,
        nodes: nodes ?? [],
        edges: edges ?? [],
        definitions: definitions ?? [],
      },
      null,
      2,
    ),
    {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="systematic-${id}.json"`,
      },
    },
  );
}
