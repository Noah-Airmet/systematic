import {
    ArgumentQualifier,
    ConfidenceLevel,
    EpistemicSource,
    InferenceType,
    Presuppositions,
    RelationshipType,
    ScriptureRef,
} from "../types";

export interface TemplateNode {
    id: string; // Used internally for edge mapping
    tier_id: string; // Must map to a valid SystemTier name (e.g. "Doctrine", "Application", "Foundational Dogma")
    title: string;
    description: string;
    notes?: string;
    confidence?: ConfidenceLevel;
    scripture_refs?: ScriptureRef[];
    tags?: string[];
    is_locked?: boolean;
    x_position: number;
    y_position: number;
    grounds?: string;
    warrant?: string;
    backing?: string;
    qualifier?: ArgumentQualifier | null;
    rebuttal?: string;
    epistemic_sources?: EpistemicSource[];
}

export interface TemplateEdge {
    source_node_id: string; // Refers to TemplateNode.id
    target_node_id: string; // Refers to TemplateNode.id
    relationship_type: RelationshipType;
    inference_type?: InferenceType | null;
}

export interface TemplateDefinition {
    term: string;
    definition: string;
    notes?: string;
    linked_nodes?: string[]; // Array of TemplateNode.id to attach this definition to
}

export interface SystemTemplate {
    id: string;
    name: string;
    description: string;
    author: string;
    presuppositions: Presuppositions;
    nodes: TemplateNode[];
    edges: TemplateEdge[];
    definitions?: TemplateDefinition[];
}

import { brighamYoungTemplate } from "./brigham-young";
import { nauvooTemplate } from "./nauvoo";
import { blakeOstlerTemplate } from "./blake-ostler";

export const TEMPLATES: Record<string, SystemTemplate> = {
    [brighamYoungTemplate.id]: brighamYoungTemplate,
    [nauvooTemplate.id]: nauvooTemplate,
    [blakeOstlerTemplate.id]: blakeOstlerTemplate,
};
