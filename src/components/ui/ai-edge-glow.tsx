import { cn } from "@/lib/utils";

export function AiEdgeGlow({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                "pointer-events-none fixed inset-0 z-[100] ai-edge-glow",
                className
            )}
            aria-hidden="true"
        />
    );
}
