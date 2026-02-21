"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SystemListItemProps {
  system: {
    id: string;
    title: string;
    updated_at: string;
  };
  onDelete: (id: string) => void;
}

export function SystemListItem({ system, onDelete }: SystemListItemProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/systems/${system.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        console.error("Failed to delete system:", data.error);
        return;
      }

      onDelete(system.id);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  }

  return (
    <>
      <div className="group relative">
        <Link
          href={`/systems/${system.id}/canvas`}
          className="block rounded-xl border border-[#2d3b55] bg-[#0b1220] p-3 pr-12 transition hover:border-[#4c6aa1] hover:bg-[#111b2f]"
        >
          <div className="font-semibold">{system.title}</div>
          <div className="text-xs text-[#98aacc]">
            Last modified: {new Date(system.updated_at).toLocaleString()}
          </div>
        </Link>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowConfirm(true);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#98aacc] opacity-0 transition hover:text-danger group-hover:opacity-100"
          aria-label="Delete system"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="liquid-panel-strong w-[340px] rounded-xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.8)] border-danger/30 scale-in-95 animate-in duration-200">
            <h3 className="type-h3 mb-2 text-white flex items-center gap-2">
              <span className="text-danger">⚠️</span> Delete System
            </h3>
            <p className="type-body text-muted mb-5">
              Are you sure you want to delete &quot;{system.title}&quot;? All nodes, edges, and data will be permanently removed.
            </p>

            <div className="flex items-center gap-2 mb-6">
              <input
                type="checkbox"
                id={`dontAskAgain-${system.id}`}
                className="rounded border-white/20 bg-black/40 text-danger focus:ring-danger/50 w-4 h-4 cursor-pointer"
                onChange={(e) => {
                  if (e.target.checked) {
                    localStorage.setItem("systematic_hide_system_delete_warning", "true");
                  } else {
                    localStorage.removeItem("systematic_hide_system_delete_warning");
                  }
                }}
              />
              <label
                htmlFor={`dontAskAgain-${system.id}`}
                className="type-small text-muted/80 cursor-pointer select-none"
              >
                Don&apos;t ask me again
              </label>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="glass"
                className="flex-1"
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
              >
                No, Keep It
              </Button>
              <Button
                type="button"
                className="flex-1 bg-danger text-white hover:bg-danger/90 border-transparent shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
