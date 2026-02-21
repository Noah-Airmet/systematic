import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { TEMPLATES } from "@/lib/templates";

// Make sure we use absolute imports if needed, NextRequest is from next/server, not next/next/server
import { v4 as uuidv4 } from "uuid";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: systemId } = await params;

    try {
        const supabase = await createSupabaseServerClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { templateId } = body;

        const template = TEMPLATES[templateId];

        if (!template) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        // 1. Fetch system to ensure it exists and belongs to user
        const { data: system, error: systemError } = await supabase
            .from("systems")
            .select("id, tiers, presuppositions")
            .eq("id", systemId)
            .eq("user_id", user.id)
            .single();

        if (systemError || !system) {
            return NextResponse.json({ error: "System not found" }, { status: 404 });
        }

        // Create a mapping of old IDs to new UUIDs
        const idMap: Record<string, string> = {};
        for (const node of template.nodes) {
            idMap[node.id] = uuidv4();
        }

        // 2. Fetch or resolve Tier IDs
        // The template uses tier names (e.g. "Doctrine", "Application", "Foundational Dogma") in tier_id field to make definitions easier
        // We need to map these to the actual UUIDs in the system's tiers array.

        // We have system.tiers which looks like: [{ id: '...', name: 'Doctrine' }, ...]
        const tierMap: Record<string, string> = {};
        if (system.tiers) {
            for (const tier of system.tiers) {
                tierMap[tier.name] = tier.id;
            }
        }

        // 3. Prepare Nodes for Bulk Insert
        const defaultTierId = system.tiers?.[0]?.id || "unknown"; // Fallback

        const nodesToInsert = template.nodes.map(node => ({
            id: idMap[node.id],
            system_id: systemId,
            tier_id: tierMap[node.tier_id] || defaultTierId, // Map name to real UUID
            title: node.title,
            description: node.description,
            notes: node.notes || "",
            confidence: node.confidence || null,
            scripture_refs: node.scripture_refs || null,
            tags: node.tags || null,
            is_locked: node.is_locked || false,
            x_position: node.x_position,
            y_position: node.y_position,
            grounds: node.grounds || "",
            warrant: node.warrant || "",
            backing: node.backing || "",
            qualifier: node.qualifier || null,
            rebuttal: node.rebuttal || "",
            epistemic_sources: node.epistemic_sources || []
        }));

        // 4. Prepare Edges for Bulk Insert
        const edgesToInsert = template.edges.map(edge => ({
            system_id: systemId,
            source_node_id: idMap[edge.source_node_id],
            target_node_id: idMap[edge.target_node_id],
            relationship_type: edge.relationship_type,
            inference_type: edge.inference_type || null
        }));

        // 5. Update System Presuppositions
        const mergedPresuppositions = {
            ...system.presuppositions,
            ...template.presuppositions,
        };

        const { error: updateError } = await supabase
            .from("systems")
            .update({ presuppositions: mergedPresuppositions, updated_at: new Date().toISOString() })
            .eq("id", systemId);

        if (updateError) throw updateError;

        // 6. Insert Nodes
        if (nodesToInsert.length > 0) {
            const { error: nodesError } = await supabase.from("nodes").insert(nodesToInsert);
            if (nodesError) throw nodesError;
        }

        // 7. Insert Edges
        if (edgesToInsert.length > 0) {
            const { error: edgesError } = await supabase.from("edges").insert(edgesToInsert);
            if (edgesError) throw edgesError;
        }

        // 8. Insert Definitions
        if (template.definitions && template.definitions.length > 0) {
            // We need to map definitions and node definitions
            for (const def of template.definitions) {
                const defId = uuidv4();

                // Insert the literal definition
                const { error: defError } = await supabase.from("definitions").insert({
                    id: defId,
                    system_id: systemId,
                    term: def.term,
                    definition: def.definition,
                    notes: def.notes || "",
                });

                if (defError) throw defError;

                // Map the definitions to the node definitions join table
                if (def.linked_nodes && def.linked_nodes.length > 0) {
                    const nodeDefsToInsert = def.linked_nodes.map(oldNodeId => ({
                        node_id: idMap[oldNodeId],
                        definition_id: defId
                    }));

                    const { error: ndError } = await supabase.from("node_definitions").insert(nodeDefsToInsert);
                    if (ndError) throw ndError;
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Template apply error:", error);
        return NextResponse.json(
            { error: error.message || "An unexpected error occurred" },
            { status: 500 }
        );
    }
}
