"use client";

import { useState, useCallback } from "react";
import { SystemListItem } from "./system-list-item";

interface System {
  id: string;
  title: string;
  updated_at: string;
}

interface SystemsListProps {
  initialSystems: System[];
}

export function SystemsList({ initialSystems }: SystemsListProps) {
  const [systems, setSystems] = useState<System[]>(initialSystems);

  const handleDelete = useCallback((id: string) => {
    setSystems((prev) => prev.filter((s) => s.id !== id));
  }, []);

  if (!systems.length) {
    return <p className="text-sm text-[#9fb0d0]">No systems yet.</p>;
  }

  return (
    <div className="space-y-2">
      {systems.map((system) => (
        <SystemListItem key={system.id} system={system} onDelete={handleDelete} />
      ))}
    </div>
  );
}
