"use client";

import "reactflow/dist/style.css";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  ReactFlowInstance,
  useStore,
  ConnectionMode
} from "reactflow";
import { EdgeRow, InferenceType, NodeRow, RelationshipType, SystemRow } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { buildTierBands, FOUNDATIONAL_TIER_ID, tierFromY } from "@/lib/tiers";
import { useCanvasStore, CanvasNodeData, toFlowNodes, toFlowEdges } from "@/lib/store";
import { useCanvasActions } from "./use-canvas-actions";
import { canvasNodeTypes } from "./nodes";
import { NodeInspector } from "./inspector";
import { CanvasSidebar } from "./sidebar";
import { DynamicEdge } from "./dynamic-edge";

const edgeTypes = { default: DynamicEdge };
import { applyFoundationalLayout, foundationPosition } from "@/lib/foundation-layout";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 480;

function SidebarResizeHandle() {
  const store = useCanvasStore();
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(280);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      startXRef.current = e.clientX;
      startWidthRef.current = store.sidebarWidth;
    },
    [store.sidebarWidth]
  );

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      const delta = e.clientX - startXRef.current;
      const next = Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, startWidthRef.current + delta));
      store.setSidebarWidth(next);
    };
    const onUp = () => setIsDragging(false);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging, store]);

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      className="absolute top-1/2 z-10 flex h-14 w-3 -translate-y-1/2 cursor-col-resize items-center justify-center touch-none"
      style={{ right: -6 }}
      onMouseDown={onMouseDown}
    >
      <div
        className={[
          "h-11 w-2.5 rounded-full border border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-150",
          "bg-gradient-to-b from-white/15 to-white/05",
          "hover:border-white/35 hover:from-white/25 hover:to-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.08)]",
          isDragging && "scale-95 border-white/40 from-white/25 to-white/15 ring-2 ring-white/25 shadow-[0_0_24px_rgba(255,255,255,0.12)]",
        ]
          .filter(Boolean)
          .join(" ")}
      />
    </div>
  );
}

type Props = {
  system: SystemRow;
  nodes: NodeRow[];
  edges: EdgeRow[];
};


