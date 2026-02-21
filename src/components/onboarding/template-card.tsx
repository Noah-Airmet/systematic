"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SystemTemplate } from "@/lib/templates";
import { Button } from "@/components/ui/button";
import { BookOpen, AlertCircle, Play } from "lucide-react";

interface TemplateCardProps {
    template: SystemTemplate;
    systemId: string;
}

export function TemplateCard({ template, systemId }: TemplateCardProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleApplyTemplate = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/systems/${systemId}/apply-template`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ templateId: template.id }),
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            router.push(`/systems/${systemId}/canvas`);
        } catch (e: any) {
            setError(e.message || "Failed to apply template.");
            setIsLoading(false);
        }
    };

    return (
        <div className="relative group rounded-2xl border border-[#2c3a54] bg-[#0b1220]/80 p-6 backdrop-blur transition-all duration-300 hover:border-[#4c6aa1] hover:bg-[#111b2f] hover:shadow-[0_8px_30px_rgba(76,106,161,0.15)] flex flex-col h-full overflow-hidden">
            {/* Decorative background glow */}
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-500/10 blur-[50px] transition-all group-hover:bg-blue-400/20" />

            <div className="flex-1 relative z-10">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e293b] border border-[#334155] text-blue-400 group-hover:text-blue-300 group-hover:scale-110 transition-transform">
                    <BookOpen className="h-5 w-5" />
                </div>

                <h3 className="mb-2 text-xl font-semibold tracking-tight text-white group-hover:text-blue-50 transition-colors">
                    {template.name}
                </h3>

                <p className="mb-6 text-sm leading-relaxed text-[#9fb0d0]">
                    {template.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                    <span className="inline-flex items-center rounded-md bg-[#1e293b]/80 px-2 py-1 text-xs font-medium text-blue-200 ring-1 ring-inset ring-blue-400/20">
                        {template.nodes.length} Nodes
                    </span>
                    <span className="inline-flex items-center rounded-md bg-[#1e293b]/80 px-2 py-1 text-xs font-medium text-emerald-200 ring-1 ring-inset ring-emerald-400/20">
                        {template.edges.length} Edges
                    </span>
                    {template.definitions && (
                        <span className="inline-flex items-center rounded-md bg-[#1e293b]/80 px-2 py-1 text-xs font-medium text-purple-200 ring-1 ring-inset ring-purple-400/20">
                            {template.definitions.length} terms
                        </span>
                    )}
                </div>
            </div>

            <div className="mt-auto pt-4 border-t border-[#2c3a54]/50 relative z-10">
                <Button
                    onClick={handleApplyTemplate}
                    className="w-full bg-[#1e293b] hover:bg-[#2d3b55] text-white border border-[#334155] transition-all group-hover:border-blue-500/50 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    ) : (
                        <>
                            <Play className="mr-2 h-4 w-4" /> Load System
                        </>
                    )}
                </Button>
                {error && (
                    <div className="mt-3 flex items-start gap-2 text-xs text-red-400 bg-red-950/30 p-2 rounded-md border border-red-900/50">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
