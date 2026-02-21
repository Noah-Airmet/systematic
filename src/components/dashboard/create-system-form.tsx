"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CreateSystemForm() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/systems", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Failed to create system");
      setLoading(false);
      return;
    }

    router.push(`/systems/${data.system.id}/onboarding`);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
      <Input
        placeholder="Name your system"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Button type="submit" disabled={loading || !title.trim()}>
        {loading ? "Creating..." : "Create"}
      </Button>
      {error ? <span className="text-sm text-[#ffacb8]">{error}</span> : null}
    </form>
  );
}
