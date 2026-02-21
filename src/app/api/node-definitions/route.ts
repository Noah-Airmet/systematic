import { nodeDefinitionLinkSchema } from "@/lib/schemas";
import { requireUser } from "@/lib/db";
import { json } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const { supabase } = await requireUser();
    const { searchParams } = new URL(request.url);
    const nodeId = searchParams.get("node_id");

    if (!nodeId) {
      return json({ error: "node_id query parameter is required" }, { status: 400 });
    }

    const { data: links, error } = await supabase
      .from("node_definitions")
      .select("definition_id, definitions(id, term, definition, notes)")
      .eq("node_id", nodeId);

    if (error) {
      return json({ error: error.message }, { status: 500 });
    }

    const definitions = (links ?? [])
      .map((link: Record<string, unknown>) => link.definitions)
      .filter(Boolean);

    return json({ definitions });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const { supabase } = await requireUser();
    const parsed = nodeDefinitionLinkSchema.safeParse(await request.json());

    if (!parsed.success) {
      return json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { error } = await supabase
      .from("node_definitions")
      .upsert(parsed.data, { onConflict: "node_id,definition_id" });

    if (error) {
      return json({ error: error.message }, { status: 500 });
    }

    return json({ ok: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { supabase } = await requireUser();
    const parsed = nodeDefinitionLinkSchema.safeParse(await request.json());

    if (!parsed.success) {
      return json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { error } = await supabase
      .from("node_definitions")
      .delete()
      .eq("node_id", parsed.data.node_id)
      .eq("definition_id", parsed.data.definition_id);

    if (error) {
      return json({ error: error.message }, { status: 500 });
    }

    return json({ ok: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }
}
