import { useCallback } from "react";
import { EdgeRow, NodeRow, SystemTier } from "@/lib/types";
import { addCustomTier, FOUNDATIONAL_TIER_ID, moveTierToIndex, normalizeSystemTiers, removeTopCustomTier, tierFromY } from "@/lib/tiers";
import { useCanvasStore } from "@/lib/store";
import { Connection } from "reactflow";

function toFlowNodes(rows: NodeRow[], tiers: SystemTier[]) {
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

function toFlowEdges(rows: EdgeRow[]) {
    return rows.map((edge) => ({
        id: edge.id,
        source: edge.source_node_id,
        target: edge.target_node_id,
        label: edge.relationship_type,
        data: { relationship_type: edge.relationship_type },
    }));
}

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
        store.init(store.systemId, store.systemTitle || "", nextTiers, toFlowNodes(data.nodes || [], nextTiers), toFlowEdges(data.edges || []));
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
            },
        });
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
        store.setSaveState("Saved");
    }, [store, reloadGraph]);

    const deleteNode = useCallback(async (nodeId: string) => {
        if (!window.confirm("Delete this node and its edges?")) return;
        store.setSaveState("Saving...");
        const response = await fetch(`/api/nodes/${nodeId}`, { method: "DELETE" });
        if (!response.ok) {
            const data = await response.json();
            store.setError(data.error ?? "Failed to delete node");
            store.setSaveState("Save failed");
            return;
        }
        await reloadGraph();
        store.setSaveState("Saved");
    }, [store, reloadGraph]);

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
            }),
        });
        const data = await response.json();
        if (!response.ok) {
            store.setError(data.error ?? "Failed to create edge");
            store.setSaveState("Save failed");
            return;
        }
        store.addEdge({
            id: data.edge.id,
            source: connection.source,
            target: connection.target,
            label: store.relationshipType,
            data: { relationship_type: store.relationshipType },
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
        for (const node of impacted) {
            await fetch(`/api/nodes/${node.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tier_id: removed.targetTierId }),
            });
        }
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

    return {
        reloadGraph,
        persistTiers,
        createNode,
        addFoundationalNode,
        deleteNode,
        patchNode,
        persistEdge,
        deleteEdge,
        addTier,
        removeTier,
        validateNode,
        handleTierDrop,
    };
}
