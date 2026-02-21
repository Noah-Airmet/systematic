import { z } from "zod";

const tierIdSchema = z.string().min(1).max(80);

const relationshipEnum = z.enum(["supports", "relies_upon", "contradicts", "qualifies"]);

export const argumentQualifierEnum = z.enum([
  "necessarily", "probably", "presumably", "possibly", "in_most_cases",
]);

export const inferenceTypeEnum = z.enum([
  "deductive", "inductive", "abductive", "analogical", "exegetical",
]);

export const epistemicSourceEnum = z.enum([
  "canonical_scripture", "general_conference", "historical_primary_source",
  "philosophical_argument", "personal_revelation", "logical_deduction",
  "scholarly_consensus",
]);

export const presuppositionAnswerSchema = z.union([
  z.object({ mode: z.literal("undecided") }),
  z.object({ mode: z.literal("not_foundational") }),
  z.object({ mode: z.literal("position"), value: z.string() }),
]);

export const presuppositionsSchema = z.record(z.string(), presuppositionAnswerSchema);

export const tierSchema = z.object({
  id: tierIdSchema,
  name: z.string().min(1).max(120),
  order: z.number().int().min(0).optional(),
  is_foundational: z.boolean().optional(),
});

export const createSystemSchema = z.object({
  title: z.string().min(1).max(120),
});

export const patchPresuppositionsSchema = z.object({
  presuppositions: presuppositionsSchema,
});

export const patchTiersSchema = z.object({
  tiers: z.array(tierSchema).min(1),
});

export const scriptureRefSchema = z.object({
  book: z.string().min(1),
  chapter: z.string().min(1),
  verse: z.string().min(1),
});

export const confidenceEnum = z.enum(["settled", "exploring", "troubled"]).nullable();

export const createNodeSchema = z.object({
  system_id: z.string().uuid(),
  tier_id: tierIdSchema,
  title: z.string().min(1).max(180),
  description: z.string().default(""),
  notes: z.string().default(""),
  confidence: confidenceEnum.default(null),
  scripture_refs: z.array(scriptureRefSchema).nullable().default(null),
  tags: z.array(z.string()).nullable().default(null),
  x_position: z.number(),
  y_position: z.number(),
  // Toulmin argument fields
  grounds: z.string().default(""),
  warrant: z.string().default(""),
  backing: z.string().default(""),
  qualifier: argumentQualifierEnum.nullable().default(null),
  rebuttal: z.string().default(""),
  // Epistemic sources
  epistemic_sources: z.array(epistemicSourceEnum).default([]),
});

export const patchNodeSchema = z.object({
  title: z.string().min(1).max(180).optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  confidence: confidenceEnum.optional(),
  scripture_refs: z.array(scriptureRefSchema).nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  x_position: z.number().optional(),
  y_position: z.number().optional(),
  tier_id: tierIdSchema.optional(),
  // Toulmin argument fields
  grounds: z.string().optional(),
  warrant: z.string().optional(),
  backing: z.string().optional(),
  qualifier: argumentQualifierEnum.nullable().optional(),
  rebuttal: z.string().optional(),
  // Epistemic sources
  epistemic_sources: z.array(epistemicSourceEnum).optional(),
});

export const createEdgeSchema = z.object({
  system_id: z.string().uuid(),
  source_node_id: z.string().uuid(),
  target_node_id: z.string().uuid(),
  relationship_type: relationshipEnum,
  inference_type: inferenceTypeEnum.nullable().default(null),
});

export const patchEdgeSchema = z.object({
  inference_type: inferenceTypeEnum.nullable().optional(),
});

// Definition schemas
export const createDefinitionSchema = z.object({
  system_id: z.string().uuid(),
  term: z.string().min(1).max(120),
  definition: z.string().min(1).max(2000),
  notes: z.string().max(1000).optional(),
});

export const patchDefinitionSchema = z.object({
  term: z.string().min(1).max(120).optional(),
  definition: z.string().min(1).max(2000).optional(),
  notes: z.string().max(1000).optional(),
});

// Node-definition link schema
export const nodeDefinitionLinkSchema = z.object({
  node_id: z.string().uuid(),
  definition_id: z.string().uuid(),
});

export const validateNodeRequestSchema = z.object({
  system_id: z.string().uuid(),
  node_id: z.string().uuid(),
});
