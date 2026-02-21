import { create } from "zustand";
import {
    Connection,
    Edge,
    EdgeChange,
    Node,
    NodeChange,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge as rfAddEdge,
} from "reactflow";
import { EdgeRow, NodeRow, RelationshipType, SystemTier } from "./types";
import { FOUNDATIONAL_TIER_ID } from "./tiers";

export type CanvasNodeData = {
    title: string;
    description: string;
    notes: string;
    tier_id: string;
    is_locked: boolean;
    confidence: "settled" | "exploring" | "troubled" | null;
    scripture_refs: { book: string; chapter: string; verse: string }[] | null;
    tags: string[] | null;
    validation_status: string | null;
    validation_critique: string | null;
};

export type CanvasState = {
    // Data
    systemId: string | null;
    systemTitle: string | null;
    tiers: SystemTier[];
    nodes: Node<CanvasNodeData>[];
    edges: Edge[];

    // UI State
    saveState: string;
    error: string | null;
    selectedNodeId: string | null;
    pendingConnection: Connection | null;
    relationshipType: RelationshipType;
    draggingTierId: string | null;
    inspectorOpen: boolean;
    showTensionMap: boolean;

    // Actions
    init: (systemId: string, title: string, initialTiers: SystemTier[], initialNodes: Node<CanvasNodeData>[], initialEdges: Edge[]) => void;
    setTiers: (tiers: SystemTier[]) => void;
    setSaveState: (state: string) => void;
    setError: (error: string | null) => void;
    setSelectedNodeId: (id: string | null) => void;
    setPendingConnection: (conn: Connection | null) => void;
    setRelationshipType: (type: RelationshipType) => void;
    setDraggingTierId: (id: string | null) => void;
    setInspectorOpen: (open: boolean) => void;
    setShowTensionMap: (show: boolean) => void;

    // React Flow handlers
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;

    // Mutators
    addNode: (node: Node<CanvasNodeData>) => void;
    updateNodeData: (id: string, data: Partial<CanvasNodeData>) => void;
    removeNode: (id: string) => void;
    addEdge: (edge: Edge) => void;
    removeEdge: (id: string) => void;
};

export function toFlowNodes(rows: NodeRow[], _tiers?: SystemTier[]): Node<CanvasNodeData>[] {
    return rows.map((node) => ({
        id: node.id,
        type: node.tier_id === FOUNDATIONAL_TIER_ID ? "foundation" : "doctrine",
        position: { x: node.x_position, y: node.y_position },
        draggable: node.tier_id !== FOUNDATIONAL_TIER_ID,
        data: {
            title: node.title,
            description: node.description,
            notes: node.notes,
            tier_id: node.tier_id,
            is_locked: node.is_locked,
            confidence: node.confidence,
            scripture_refs: node.scripture_refs,
            tags: node.tags,
            validation_status: node.validation_status,
            validation_critique: node.validation_critique,
        },
    }));
}

export function toFlowEdges(rows: EdgeRow[]): Edge[] {
    return rows.map((edge) => ({
        id: edge.id,
        source: edge.source_node_id,
        target: edge.target_node_id,
        label: edge.relationship_type,
        data: { relationship_type: edge.relationship_type },
    }));
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
    systemId: null,
    systemTitle: null,
    tiers: [],
    nodes: [],
    edges: [],
    saveState: "Saved",
    error: null,
    selectedNodeId: null,
    pendingConnection: null,
    relationshipType: "supports",
    draggingTierId: null,
    inspectorOpen: false,
    showTensionMap: false,

    init: (systemId, title, initialTiers, initialNodes, initialEdges) => set({
        systemId,
        systemTitle: title,
        tiers: initialTiers,
        nodes: initialNodes,
        edges: initialEdges
    }),

    setTiers: (tiers) => set({ tiers }),
    setSaveState: (saveState) => set({ saveState }),
    setError: (error) => set({ error }),
    setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),
    setPendingConnection: (pendingConnection) => set({ pendingConnection }),
    setRelationshipType: (relationshipType) => set({ relationshipType }),
    setDraggingTierId: (draggingTierId) => set({ draggingTierId }),
    setInspectorOpen: (inspectorOpen) => set({ inspectorOpen }),
    setShowTensionMap: (showTensionMap) => set({ showTensionMap }),

    onNodesChange: (changes) => {
        set({ nodes: applyNodeChanges(changes, get().nodes) as Node<CanvasNodeData>[] });
    },
    onEdgesChange: (changes) => {
        set({ edges: applyEdgeChanges(changes, get().edges) });
        // Note: Deletions should trigger API deletes via a separate hook/effect
    },

    addNode: (node) => set({ nodes: [...get().nodes, node] }),
    updateNodeData: (id, data) => set({
        nodes: get().nodes.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n)
    }),
    removeNode: (id) => set({
        nodes: get().nodes.filter(n => n.id !== id),
        selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId
    }),
    addEdge: (edge) => set({ edges: rfAddEdge(edge, get().edges) }),
    removeEdge: (id) => set({ edges: get().edges.filter(e => e.id !== id) })
}));
