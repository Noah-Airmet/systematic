"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FOUNDATIONAL_TIER_ID } from "@/lib/tiers";
import { useCanvasStore, CanvasState } from "@/lib/store";
import { SystemTier } from "@/lib/types";
import { useCanvasActions } from "./use-canvas-actions";
import { useState } from "react";
import { X } from "lucide-react";

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { ChevronLeft, GripVertical } from "lucide-react";

function SortableTier({ tier, idx, isFoundation, store, actions }: { tier: SystemTier, idx: number, isFoundation: boolean, store: CanvasState, actions: ReturnType<typeof useCanvasActions> }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: tier.id, disabled: isFoundation });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative overflow-hidden rounded-md border p-2 transition-[border-color,background-color,box-shadow] duration-300 ${isDragging
                ? 'border-accent ring-1 ring-accent shadow-glow bg-accent/5 opacity-80'
                : 'border-white/5 bg-glass-strong hover:border-white/20'
                }`}
        >
            <div className="flex items-center gap-2">
                <div
                    className={`flex h-7 min-w-7 flex-shrink-0 items-center justify-center rounded-md transition-colors ${!isFoundation ? 'cursor-grab active:cursor-grabbing hover:bg-white/10 text-muted/60 hover:text-foreground' : 'text-transparent'}`}
                    {...(isFoundation ? {} : listeners)}
                    {...(isFoundation ? {} : attributes)}
                >
                    <GripVertical size={14} />
                </div>

                <span className="type-label text-accent/70 font-bold bg-accent/10 px-1.5 py-0.5 rounded touch-none flex-shrink-0">
                    T{idx + 1}
                </span>

                <Input
                    value={tier.name}
                    onChange={(e) =>
                        store.setTiers(
                            store.tiers.map((t: SystemTier) => (t.id === tier.id ? { ...t, name: e.target.value } : t)),
                        )
                    }
                    onBlur={(e) => {
                        const updated = store.tiers.map((t: SystemTier) => (t.id === tier.id ? { ...t, name: e.target.value } : t));
                        void actions.persistTiers(updated);
                    }}
                    onPointerDown={(e) => {
                        // Prevent dragging when clicking inside the input
                        e.stopPropagation();
                    }}
                    className="h-7 bg-transparent border-transparent px-1 focus:bg-black/20 focus:border-accent/50 text-[13px] tracking-wide font-medium placeholder:text-muted/50 transition-all z-10 w-full"
                />
            </div>
            {isFoundation && (
                <div className="type-small text-[10px] text-muted/60 absolute bottom-1 right-2 pointer-events-none">
                    Pinned Base
                </div>
            )}
        </div>
    );
}

function DefinitionsSection() {
    const store = useCanvasStore();
    const actions = useCanvasActions();
    const [showAddForm, setShowAddForm] = useState(false);
    const [expandedDefinitionId, setExpandedDefinitionId] = useState<string | null>(null);
    const [newTerm, setNewTerm] = useState("");
    const [newDefinition, setNewDefinition] = useState("");
    const [editingTerm, setEditingTerm] = useState("");
    const [editingDefinition, setEditingDefinition] = useState("");
    const [editingNotes, setEditingNotes] = useState("");

    const handleAddDefinition = async () => {
        if (newTerm.trim() && newDefinition.trim()) {
            await actions.createDefinition(newTerm.trim(), newDefinition.trim());
            setNewTerm("");
            setNewDefinition("");
            setShowAddForm(false);
        }
    };

    const handleExpandDefinition = (defId: string) => {
        const def = store.definitions?.find(d => d.id === defId);
        if (def) {
            setExpandedDefinitionId(defId);
            setEditingTerm(def.term);
            setEditingDefinition(def.definition);
            setEditingNotes(def.notes || "");
        }
    };

    const handleSaveEdit = async (defId: string) => {
        await actions.patchDefinition(defId, {
            term: editingTerm,
            definition: editingDefinition,
            notes: editingNotes,
        });
        setExpandedDefinitionId(null);
        setEditingTerm("");
        setEditingDefinition("");
        setEditingNotes("");
    };

    const handleCancelEdit = () => {
        setExpandedDefinitionId(null);
        setEditingTerm("");
        setEditingDefinition("");
        setEditingNotes("");
    };

    const handleDeleteDefinition = async (defId: string) => {
        await actions.deleteDefinition(defId);
    };

    const definitions = store.definitions || [];

    return (
        <div className="mt-8 pt-6 border-t border-border/30">
            <div className="flex items-center justify-between mb-3">
                <h3 className="type-label text-muted tracking-widest">Definitions</h3>
                <Button
                    type="button"
                    variant="glass"
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="h-6 px-2 text-xs"
                >
                    + Add
                </Button>
            </div>

            {showAddForm && (
                <div className="liquid-panel-strong rounded-lg p-3 mb-3 space-y-2">
                    <Input
                        placeholder="Term"
                        value={newTerm}
                        onChange={(e) => setNewTerm(e.target.value)}
                        className="h-8 text-sm bg-black/20 border-border/50 focus:border-accent/50"
                    />
                    <textarea
                        placeholder="Definition"
                        value={newDefinition}
                        onChange={(e) => setNewDefinition(e.target.value)}
                        rows={2}
                        className="w-full rounded-md bg-black/20 border border-border/50 px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/20 resize-none"
                    />
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleAddDefinition}
                            className="flex-1 h-7 text-xs bg-accent/10 text-accent border border-accent/20 hover:bg-accent hover:text-white transition-all"
                        >
                            Save
                        </Button>
                        <Button
                            type="button"
                            variant="glass"
                            onClick={() => {
                                setShowAddForm(false);
                                setNewTerm("");
                                setNewDefinition("");
                            }}
                            className="flex-1 h-7 text-xs"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                {definitions.map((def) => (
                    <div key={def.id}>
                        {expandedDefinitionId === def.id ? (
                            <div className="liquid-panel-strong rounded-lg p-3 space-y-2">
                                <Input
                                    value={editingTerm}
                                    onChange={(e) => setEditingTerm(e.target.value)}
                                    className="h-8 text-sm bg-black/20 border-border/50 focus:border-accent/50"
                                />
                                <textarea
                                    value={editingDefinition}
                                    onChange={(e) => setEditingDefinition(e.target.value)}
                                    rows={2}
                                    className="w-full rounded-md bg-black/20 border border-border/50 px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/20 resize-none"
                                />
                                <textarea
                                    placeholder="Notes (optional)"
                                    value={editingNotes}
                                    onChange={(e) => setEditingNotes(e.target.value)}
                                    rows={2}
                                    className="w-full rounded-md bg-black/20 border border-border/50 px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/20 resize-none"
                                />
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => handleSaveEdit(def.id)}
                                        className="flex-1 h-7 text-xs bg-accent/10 text-accent border border-accent/20 hover:bg-accent hover:text-white transition-all"
                                    >
                                        Save
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="glass"
                                        onClick={handleCancelEdit}
                                        className="flex-1 h-7 text-xs"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={() => handleExpandDefinition(def.id)}
                                className="liquid-panel-strong rounded-lg p-3 space-y-1 cursor-pointer hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-semibold text-foreground">{def.term}</p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            void handleDeleteDefinition(def.id);
                                        }}
                                        className="flex-shrink-0 text-muted hover:text-danger transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                                <p className="text-xs text-muted line-clamp-2">
                                    {def.definition.length > 50
                                        ? `${def.definition.substring(0, 50)}...`
                                        : def.definition}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {definitions.length === 0 && !showAddForm && (
                <p className="text-xs text-muted/60 text-center py-4">No definitions yet</p>
            )}
        </div>
    );
}

export function CanvasSidebar() {
    const store = useCanvasStore();
    const actions = useCanvasActions();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // 5px movement before drag starts, allows clicking inputs
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        store.setDraggingTierId(null);

        if (over && active.id !== over.id) {
            const oldIndex = store.tiers.findIndex(t => t.id === active.id);
            const newIndex = store.tiers.findIndex(t => t.id === over.id);

            // Only move if neither the source nor target is the foundational tier
            if (store.tiers[oldIndex].id !== FOUNDATIONAL_TIER_ID && store.tiers[newIndex].id !== FOUNDATIONAL_TIER_ID) {
                const nextTiers = arrayMove(store.tiers, oldIndex, newIndex);
                // Re-normalize order
                const normalized = nextTiers.map((t, index) => ({ ...t, order: index }));
                void actions.persistTiers(normalized);
                actions.reloadGraph();
            }
        }
    }

    return (
        <aside className="liquid-panel border-r border-border p-5 text-foreground flex flex-col h-full overflow-y-auto w-full min-w-0">
            <div className="mb-6 flex items-start justify-between gap-2">
                <div>
                    <h2 className="type-h2 bg-gradient-to-r from-accent to-accent/50 bg-clip-text text-transparent drop-shadow-sm">Systematic</h2>
                    <p className="type-small muted mt-1 font-medium tracking-wide">Structure your theology</p>
                </div>
                <button
                    type="button"
                    onClick={() => store.setSidebarCollapsed(true)}
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-muted hover:bg-white/10 hover:text-foreground transition-colors"
                    aria-label="Collapse sidebar"
                >
                    <ChevronLeft size={18} />
                </button>
            </div>

            <div className="mt-4 flex items-center justify-between group">
                <h3 className="type-h3 text-foreground/90 font-semibold tracking-tight">Tiers</h3>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button type="button" variant="glass" onClick={() => void actions.addTier()} className="h-6 w-6 p-0 rounded-full">
                        +
                    </Button>
                    <Button type="button" variant="glass" onClick={() => void actions.removeTier()} className="h-6 w-6 p-0 rounded-full hover:bg-danger hover:text-white focus:ring-1 focus:ring-danger">
                        -
                    </Button>
                </div>
            </div>

            <div className="mt-3 flex flex-col gap-2">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={(e) => store.setDraggingTierId(String(e.active.id))}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={store.tiers.map(t => t.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {store.tiers.map((tier, idx) => (
                            <SortableTier
                                key={tier.id}
                                tier={tier}
                                idx={idx}
                                isFoundation={tier.id === FOUNDATIONAL_TIER_ID}
                                store={store}
                                actions={actions}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>

            <DefinitionsSection />
        </aside>
    );
}
