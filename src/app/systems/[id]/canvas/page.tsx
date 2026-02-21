import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";
import { SystemCanvas } from "@/components/canvas/system-canvas";
import { applyFoundationalLayout, foundationalNodeUpdates } from "@/lib/foundation-layout";
import { normalizeSystemTiers } from "@/lib/tiers";

export default async function CanvasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const [{ data: system }, { data: nodes }, { data: edges }] = await Promise.all([
    supabase.from("systems").select("*").eq("id", id).single(),
    supabase.from("nodes").select("*").eq("system_id", id),
    supabase.from("edges").select("*").eq("system_id", id),
  ]);

  if (!system) {
    notFound();
  }

  const tiers = normalizeSystemTiers(system.tiers);
  system.tiers = tiers;
  const currentNodes = nodes ?? [];
  const updates = foundationalNodeUpdates(currentNodes, tiers);
  if (updates.length) {
    await Promise.all(
      updates.map((update) =>
        supabase
          .from("nodes")
          .update({ x_position: update.x_position, y_position: update.y_position })
          .eq("id", update.id),
      ),
    );
  }

  const isGuest = user?.is_anonymous ?? false;

  return (
    <main className="h-screen">
      <SystemCanvas isGuest={isGuest} system={system} nodes={applyFoundationalLayout(currentNodes, tiers)} edges={edges ?? []} />
    </main>
  );
}
