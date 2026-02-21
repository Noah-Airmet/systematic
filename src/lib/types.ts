export type TierId = string;

export type ArgumentQualifier =
  | "necessarily"
  | "probably"
  | "presumably"
  | "possibly"
  | "in_most_cases";

export type InferenceType =
  | "deductive"
  | "inductive"
  | "abductive"
  | "analogical"
  | "exegetical";

export type EpistemicSource =
  | "canonical_scripture"
  | "general_conference"
  | "historical_primary_source"
  | "philosophical_argument"
  | "personal_revelation"
  | "logical_deduction"
  | "scholarly_consensus";

export type DefinitionRow = {
  id: string;
  system_id: string;
  term: string;
  definition: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type SystemTier = {
  id: TierId;
  name: string;
  order?: number;
  is_foundational?: boolean;
};

export type RelationshipType =
  | "supports"
  | "relies_upon"
  | "contradicts"
  | "qualifies";

export type ValidationRating = "consistent" | "warning" | "contradiction";

export type PresuppositionMode = "position" | "undecided" | "not_foundational";

export type PresuppositionAnswer =
  | { mode: "position"; value: string }
  | { mode: "undecided" }
  | { mode: "not_foundational" };

export type Presuppositions = Record<string, PresuppositionAnswer>;

export type SystemRow = {
  id: string;
  user_id: string;
  title: string;
  presuppositions: Presuppositions;
  tiers: SystemTier[];
  created_at: string;
  updated_at: string;
};

export type ConfidenceLevel = "settled" | "exploring" | "troubled" | null;

export type ScriptureRef = { book: string; chapter: string; verse: string };

export type NodeRow = {
  id: string;
  system_id: string;
  tier_id: TierId;
  title: string;
  description: string;
  notes: string;
  confidence: ConfidenceLevel;
  scripture_refs: ScriptureRef[] | null;
  tags: string[] | null;
  is_locked: boolean;
  x_position: number;
  y_position: number;
  validation_status: ValidationRating | null;
  validation_critique: string | null;
  grounds: string;
  warrant: string;
  backing: string;
  qualifier: ArgumentQualifier | null;
  rebuttal: string;
  epistemic_sources: EpistemicSource[];
  created_at: string;
  updated_at: string;
};

export type EdgeRow = {
  id: string;
  system_id: string;
  source_node_id: string;
  target_node_id: string;
  relationship_type: RelationshipType;
  inference_type: InferenceType | null;
  created_at: string;
};
