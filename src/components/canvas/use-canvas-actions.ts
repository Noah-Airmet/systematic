import { useCallback } from "react";
import { NodeRow, SystemTier, InferenceType } from "@/lib/types";
import { addCustomTier, buildTierBands, FOUNDATIONAL_TIER_ID, moveTierToIndex, normalizeSystemTiers, removeTopCustomTier, tierFromY } from "@/lib/tiers";
import { useCanvasStore, toFlowNodes, toFlowEdges } from "@/lib/store";
import { Connection } from "reactflow";

export function useCanvasActions() {
    const store = useCanvasStore();

    const reloadGraph = useCallback(async () => {
        if (!store.systemId) return;
        const response = await fetch(`/api/systems/${store.systemId}`);
        const data = await response.json();
        if (!response.ok) {
            store.setError(data.error ?? "Failed to refresh graph");
            return;
        }
        const nextTiers = normalizeSystemTiers(data.system.tiers);
        store.setTiers(nextTiers);
        // Since we do layout at the top level on load, simple map here is fine
        store.init(store.systemId, store.systemTitle || "", nextTiers, toFlowNodes(data.nodes || [], nextTiers), toFlowEdges(data.edges || []), store.presuppositions);
    }, [store]);

    const persistTiers = useCallback(async (next: SystemTier[]) => {
        if (!store.systemId) return false;
        const normalized = normalizeSystemTiers(next);
        store.setTiers(normalized);
        store.setSaveState("Saving...");

        const response = await fetch(`/api/systems/${store.systemId}/tiers`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tiers: normalized }),
        });
        const data = await response.json();
        if (!response.ok) {
            store.setError(data.error ?? "Failed to update tiers");
            store.setSaveState("Save failed");
            return false;
        }
        store.setTiers(normalizeSystemTiers(data.system.tiers));
        store.setSaveState("Saved");
        return true;
    }, [store]);

    const createNode = useCallback(async (x: number, y: number) => {
        if (!store.systemId) return;
        store.setSaveState("Saving...");
        const response = await fetch("/api/nodes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                system_id: store.systemId,
                tier_id: tierFromY(y, store.tiers),
                title: "New node",
                description: "",
                notes: "",
                x_position: x,
                y_position: y,
            }),
        });
        const data = await response.json();
        if (!response.ok) {
            store.setError(data.error ?? "Failed to create node");
            store.setSaveState("Save failed");
            return;
        }
        const newNode = data.node as NodeRow;
        store.addNode({
            id: newNode.id,
            type: newNode.tier_id === FOUNDATIONAL_TIER_ID ? "foundation" : "doctrine",
            position: { x: newNode.x_position, y: newNode.y_position },
            draggable: newNode.tier_id !== FOUNDATIONAL_TIER_ID,
            data: {
                title: newNode.title,
                description: newNode.description,
                notes: newNode.notes,
                tier_id: newNode.tier_id,
                is_locked: newNode.is_locked,
                confidence: newNode.confidence,
                scripture_refs: newNode.scripture_refs,
                tags: newNode.tags,
                validation_status: newNode.validation_status,
                validation_critique: newNode.validation_critique,
                grounds: newNode.grounds ?? "",
                warrant: newNode.warrant ?? "",
                backing: newNode.backing ?? "",
                qualifier: newNode.qualifier ?? null,
                rebuttal: newNode.rebuttal ?? "",
                epistemic_sources: newNode.epistemic_sources ?? [],
            },
        });
        store.setSelectedNodeId(newNode.id);
        store.setInspectorOpen(true);
        store.setSaveState("Saved");
    }, [store]);

    const addFoundationalNode = useCallback(async () => {
        if (!store.systemId) return;
        store.setSaveState("Saving...");
        const response = await fetch("/api/nodes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                system_id: store.systemId,
                tier_id: FOUNDATIONAL_TIER_ID,
                title: "New core truth",
                description: "",
                notes: "",
                x_position: 0,
                y_position: 0,
            }),
        });
        const data = await response.json();
        if (!response.ok) {
            store.setError(data.error ?? "Failed to create foundational node");
            store.setSaveState("Save failed");
            return;
        }
        await reloadGraph();
        store.setSelectedNodeId(data.node.id);
        store.setInspectorOpen(true);
        store.setSaveState("Saved");
    }, [store, reloadGraph]);



    const deleteNode = useCallback(async (nodeId: string) => {
        store.setSaveState("Saving...");
        store.setNodeToDelete(null); // Clear pending delete state

        // Optimistic UI update - immediately remove the node visually
        store.removeNode(nodeId);

        const response = await fetch(`/api/nodes/${nodeId}`, { method: "DELETE" });
        if (!response.ok) {
            const data = await response.json();
            store.setError(data.error ?? "Failed to delete node");
            store.setSaveState("Save failed");
            // If it failed, reload graph to restore the deleted node
            await reloadGraph();
            return;
        }
        await reloadGraph();
        store.setSaveState("Saved");
    }, [store, reloadGraph]);

    const requestNodeDeletion = useCallback((nodeId: string) => {
        const node = store.nodes.find(n => n.id === nodeId);
        if (!node) return;

        const hideWarning = localStorage.getItem("systematic_hide_delete_warning") === "true";
        const isNodeEmpty =
            (node.data.title === "New node" || node.data.title === "New core truth" || !node.data.title) &&
            !node.data.description &&
            !node.data.notes &&
            !node.data.grounds &&
            !node.data.warrant &&
            !node.data.backing &&
            !node.data.rebuttal;

        if (hideWarning || isNodeEmpty) {
            void deleteNode(nodeId);
        } else {
            store.setNodeToDelete(nodeId);
        }
    }, [store, deleteNode]);


    const patchNode = useCallback(async (nodeId: string, patch: Record<string, unknown>) => {
        store.setSaveState("Saving...");
        const response = await fetch(`/api/nodes/${nodeId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patch),
        });
        const data = await response.json();
        if (!response.ok) {
            store.setError(data.error ?? "Failed to update node");
            store.setSaveState("Save failed");
            return;
        }
        store.updateNodeData(nodeId, {
            ...patch,
            ...(data.node.validation_status !== undefined ? {
                validation_status: data.node.validation_status,
                validation_critique: data.node.validation_critique
            } : {})
        });
        store.setSaveState("Saved");
    }, [store]);

    const moveNodeToTier = useCallback(async (nodeId: string, tierId: string) => {
        const bands = buildTierBands(store.tiers, store.tierHeight);
        const targetBand = bands.find((b) => b.id === tierId);
        if (!targetBand) return;

        const newY = targetBand.yCenter;

        // Optimistically update ReactFlow
        store.onNodesChange([
            { id: nodeId, type: "position", position: { x: store.nodes.find(n => n.id === nodeId)?.position.x ?? 0, y: newY } }
        ]);

        // Update exact data tracking
        store.updateNodeData(nodeId, { tier_id: tierId });

        // Persist to DB
        await patchNode(nodeId, {
            tier_id: tierId,
            y_position: newY
        });
    }, [store, patchNode]);

    const persistEdge = useCallback(async (connection: Connection) => {
        if (!connection.source || !connection.target || !store.systemId) return;
        store.setSaveState("Saving...");
        const response = await fetch("/api/edges", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                system_id: store.systemId,
                source_node_id: connection.source,
                target_node_id: connection.target,
                relationship_type: store.relationshipType,
                inference_type: store.inferenceType,
            }),
        });
        const data = await response.json();
        if (!response.ok) {
            store.setError(data.error ?? "Failed to create edge");
            store.setSaveState("Save failed");
            return;
        }
        const inferenceType = store.inferenceType;
        store.addEdge({
            id: data.edge.id,
            source: connection.source,
            target: connection.target,
            label: inferenceType
                ? `${store.relationshipType} · ${inferenceType}`
                : store.relationshipType,
            data: {
                relationship_type: store.relationshipType,
                inference_type: inferenceType,
            },
        });
        store.setSaveState("Saved");
    }, [store]);

    const patchEdge = useCallback(async (edgeId: string, inferenceType: InferenceType | null) => {
        store.setSaveState("Saving...");
        const response = await fetch(`/api/edges/${edgeId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ inference_type: inferenceType }),
        });
        const data = await response.json();
        if (!response.ok) {
            store.setError(data.error ?? "Failed to update edge");
            store.setSaveState("Save failed");
            return;
        }
        store.updateEdgeData(edgeId, {
            inference_type: data.edge.inference_type,
            relationship_type: data.edge.relationship_type,
        });
        store.setSaveState("Saved");
    }, [store]);

    const deleteEdge = useCallback(async (edgeId: string) => {
        const response = await fetch(`/api/edges/${edgeId}`, { method: "DELETE" });
        if (!response.ok) {
            const data = await response.json();
            store.setError(data.error ?? "Failed to delete edge");
            return;
        }
        // Deletion is already optimistically handled by ReactFlow UI on edges change,
        // but we might want to ensure it's removed if this is called manually.
        store.removeEdge(edgeId);
    }, [store]);

    // === Definition Actions ===

    const loadDefinitions = useCallback(async () => {
        if (!store.systemId) return;
        const response = await fetch(`/api/definitions?system_id=${store.systemId}`);
        const data = await response.json();
        if (response.ok) {
            store.setDefinitions(data.definitions ?? []);
        }
    }, [store]);

    const createDefinition = useCallback(async (term: string, definition: string, notes?: string) => {
        if (!store.systemId) return;
        store.setSaveState("Saving...");
        const response = await fetch("/api/definitions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                system_id: store.systemId,
                term,
                definition,
                notes,
            }),
        });
        const data = await response.json();
        if (!response.ok) {
            store.setError(data.error ?? "Failed to create definition");
            store.setSaveState("Save failed");
            return;
        }
        store.addDefinition(data.definition);
        store.setSaveState("Saved");
    }, [store]);

    const patchDefinition = useCallback(async (definitionId: string, patch: Record<string, unknown>) => {
        store.setSaveState("Saving...");
        const response = await fetch(`/api/definitions/${definitionId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patch),
        });
        const data = await response.json();
        if (!response.ok) {
            store.setError(data.error ?? "Failed to update definition");
            store.setSaveState("Save failed");
            return;
        }
        store.updateDefinition(definitionId, data.definition);
        store.setSaveState("Saved");
    }, [store]);

    const deleteDefinition = useCallback(async (definitionId: string) => {
        if (!window.confirm("Delete this definition? It will be unlinked from all nodes.")) return;
        const response = await fetch(`/api/definitions/${definitionId}`, { method: "DELETE" });
        if (!response.ok) {
            const data = await response.json();
            store.setError(data.error ?? "Failed to delete definition");
            return;
        }
        store.removeDefinition(definitionId);
    }, [store]);

    const linkDefinition = useCallback(async (nodeId: string, definitionId: string) => {
        const response = await fetch("/api/node-definitions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ node_id: nodeId, definition_id: definitionId }),
        });
        if (!response.ok) {
            const data = await response.json();
            store.setError(data.error ?? "Failed to link definition");
        }
    }, [store]);

    const unlinkDefinition = useCallback(async (nodeId: string, definitionId: string) => {
        const response = await fetch("/api/node-definitions", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ node_id: nodeId, definition_id: definitionId }),
        });
        if (!response.ok) {
            const data = await response.json();
            store.setError(data.error ?? "Failed to unlink definition");
        }
    }, [store]);

    // === Tier Actions ===

    const addTier = useCallback(async () => {
        const next = addCustomTier(store.tiers);
        const ok = await persistTiers(next);
        if (ok) await reloadGraph();
    }, [store.tiers, persistTiers, reloadGraph]);

    const removeTier = useCallback(async () => {
        const removed = removeTopCustomTier(store.tiers);
        if (!removed) {
            store.setError("No removable custom tier remains.");
            return;
        }
        const impacted = store.nodes.filter((node) => node.data.tier_id === removed.removedTierId);
        await Promise.all(
            impacted.map((node) =>
                fetch(`/api/nodes/${node.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ tier_id: removed.targetTierId }),
                })
            )
        );
        const ok = await persistTiers(removed.tiers);
        if (ok) await reloadGraph();
    }, [store, persistTiers, reloadGraph]);

    const validateNode = useCallback(async (nodeId: string) => {
        if (!store.systemId) return;
        store.setSaveState("Validating...");
        const response = await fetch("/api/validate-node", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ node_id: nodeId, system_id: store.systemId }),
        });
        const data = await response.json();
        if (!response.ok) {
            store.setError(data.error ?? "Validation failed");
            store.setSaveState("Save failed");
            return;
        }
        store.updateNodeData(nodeId, {
            validation_status: data.rating,
            validation_critique: data.critique,
        });
        store.setSaveState("Saved");
    }, [store]);

    const handleTierDrop = useCallback(async (targetTierId: string) => {
        if (!store.draggingTierId || store.draggingTierId === targetTierId) return;
        const custom = store.tiers.filter((tier) => tier.id !== FOUNDATIONAL_TIER_ID);
        const targetIndex = custom.findIndex((tier) => tier.id === targetTierId);
        if (targetIndex < 0) return;
        const next = moveTierToIndex(store.tiers, store.draggingTierId, targetIndex);
        const ok = await persistTiers(next);
        if (ok) await reloadGraph();
    }, [store.draggingTierId, store.tiers, persistTiers, reloadGraph]);

    const patchSystemTitle = useCallback(async (title: string) => {
        if (!store.systemId) return;
        store.setSaveState("Saving...");
        const response = await fetch(`/api/systems/${store.systemId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title }),
        });
        const data = await response.json();
        if (!response.ok) {
            store.setError(data.error ?? "Failed to update system title");
            store.setSaveState("Save failed");
            return;
        }
        store.setSystemTitle(data.system.title);
        store.setSaveState("Saved");
    }, [store]);

    return {
        reloadGraph,
        persistTiers,
        createNode,
        addFoundationalNode,
        moveNodeToTier,
        deleteNode,
        requestNodeDeletion,
        patchNode,
        persistEdge,
        patchEdge,
        deleteEdge,
        addTier,
        removeTier,
        validateNode,
        handleTierDrop,
        patchSystemTitle,
        // Definitions
        loadDefinitions,
        createDefinition,
        patchDefinition,
        deleteDefinition,
        linkDefinition,
        unlinkDefinition,
    };
}
