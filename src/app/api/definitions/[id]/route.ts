import { patchDefinitionSchema } from "@/lib/schemas";
import { requireUser } from "@/lib/db";
import { json } from "@/lib/utils";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { supabase } = await requireUser();
    const parsed = patchDefinitionSchema.safeParse(await request.json());

    if (!parsed.success) {
      return json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { data: definition, error } = await supabase
      .from("definitions")
      .update(parsed.data)
      .eq("id", id)
      .select("*")
      .single();

    if (error || !definition) {
      return json({ error: error?.message ?? "Definition not found" }, { status: 404 });
    }

    return json({ definition });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { supabase } = await requireUser();

    const { error } = await supabase.from("definitions").delete().eq("id", id);
    if (error) {
      return json({ error: error.message }, { status: 500 });
    }

    return json({ ok: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }
}
