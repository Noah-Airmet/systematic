import { notFound, redirect } from "next/navigation";
import { DEFAULT_PRESUPPOSITIONS } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { AiEdgeGlow } from "@/components/ui/ai-edge-glow";

export default async function OnboardingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const { data: system } = await supabase
    .from("systems")
    .select("id,presuppositions")
    .eq("id", id)
    .single();

  if (!system) {
    notFound();
  }

  return (
    <main className="min-h-screen px-6 py-10 relative">
      <AiEdgeGlow variant="subtle" />
      <div className="mx-auto w-full max-w-5xl">
        <div className="liquid-panel-strong mb-6 rounded-3xl px-8 py-7">
          <h1 className="type-h1 mb-2">Presupposition Onboarding</h1>
          <p className="type-body muted">
            Define what is load-bearing for your system. You can skip now and edit this later.
          </p>
        </div>
        <OnboardingForm
          systemId={system.id}
          initial={{ ...DEFAULT_PRESUPPOSITIONS, ...(system.presuppositions ?? {}) }}
        />
      </div>
    </main>
  );
}
