"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";

interface StartSystemFormProps {
    systemId: string;
}

export function StartSystemForm({ systemId }: StartSystemFormProps) {
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const finalName = name.trim() || "Untitled System";
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/systems/${systemId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: finalName }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to update system name");
            }

            router.push(`/systems/${systemId}/onboarding`);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full mb-16 relative">
            <div className="relative">
                <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name your system (e.g. My Theology)"
                    className="w-[280px] h-10 px-4 text-sm bg-[var(--glass)] hover:bg-white/5 transition-all text-white placeholder:text-white/40 border-[var(--border)] focus:border-[var(--accent)]"
                    disabled={isLoading}
                />
            </div>
            <Button
                type="submit"
                variant="glass"
                disabled={isLoading}
                className="group relative h-10 px-5 text-sm font-semibold whitespace-nowrap overflow-hidden transition-all"
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <span className="flex items-center justify-center gap-2">
                        Start from Scratch
                        <ArrowRight className="h-4 w-4 stroke-[2.5px] transition-transform group-hover:translate-x-1" />
                    </span>
                )}
            </Button>
            {error && (
                <p className="absolute -bottom-8 left-0 text-sm text-red-400 w-full text-center">
                    {error}
                </p>
            )}
        </form>
    );
}
