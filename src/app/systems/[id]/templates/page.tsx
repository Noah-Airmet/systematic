import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";
import { AiEdgeGlow } from "@/components/ui/ai-edge-glow";
import { TEMPLATES } from "@/lib/templates";
import { TemplateCard } from "@/components/onboarding/template-card";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default async function TemplatesPage({ params }: { params: Promise<{ id: string }> }) {
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
        .select("id")
        .eq("id", id)
        .single();

    if (!system) {
        notFound();
    }

    return (
        <main className="min-h-screen px-6 py-10 relative bg-[#060a12] text-[#e9efff] overflow-hidden">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(108,127,255,0.15),transparent_45%),radial-gradient(circle_at_85%_75%,rgba(67,171,255,0.08),transparent_45%)]" />
            <AiEdgeGlow variant="subtle" />

            <div className="mx-auto w-full max-w-5xl relative z-10">
                <div className="text-center mb-12 mt-8">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-br from-white to-[#a6b6d8] bg-clip-text text-transparent">
                        Choose a Starting Point
                    </h1>
                    <p className="text-lg text-[#9fb0d0] max-w-2xl mx-auto">
                        Select a pre-built theological framework to populate your graph, or start from scratch to build your own system from the ground up.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {Object.values(TEMPLATES).map((template) => (
                        <TemplateCard key={template.id} template={template} systemId={id} />
                    ))}
                </div>

                <div className="flex justify-center">
                    <Link
                        href={`/systems/${id}/onboarding`}
                        className="group relative inline-flex items-center gap-2 rounded-full border border-[#2d3b55] bg-[#0c1321]/80 px-8 py-4 text-base font-medium text-white backdrop-blur transition-all hover:border-[#6c7fff] hover:bg-[#111b2f] hover:shadow-[0_0_20px_rgba(108,127,255,0.2)]"
                    >
                        Start from Scratch
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </main>
    );
}
