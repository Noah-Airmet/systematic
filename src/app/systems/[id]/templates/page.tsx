import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";
import { AiEdgeGlow } from "@/components/ui/ai-edge-glow";
import { TEMPLATES } from "@/lib/templates";
import { TemplateCard } from "@/components/onboarding/template-card";
import { StartSystemForm } from "@/components/onboarding/start-system-form";
import Link from "next/link";

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
        <main className="min-h-screen px-6 py-10 relative bg-background text-foreground overflow-hidden">
            <div
                className="pointer-events-none fixed inset-0 z-0"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='1' cy='1' r='0.75' fill='rgba(255,255,255,0.08)'/%3E%3C/svg%3E")`,
                    backgroundPosition: "center",
                }}
            />
            <AiEdgeGlow variant="subtle" />

            <div className="mx-auto w-full max-w-5xl relative z-10 flex flex-col items-center">
                <div className="text-center mb-10 mt-8">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-br from-white to-[#a6b6d8] bg-clip-text text-transparent pb-2">
                        Choose a Starting Point
                    </h1>
                    <p className="text-lg text-[#9fb0d0] max-w-2xl mx-auto">
                        Select a pre-built theological framework to populate your graph, or start from scratch to build your own system from the ground up.
                    </p>
                </div>

                <StartSystemForm systemId={id} />

                <div className="w-full max-w-3xl flex items-center justify-center mb-10 gap-4 opacity-70">
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#2d3b55]" />
                    <span className="text-xs font-medium text-[#6a7b9c] uppercase tracking-[0.2em]">Or choose a template</span>
                    <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#2d3b55]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 w-full">
                    {Object.values(TEMPLATES).map((template) => (
                        <TemplateCard key={template.id} template={template} systemId={id} />
                    ))}
                </div>
            </div>
        </main>
    );
}
