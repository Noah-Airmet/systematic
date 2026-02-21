import { patchPresuppositionsSchema } from "@/lib/schemas";
import { requireUser } from "@/lib/db";
import { json } from "@/lib/utils";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { supabase } = await requireUser();
    const parsed = patchPresuppositionsSchema.safeParse(await request.json());

    if (!parsed.success) {
      return json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { data: system, error } = await supabase
      .from("systems")
      .update({ presuppositions: parsed.data.presuppositions })
      .eq("id", id)
      .select("*")
      .single();

    if (error || !system) {
      return json({ error: error?.message ?? "Failed to save" }, { status: 500 });
    }

    // invalidate cached validation when presuppositions change
    await supabase
      .from("nodes")
      .update({ validation_status: null, validation_critique: null })
      .eq("system_id", id);

    return json({ system });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }
}
