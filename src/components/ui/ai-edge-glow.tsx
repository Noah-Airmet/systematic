import { cn } from "@/lib/utils";

export function AiEdgeGlow({
    className,
    variant = "default"
}: {
    className?: string;
    variant?: "default" | "subtle";
}) {
    return (
        <div
            className={cn(
                "pointer-events-none fixed inset-0 z-[100]",
                variant === "default" ? "ai-edge-glow" : "ai-edge-glow-subtle",
                className
            )}
            aria-hidden="true"
        />
    );
}
