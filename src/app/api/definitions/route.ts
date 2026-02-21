import { createDefinitionSchema } from "@/lib/schemas";
import { requireUser } from "@/lib/db";
import { json } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const { supabase } = await requireUser();
    const { searchParams } = new URL(request.url);
    const systemId = searchParams.get("system_id");

    if (!systemId) {
      return json({ error: "system_id query parameter is required" }, { status: 400 });
    }

    const { data: definitions, error } = await supabase
      .from("definitions")
      .select("*")
      .eq("system_id", systemId)
      .order("term", { ascending: true });

    if (error) {
      return json({ error: error.message }, { status: 500 });
    }

    return json({ definitions: definitions ?? [] });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const { supabase } = await requireUser();
    const parsed = createDefinitionSchema.safeParse(await request.json());

    if (!parsed.success) {
      return json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { data: definition, error } = await supabase
      .from("definitions")
      .insert(parsed.data)
      .select("*")
      .single();

    if (error || !definition) {
      return json({ error: error?.message ?? "Failed to create definition" }, { status: 500 });
    }

    return json({ definition });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }
}
