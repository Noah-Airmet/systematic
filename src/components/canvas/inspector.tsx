"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { VALIDATOR_DISCLAIMER } from "@/lib/constants";
import { FOUNDATIONAL_TIER_ID } from "@/lib/tiers";
import { useCanvasStore } from "@/lib/store";
import { useCanvasActions } from "./use-canvas-actions";
import { RefObject } from "react";
import { ReactFlowInstance } from "reactflow";

type Props = {
    flowRef: RefObject<HTMLDivElement | null>;
    flowInstanceRef: RefObject<ReactFlowInstance | null>;
};

export function NodeInspector({ flowRef, flowInstanceRef }: Props) {
    const store = useCanvasStore();
    const actions = useCanvasActions();

    const selectedNode = store.nodes.find((n) => n.id === store.selectedNodeId) ?? null;

    if (!store.inspectorOpen) {
        return null;
    }

    return (
        <aside className="liquid-panel border-l border-border p-5 text-foreground flex flex-col h-full overflow-y-auto w-[360px]">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="type-h2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Inspector</h2>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="primary"
                        className="bg-accent text-accent-foreground hover:bg-accent/80 transition-colors shadow-glow"
                        onClick={() => {
                            const instance = flowInstanceRef.current;
                            const bounds = flowRef.current?.getBoundingClientRect();
                            if (!instance || !bounds) return;
                            const center = instance.screenToFlowPosition({
                                x: bounds.left + bounds.width / 2,
                                y: bounds.top + bounds.height / 2
                            });
                            void actions.createNode(center.x, center.y);
                        }}
                    >
                        + Node
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        className="border-border bg-glass hover:bg-border transition-colors"
                        onClick={() => store.setInspectorOpen(false)}
                    >
                        Close
                    </Button>
                </div>
            </div>

            {!selectedNode ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted">
                    <p className="type-body">Select a node to edit its theology, add citations, and run validation.</p>
                </div>
            ) : (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300 flex-1">
                    <div className="type-kicker text-accent/80 tracking-widest">
                        {selectedNode.data.tier_id === FOUNDATIONAL_TIER_ID ? "Core Truth" : "Theological Doctrine"}
                    </div>

                    <div className="space-y-1.5">
                        <label className="type-label text-muted">Title</label>
                        <Input
                            value={String(selectedNode.data.title ?? "")}
                            onChange={(e) => store.updateNodeData(selectedNode.id, { title: e.target.value })}
                            onBlur={(e) => void actions.patchNode(selectedNode.id, { title: e.target.value })}
                            className="bg-glass-strong border-border/50 focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all font-medium"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="type-label text-muted">Confidence Level</label>
                        <Select
                            value={selectedNode.data.confidence ?? ""}
                            onChange={(e) => {
                                const conf = (e.target.value || null) as "settled" | "exploring" | "troubled" | null;
                                store.updateNodeData(selectedNode.id, { confidence: conf });
                                void actions.patchNode(selectedNode.id, { confidence: conf });
                            }}
                            className="w-full bg-glass-strong border-border/50 focus:border-accent text-sm"
                        >
                            <option value="">Not set</option>
                            <option value="settled">Settled</option>
                            <option value="exploring">Exploring</option>
                            <option value="troubled">Troubled</option>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="type-label text-muted">Tags (Comma separated)</label>
                        <Input
                            value={selectedNode.data.tags?.join(", ") ?? ""}
                            placeholder="e.g. eschatology, priesthood"
                            onChange={(e) => {
                                const tagsList = e.target.value.split(",").map(t => t.trim()).filter(t => t.length > 0);
                                store.updateNodeData(selectedNode.id, { tags: tagsList });
                            }}
                            onBlur={(e) => {
                                const tagsList = e.target.value.split(",").map(t => t.trim()).filter(t => t.length > 0);
                                void actions.patchNode(selectedNode.id, { tags: tagsList.length ? tagsList : null });
                            }}
                            className="bg-glass-strong border-border/50 text-sm"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="type-label text-muted">Description / Premise</label>
                        <Textarea
                            value={String(selectedNode.data.description ?? "")}
                            rows={4}
                            onChange={(e) => store.updateNodeData(selectedNode.id, { description: e.target.value })}
                            onBlur={(e) => void actions.patchNode(selectedNode.id, { description: e.target.value })}
                            className="bg-glass-strong border-border/50 focus:border-accent text-sm leading-relaxed resize-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="type-label text-muted">Notes & Citations</label>
                        <Textarea
                            value={String(selectedNode.data.notes ?? "")}
                            rows={3}
                            onChange={(e) => store.updateNodeData(selectedNode.id, { notes: e.target.value })}
                            onBlur={(e) => void actions.patchNode(selectedNode.id, { notes: e.target.value })}
                            className="bg-glass-strong border-border/50 focus:border-accent text-sm leading-relaxed resize-none"
                        />
                    </div>

                    <div className="pt-2">
                        <Button
                            type="button"
                            onClick={() => void actions.validateNode(selectedNode.id)}
                            className="w-full justify-center bg-accent text-accent-foreground hover:bg-accent/80 hover:shadow-glow transition-all font-semibold"
                        >
                            Analyze Consistency with AI
                        </Button>
                    </div>

                    {selectedNode.data.validation_status && (
                        <div className={`mt-4 liquid-panel-strong p-4 rounded-md border-l-4 ${selectedNode.data.validation_status === 'contradiction' ? 'border-l-danger' : selectedNode.data.validation_status === 'warning' ? 'border-l-yellow-500' : 'border-l-green-500'}`}>
                            <div className="type-kicker mb-2 flex items-center gap-2">
                                <span className={
                                    selectedNode.data.validation_status === 'contradiction' ? 'text-danger' :
                                        selectedNode.data.validation_status === 'warning' ? 'text-yellow-500' : 'text-green-500'
                                }>
                                    ●
                                </span>
                                {String(selectedNode.data.validation_status).toUpperCase()}
                            </div>
                            <p className="type-body text-[13px] leading-relaxed text-foreground/90">{String(selectedNode.data.validation_critique ?? "")}</p>
                            <p className="type-small mt-3 text-[10px] text-muted border-t border-border/50 pt-2">{VALIDATOR_DISCLAIMER}</p>
                        </div>
                    )}

                    <div className="pt-8 mb-4">
                        <Button
                            type="button"
                            variant="primary"
                            className="w-full bg-danger/10 text-danger border border-danger/20 hover:bg-danger hover:text-white transition-colors"
                            disabled={Boolean(selectedNode.data.is_locked)}
                            onClick={() => void actions.deleteNode(selectedNode.id)}
                        >
                            Delete Node
                        </Button>
                    </div>
                </div>
            )}
        </aside>
    );
}
