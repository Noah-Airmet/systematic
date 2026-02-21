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
import { DefinitionRow, EdgeRow, InferenceType, NodeRow, RelationshipType, SystemTier, Presuppositions } from "./types";
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
    // Toulmin argument fields
    grounds: string;
    warrant: string;
    backing: string;
    qualifier: "necessarily" | "probably" | "presumably" | "possibly" | "in_most_cases" | null;
    rebuttal: string;
    // Epistemic sources
    epistemic_sources: string[];
};

export type CanvasState = {
    // Data
    systemId: string | null;
    systemTitle: string | null;
    tiers: SystemTier[];
    nodes: Node<CanvasNodeData>[];
    edges: Edge[];
    definitions: DefinitionRow[];
    presuppositions: Presuppositions;

    // UI State
    saveState: string;
    error: string | null;
    selectedNodeId: string | null;
    pendingConnection: Connection | null;
    relationshipType: RelationshipType;
    inferenceType: InferenceType | null;
    draggingTierId: string | null;
    inspectorOpen: boolean;
    sidebarWidth: number;
    sidebarCollapsed: boolean;

    // Actions
    init: (systemId: string, title: string, initialTiers: SystemTier[], initialNodes: Node<CanvasNodeData>[], initialEdges: Edge[], presuppositions: Presuppositions) => void;
    setTiers: (tiers: SystemTier[]) => void;
    setSaveState: (state: string) => void;
    setError: (error: string | null) => void;
    setSelectedNodeId: (id: string | null) => void;
    setPendingConnection: (conn: Connection | null) => void;
    setRelationshipType: (type: RelationshipType) => void;
    setInferenceType: (type: InferenceType | null) => void;
    setDraggingTierId: (id: string | null) => void;
    setInspectorOpen: (open: boolean) => void;
    setSidebarWidth: (width: number) => void;
    setSidebarCollapsed: (collapsed: boolean) => void;

    // Definitions
    setDefinitions: (definitions: DefinitionRow[]) => void;
    addDefinition: (definition: DefinitionRow) => void;
    updateDefinition: (id: string, data: Partial<DefinitionRow>) => void;
    removeDefinition: (id: string) => void;

    // React Flow handlers
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;

    // Mutators
    addNode: (node: Node<CanvasNodeData>) => void;
    updateNodeData: (id: string, data: Partial<CanvasNodeData>) => void;
    removeNode: (id: string) => void;
    addEdge: (edge: Edge) => void;
    updateEdgeData: (id: string, data: Record<string, unknown>) => void;
    removeEdge: (id: string) => void;
};

export function toFlowNodes(rows: NodeRow[], _tiers?: SystemTier[]): Node<CanvasNodeData>[] {
    return rows.map((node) => ({
        id: node.id,
        type: node.tier_id === FOUNDATIONAL_TIER_ID ? "foundation" : "doctrine",
        position: { x: node.x_position, y: node.y_position },
        draggable: true,
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
            grounds: node.grounds ?? "",
            warrant: node.warrant ?? "",
            backing: node.backing ?? "",
            qualifier: node.qualifier ?? null,
            rebuttal: node.rebuttal ?? "",
            epistemic_sources: node.epistemic_sources ?? [],
        },
    }));
}

export function toFlowEdges(rows: EdgeRow[]): Edge[] {
    return rows.map((edge) => ({
        id: edge.id,
        source: edge.source_node_id,
        target: edge.target_node_id,
        label: edge.inference_type
            ? `${edge.relationship_type} · ${edge.inference_type}`
            : edge.relationship_type,
        data: {
            relationship_type: edge.relationship_type,
            inference_type: edge.inference_type,
        },
    }));
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
    systemId: null,
    systemTitle: null,
    tiers: [],
    nodes: [],
    edges: [],
    definitions: [],
    presuppositions: {},
    saveState: "Saved",
    error: null,
    selectedNodeId: null,
    pendingConnection: null,
    relationshipType: "supports",
    inferenceType: null,
    draggingTierId: null,
    inspectorOpen: false,
    sidebarWidth: 280,
    sidebarCollapsed: false,

    init: (systemId, title, initialTiers, initialNodes, initialEdges, presuppositions) => set({
        systemId,
        systemTitle: title,
        tiers: initialTiers,
        nodes: initialNodes,
        edges: initialEdges,
        presuppositions
    }),

    setTiers: (tiers) => set({ tiers }),
    setSaveState: (saveState) => set({ saveState }),
    setError: (error) => set({ error }),
    setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),
    setPendingConnection: (pendingConnection) => set({ pendingConnection }),
    setRelationshipType: (relationshipType) => set({ relationshipType }),
    setInferenceType: (inferenceType) => set({ inferenceType }),
    setDraggingTierId: (draggingTierId) => set({ draggingTierId }),
    setInspectorOpen: (inspectorOpen) => set({ inspectorOpen }),
    setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),
    setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

    // Definitions
    setDefinitions: (definitions) => set({ definitions }),
    addDefinition: (definition) => set({ definitions: [...get().definitions, definition] }),
    updateDefinition: (id, data) => set({
        definitions: get().definitions.map(d => d.id === id ? { ...d, ...data } : d)
    }),
    removeDefinition: (id) => set({ definitions: get().definitions.filter(d => d.id !== id) }),

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
    updateEdgeData: (id, data) => set({
        edges: get().edges.map(e => e.id === id ? { ...e, data: { ...e.data, ...data }, label: data.inference_type ? `${e.data?.relationship_type} · ${data.inference_type}` : e.data?.relationship_type } : e)
    }),
    removeEdge: (id) => set({ edges: get().edges.filter(e => e.id !== id) })
}));