function TierBackgrounds() {
  const store = useCanvasStore();
  const tierBands = useMemo(() => buildTierBands(store.tiers, store.tierHeight), [store.tiers, store.tierHeight]);
  const transform = useStore((s) => s.transform);

  const [tx, ty, tZoom] = transform;

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div
        className="absolute origin-top-left"
        style={{ transform: `translate(${tx}px, ${ty}px) scale(${tZoom})` }}
      >
        {tierBands.map((tier) => {
          const textX = (-tx + 32) / tZoom;

          return (
            <div
              key={tier.id}
              className="absolute items-center border-b border-white/5 transition-[height,top]"
              style={{
                left: -50000,
                width: 100000,
                top: tier.yMin,
                height: tier.yMax - tier.yMin,
                background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.01))'
              }}
            >
              <div
                className="absolute bottom-4 type-label text-sm text-white/40 font-bold tracking-[0.2em]"
                style={{ left: 50000 + textX, transform: `scale(${1 / tZoom})`, transformOrigin: 'bottom left' }}
              >
                {tier.name.toUpperCase()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CanvasInner({ system, nodes, edges }: Props) {
  const store = useCanvasStore();
  const actions = useCanvasActions();

  const flowRef = useRef<HTMLDivElement>(null);
  const flowInstanceRef = useRef<ReactFlowInstance | null>(null);

  useEffect(() => {
    // Initial load
    const laidOutNodes = applyFoundationalLayout(nodes, system.tiers, 250);
    store.init(
      system.id,
      system.title,
      system.tiers,
      toFlowNodes(laidOutNodes, system.tiers, 250),
      toFlowEdges(edges),
      system.presuppositions
    );
    // Load definitions for this system
    void actions.loadDefinitions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sidebarCol = store.sidebarCollapsed ? "0" : `${store.sidebarWidth}px`;
  const gridCols = store.inspectorOpen ? `${sidebarCol} 1fr 360px` : `${sidebarCol} 1fr`;

  // If store not loaded yet, don't render graph
  if (!store.systemId) return <div className="h-screen w-screen bg-background flex justify-center items-center text-accent animate-pulse">Loading Theology...</div>;

  return (
    <div className="grid h-screen overflow-hidden bg-background text-foreground" style={{ gridTemplateColumns: gridCols }}>
      <div
        className="relative flex overflow-hidden"
        style={{ minWidth: store.sidebarCollapsed ? 0 : store.sidebarWidth }}
      >
        {!store.sidebarCollapsed && (
          <>
            <CanvasSidebar />
            <SidebarResizeHandle />
          </>
        )}
      </div>

      <div className="relative h-full" ref={flowRef}>
        {store.sidebarCollapsed && (
          <button
            type="button"
            onClick={() => store.setSidebarCollapsed(false)}
            className="absolute left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-glass-strong text-white/80 shadow-glow hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight size={18} />
          </button>
        )}
        {/* Sleek Toolbar */}
        <div className="liquid-panel absolute left-6 right-6 top-6 z-20 flex items-center justify-between rounded-xl px-5 py-3 transition-all">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors"
              title="Back to Systems"
            >
              <ChevronLeft size={20} />
            </Link>
            <h1 className="type-h3 font-semibold tracking-tight text-white drop-shadow-sm">{store.systemTitle}</h1>
            <span className="type-small rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold tracking-widest text-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
              {store.saveState.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="glass"
              onClick={() => {
                const instance = flowInstanceRef.current;
                if (!instance || !flowRef.current) return;
                const rect = flowRef.current.getBoundingClientRect();
                const { x, y } = instance.screenToFlowPosition({
                  x: rect.left + rect.width / 2,
                  y: rect.top + rect.height / 2,
                });
                void actions.createNode(x, y);
              }}
            >
              Add node
            </Button>
            <Link href={`/systems/${store.systemId}/onboarding`}>
              <Button type="button" variant="glass">
                Framework Settings
              </Button>
            </Link>
            <a href={`/api/systems/${store.systemId}/export`}>
              <Button type="button" variant="secondary" className="bg-white text-black hover:bg-white/90 border-transparent font-medium transition-all shadow-glow">
                Export System
              </Button>
            </a>
          </div>
        </div>

        {store.error ? (
          <div className="absolute left-1/2 -translate-x-1/2 top-24 z-30 max-w-[400px] animate-in slide-in-from-top-4 fade-in rounded-lg border border-danger/50 bg-danger/20 px-4 py-3 shadow-glow shadow-danger/40 backdrop-blur-md text-sm text-white">
            <span className="font-bold mr-2 text-danger">ERROR:</span>{store.error}
            <button className="absolute top-2 right-2 text-white/50 hover:text-white" onClick={() => store.setError(null)}>✕</button>
          </div>
        ) : null}

        {/* Dynamic Canvas Tier Backgrounds rendered inside ReactFlowProvider */}
        <TierBackgrounds />

        <ReactFlow
          nodes={store.nodes}
          edges={store.edges}
          nodeTypes={canvasNodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          onNodesChange={(changes) => {
            const removeChanges = changes.filter(c => c.type === "remove");
            const otherChanges = changes.filter(c => c.type !== "remove");

            if (removeChanges.length > 0) {
              removeChanges.forEach(c => {
                if (c.id) {
                  void actions.requestNodeDeletion(c.id);
                }
              });
            }
            if (otherChanges.length > 0) {
              store.onNodesChange(otherChanges);
            }
          }}
          onEdgesChange={(changes) => {
            store.onEdgesChange(changes);
            const removed = changes.find((change) => change.type === "remove");
            if (removed?.id) {
              void actions.deleteEdge(removed.id);
            }
          }}
          onNodeDrag={(_, node) => {
            if ((node.data as CanvasNodeData).tier_id === FOUNDATIONAL_TIER_ID) {
              // Get all foundational nodes
              const foundationals = store.nodes.filter(n => n.data.tier_id === FOUNDATIONAL_TIER_ID);
              if (foundationals.length === 0) return;

              // Sort them dynamically by their current 2D position, including the one currently dragged
              const sorted = [...foundationals].sort((a, b) => {
                const ax = a.id === node.id ? node.position.x : a.position.x;
                const ay = a.id === node.id ? node.position.y : a.position.y;
                const bx = b.id === node.id ? node.position.x : b.position.x;
                const by = b.id === node.id ? node.position.y : b.position.y;
                const rowDiff = ay - by;
                if (Math.abs(rowDiff) > 50) return rowDiff;
                return ax - bx;
              });

              // Apply the calculated layout dynamically
              const updates = sorted.map((n, index) => {
                const ideal = foundationPosition(index, foundationals.length, store.tiers, store.tierHeight);
                if (n.id === node.id) return null; // Let the dragged node be governed by the cursor
                if (n.position.x === ideal.x && n.position.y === ideal.y) return null;
                return { id: n.id, type: "position" as const, position: { x: ideal.x, y: ideal.y } };
              }).filter(Boolean) as any[];

              if (updates.length > 0) {
                store.onNodesChange(updates);
              }
            }
          }}
          onNodeDragStart={(_, node) => store.setSelectedNodeId(node.id)}
          onNodeDragStop={(_, node) => {
            if ((node.data as CanvasNodeData).tier_id === FOUNDATIONAL_TIER_ID) {
              // Finalize positions on drop
              const foundationals = store.nodes.filter(n => n.data.tier_id === FOUNDATIONAL_TIER_ID);
              const sorted = [...foundationals].sort((a, b) => {
                const rowDiff = a.position.y - b.position.y;
                if (Math.abs(rowDiff) > 50) return rowDiff;
                return a.position.x - b.position.x;
              });

              const positionUpdates = sorted.map((n, index) => {
                const ideal = foundationPosition(index, foundationals.length, store.tiers, store.tierHeight);
                return { id: n.id, type: "position" as const, position: { x: ideal.x, y: ideal.y } };
              });

              store.onNodesChange(positionUpdates);

              // Persist all foundational nodes
              sorted.forEach((n, index) => {
                const ideal = foundationPosition(index, foundationals.length, store.tiers, store.tierHeight);
                void actions.patchNode(n.id, { x_position: ideal.x, y_position: ideal.y, tier_id: FOUNDATIONAL_TIER_ID });
              });
              return;
            }
            void actions.patchNode(node.id, {
              x_position: node.position.x,
              y_position: node.position.y,
              tier_id: tierFromY(node.position.y, store.tiers, store.tierHeight),
            });
          }}
          onNodeClick={(_, node) => {
            store.setSelectedNodeId(node.id);
            store.setInspectorOpen(true);
          }}
          onPaneClick={(event) => {
            store.setSelectedNodeId(null);
            store.setInspectorOpen(false);
            if (event.detail === 2) {
              const instance = flowInstanceRef.current;
              if (!instance) return;
              const position = instance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
              void actions.createNode(position.x, position.y);
            }
          }}
          onConnect={(connection) => store.setPendingConnection(connection)}
          onInit={(instance) => {
            flowInstanceRef.current = instance;

            // Determine horizontal bounds of existing nodes
            const currentNodes = instance.getNodes();
            let minX = -400;
            let maxX = 400;

            if (currentNodes.length > 0) {
              minX = Math.min(...currentNodes.map(n => n.position.x));
              maxX = Math.max(...currentNodes.map(n => n.position.x + 320)); // Assume ~320px node width
            }

            // Create target bounds that guarantee all tiers are visible while maintaining node readability
            const boundsWidth = Math.max(maxX - minX + 200, 1000);
            const centerX = (minX + maxX) / 2;

            const targetBounds = {
              x: centerX - boundsWidth / 2,
              y: -40,
              width: boundsWidth,
              height: 900 // Reduced canvas height + padding
            };

            // Start slightly zoomed out and above for a "drop in" effect
            instance.setViewport({ x: (typeof window !== 'undefined' ? window.innerWidth : 1200) / 2, y: -100, zoom: 0.3 });

            // Smoothly animate to the correct framing with a more cinematic, slower pace
            setTimeout(() => {
              instance.fitBounds(targetBounds, { duration: 2400 });
            }, 50);
          }}
          selectionOnDrag={false}
          selectNodesOnDrag={false}
          multiSelectionKeyCode={null}
          selectionKeyCode={null}
          panOnDrag
          nodesDraggable
          minZoom={0.2}
          maxZoom={1.5}
          defaultEdgeOptions={{
            style: { stroke: "rgba(255, 255, 255, 0.25)", strokeWidth: 2 },
            labelStyle: { fill: "#f8fafc", fontSize: 10, fontWeight: 600 },
            labelBgStyle: { fill: "rgba(10, 10, 12, 0.9)", stroke: "rgba(255, 255, 255, 0.15)", strokeWidth: 1, rx: 4, ry: 4 },
            labelBgPadding: [6, 4]
          }}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="rgba(255,255,255,0.06)" />
          <Controls position="bottom-left" className="bg-glass-strong border-border/50 shadow-glow rounded-md overflow-hidden" />
        </ReactFlow>

        {/* Edge Connection Modal Overlay */}
        {store.pendingConnection ? (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="liquid-panel-strong w-[320px] rounded-xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.8)] border-accent/30 scale-in-95 animate-in duration-200">
              <h3 className="type-h3 mb-1 text-white">Connect Protocol</h3>
              <p className="type-small muted mb-5">Define the theological relationship between these concepts.</p>

              <label className="type-label text-muted/80 mb-1 block">Theological Relationship</label>
              <Select
                value={store.relationshipType}
                onChange={(event) => store.setRelationshipType(event.target.value as RelationshipType)}
                className="mb-4 w-full bg-black/40 border-accent/40 focus:border-accent text-white"
              >
                <option value="supports">Supports (builds upon)</option>
                <option value="relies_upon">Relies Upon (requires)</option>
                <option value="contradicts">Contradicts (tensions)</option>
                <option value="qualifies">Qualifies (adds nuance)</option>
              </Select>

              <label className="type-label text-muted/80 mb-1 block">Inference Type <span className="text-muted/50">(optional)</span></label>
              <Select
                value={store.inferenceType ?? ""}
                onChange={(event) => store.setInferenceType((event.target.value || null) as InferenceType | null)}
                className="mb-6 w-full bg-black/40 border-accent/40 focus:border-accent text-white"
              >
                <option value="">Not specified</option>
                <option value="deductive">Deductive (must follow)</option>
                <option value="inductive">Inductive (probably follows)</option>
                <option value="abductive">Abductive (best explanation)</option>
                <option value="analogical">Analogical (parallel case)</option>
                <option value="exegetical">Exegetical (from text)</option>
              </Select>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="glass" onClick={() => { store.setPendingConnection(null); store.setInferenceType(null); }}>
                  Cancel
                </Button>
                <Button type="button" className="bg-accent text-accent-foreground hover:bg-accent/80 shadow-glow" onClick={() => {
                  if (store.pendingConnection) void actions.persistEdge(store.pendingConnection);
                  store.setPendingConnection(null);
                  store.setInferenceType(null);
                }}>
                  Establish Link
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Delete Confirmation Modal Overlay */}
        {store.nodeToDelete ? (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="liquid-panel-strong w-[340px] rounded-xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.8)] border-danger/30 scale-in-95 animate-in duration-200">
              <h3 className="type-h3 mb-2 text-white flex items-center gap-2">
                <span className="text-danger">⚠️</span> Delete Node
              </h3>
              <p className="type-body text-muted mb-5">
                Are you sure you want to delete this node? All node data will be lost and any connected edges will be removed.
              </p>

              <div className="flex items-center gap-2 mb-6">
                <input
                  type="checkbox"
                  id="dontAskAgain"
                  className="rounded border-white/20 bg-black/40 text-danger focus:ring-danger/50 w-4 h-4 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.checked) {
                      localStorage.setItem("systematic_hide_delete_warning", "true");
                    } else {
                      localStorage.removeItem("systematic_hide_delete_warning");
                    }
                  }}
                />
                <label htmlFor="dontAskAgain" className="type-small text-muted/80 cursor-pointer select-none">
                  Don't ask me again
                </label>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="glass"
                  className="flex-1"
                  onClick={() => store.setNodeToDelete(null)}
                >
                  No, Keep It
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-danger text-white hover:bg-danger/90 border-transparent shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all"
                  onClick={() => {
                    const nodeId = store.nodeToDelete;
                    if (nodeId) void actions.deleteNode(nodeId);
                  }}
                >
                  Yes, Delete
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <NodeInspector flowRef={flowRef} flowInstanceRef={flowInstanceRef} />
    </div >
  );
}

export function SystemCanvas(props: Props) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}
