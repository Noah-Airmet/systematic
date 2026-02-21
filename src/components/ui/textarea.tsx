import { cn } from "@/lib/utils";

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-xl border border-[var(--border)] bg-[rgba(172,196,248,0.08)] px-3 py-2 text-sm text-[var(--foreground)] outline-none backdrop-blur-md focus:border-[var(--accent)]",
        props.className,
      )}
    />
  );
}
