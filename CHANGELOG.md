# Changelog

All notable changes to Systematic will be documented here.

---

## [0.6.0] — 2026-02-20 — Philosophical Rigor

### Overview
A major feature release focused on giving users the tools to build genuinely rigorous systematic theologies, modeled on the structured argumentation found in Reformed and Catholic theological traditions.

### New Features

#### Toulmin Argument Structure (Nodes)
Nodes now support the full Toulmin model of argumentation. Under a new collapsible "Deepen Argument" section in the inspector, users can fill in:
- **Grounds** — the evidence or data supporting the claim
- **Warrant** — the logical principle connecting grounds to the claim
- **Backing** — support for the warrant itself
- **Qualifier** — confidence level (necessarily, probably, presumably, possibly, tentatively, by exception)
- **Rebuttal** — known exceptions or counterarguments

The qualifier, when set, is displayed as a badge on doctrine nodes on the canvas.

#### Epistemic Source Tracking (Nodes)
A new "Epistemic Sources" section in the inspector lets users tag what *kind* of evidence backs a node, using pill-toggle multi-select:
- Canonical Scripture
- General Conference
- Scripture (LDS Standard Works)
- Prophetic Teaching
- Theological Reasoning
- Historical Record
- Comparative Religion
- Personal Revelation

#### Definition Registry (System-Level)
A new Definitions section in the sidebar lets users maintain a glossary of terms for their theological system. Definitions can be:
- Created and edited in the sidebar
- Linked to specific nodes via a "Key Terms" section in the inspector
- Linked definitions appear as removable pills on the node

#### Inference Type Classification (Edges)
When connecting two nodes, users can now classify the logical relationship type:
- Deductive
- Inductive
- Abductive
- Analogical
- Exegetical

The inference type is shown in the edge label alongside the relationship type.

#### Enhanced AI Validator
The node validation prompt now performs 6-dimensional analysis:
1. Internal coherence with connected nodes
2. Argument soundness (Toulmin structure completeness)
3. Inference validity (appropriateness of edge inference types)
4. Qualifier/confidence alignment
5. Definitional consistency (linked definitions vs. node content)
6. Epistemic source adequacy

#### Export
Definitions are now included in the system JSON export.

### Database Changes
Run migration: `supabase/migrations/20260222_v0_6_philosophical_rigor.sql`

- New PostgreSQL enums: `argument_qualifier`, `inference_type`
- New columns on `nodes`: `grounds`, `warrant`, `backing`, `qualifier`, `rebuttal`, `epistemic_sources`
- New column on `edges`: `inference_type`
- New table: `definitions` (with RLS)
- New table: `node_definitions` join table (with RLS, cascade deletes)

### Files Changed
- `src/lib/types.ts` — new types for all new domain concepts
- `src/lib/schemas.ts` — new Zod schemas and enums
- `src/lib/store.ts` — definitions state, inferenceType UI state, updateEdgeData mutator
- `src/lib/invalidation.ts` — Toulmin fields trigger validation clearing
- `src/app/api/edges/[id]/route.ts` — added PATCH handler
- `src/app/api/definitions/route.ts` — new (GET, POST)
- `src/app/api/definitions/[id]/route.ts` — new (PATCH, DELETE)
- `src/app/api/node-definitions/route.ts` — new (GET, POST, DELETE)
- `src/app/api/validate-node/route.ts` — upgraded 6-dimensional prompt
- `src/app/api/systems/[id]/export/route.ts` — includes definitions in export
- `src/components/canvas/use-canvas-actions.ts` — definition CRUD actions, patchEdge
- `src/components/canvas/system-canvas.tsx` — inference type select in edge modal
- `src/components/canvas/inspector.tsx` — Toulmin accordion, epistemic sources, key terms
- `src/components/canvas/sidebar.tsx` — definitions management section
- `src/components/canvas/nodes.tsx` — qualifier badge on DoctrineNode

---

## [0.5.0] and earlier

Initial build. Core canvas with nodes, edges, relationship types, validation, and system management.
