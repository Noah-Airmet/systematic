import { cn } from "@/lib/utils";

/**
 * Preferred default for canvas secondary actions: use variant="glass".
 * Keep primary/accent and danger for emphasis where hierarchy or readability require it.
 */
export function Button({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "glass";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "border-white/20 bg-white/10 text-white shadow-[0_4px_16px_rgba(255,255,255,0.08)] backdrop-blur-md hover:bg-white/15 hover:border-white/30",
        variant === "secondary" &&
          "border-[var(--border)] bg-white/5 text-[var(--foreground)] backdrop-blur-md hover:bg-white/10",
        variant === "glass" &&
          "border-border/50 bg-[var(--glass)] text-foreground shadow-sm hover:bg-white/15 hover:border-white/25 focus:ring-1 focus:ring-accent",
        variant === "ghost" && "border-transparent bg-transparent text-[var(--foreground)] hover:bg-white/10",
        variant === "danger" && "border-danger/40 bg-danger/20 text-danger hover:bg-danger hover:text-white shadow-[0_4px_16px_rgba(239,68,68,0.2)]",
        className,
      )}
      {...props}
    />
  );
}
