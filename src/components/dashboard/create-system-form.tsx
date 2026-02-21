"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export function CreateSystemForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  function handleMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  async function onCreate() {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/systems", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Failed to create system");
      setLoading(false);
      return;
    }

    router.push(`/systems/${data.system.id}/templates`);
  }

  return (
    <div className="flex flex-col items-center py-12">
      <button
        ref={buttonRef}
        onClick={onCreate}
        disabled={loading}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl border border-white/10 bg-[#0c1321]/60 px-6 py-3 text-[#9fb0d0] backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:text-white"
      >
        {/* Spotlight gradient that follows cursor */}
        <span
          className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: isHovering
              ? `radial-gradient(120px circle at ${mousePos.x}px ${mousePos.y}px, rgba(108,127,255,0.15), transparent 60%)`
              : "none",
          }}
        />
        
        {/* Subtle background glow */}
        <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#6c7fff]/0 via-[#6c7fff]/5 to-[#6c7fff]/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        
        <Plus className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
        <span className="relative z-10 text-base">{loading ? "Creating..." : "Create new system"}</span>
      </button>
      {error ? <span className="mt-3 text-sm text-[#ffacb8]">{error}</span> : null}
    </div>
  );
}
