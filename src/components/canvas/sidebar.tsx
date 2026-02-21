import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FOUNDATIONAL_TIER_ID } from "@/lib/tiers";
import { useCanvasStore, CanvasState } from "@/lib/store";
import { SystemTier } from "@/lib/types";
import { useCanvasActions } from "./use-canvas-actions";

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

import { GripVertical } from "lucide-react";

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
                    className={`flex items-center justify-center p-1 rounded-md transition-colors ${!isFoundation ? 'cursor-grab active:cursor-grabbing hover:bg-white/10 text-muted/60 hover:text-foreground' : 'text-transparent'}`}
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
        <aside className="liquid-panel border-r border-border p-5 text-foreground flex flex-col h-full overflow-y-auto w-[280px]">
            <div className="mb-6">
                <h2 className="type-h2 bg-gradient-to-r from-accent to-accent/50 bg-clip-text text-transparent drop-shadow-sm">Systematic</h2>
                <p className="type-small muted mt-1 font-medium tracking-wide">Structure your theology</p>
            </div>

            <div className="mt-4 flex items-center justify-between group">
                <h3 className="type-h3 text-foreground/90 font-semibold tracking-tight">Tiers</h3>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button type="button" variant="secondary" onClick={() => void actions.addTier()} className="h-6 w-6 p-0 rounded-full bg-glass hover:bg-accent hover:text-white border-border/50 shadow-sm transition-all focus:ring-1 focus:ring-accent">
                        +
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => void actions.removeTier()} className="h-6 w-6 p-0 rounded-full bg-glass hover:bg-danger hover:text-white border-border/50 shadow-sm transition-all focus:ring-1 focus:ring-danger">
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

            <div className="mt-8 pt-6 border-t border-border/30">
                <h3 className="type-h3 mb-3 text-foreground/90 font-semibold tracking-tight">Core Truths</h3>
                <div className="grid grid-cols-2 gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        className="bg-accent/10 text-accent border border-accent/20 hover:bg-accent hover:text-white transition-all shadow-sm"
                        onClick={() => void actions.addFoundationalNode()}
                    >
                        + Core
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        className="bg-danger/10 text-danger border border-danger/20 hover:bg-danger hover:text-white transition-all shadow-sm"
                        disabled={
                            !store.selectedNodeId ||
                            store.nodes.find(n => n.id === store.selectedNodeId)?.data.tier_id !== FOUNDATIONAL_TIER_ID ||
                            Boolean(store.nodes.find(n => n.id === store.selectedNodeId)?.data.is_locked)
                        }
                        onClick={() => {
                            if (store.selectedNodeId) void actions.deleteNode(store.selectedNodeId);
                        }}
                    >
                        - Core
                    </Button>
                </div>
            </div>
        </aside>
    );
}
