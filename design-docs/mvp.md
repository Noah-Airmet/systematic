# Systematic — Minimum Viable Product (MVP)

**Version:** 0.4
**Last Updated:** February 20, 2026
**Parent Document:** prd.md v0.5

---

## Purpose

This document defines the smallest version of Systematic that delivers the core value proposition: **a user can build a theology graph on a tiered canvas and get AI-powered consistency feedback.** Everything else — templates, snapshots, tension maps, export variety — is deferred to post-MVP iterations. The goal is to validate the concept with real users as quickly as possible.

## Canonical MVP Contract

This document is the source of truth for MVP implementation details. Where PRD and MVP differ, build behavior follows this file.

Canonical contract for MVP:

- Data model source of truth: the schemas in this file's **Data Models (MVP)** section.
- Validator request payload:
  - `system_id`
  - `node` (id/title/description/notes/tier_id)
  - `neighbors` (1-degree connected nodes + edge relationship types)
  - `presuppositions` (excluding entries with `mode: "not_foundational"`)
- Validator response payload:
  - `rating`: `consistent | warning | contradiction`
  - `critique`: string (required)
  - `disclaimer`: fixed text, appended in UI: "This analysis reflects common philosophical and theological frameworks. It is not authoritative."
- Validation persistence contract:
  - Persist `validation_status` and `validation_critique` on the node.
  - Clear both fields whenever node title/description/notes, connected edges, or presuppositions change.

---

## What's In

### 1. Authentication

Simple auth so users can save their work and come back to it.

- Email/password signup and login via Supabase Auth.
- No OAuth, no social login. These are low-effort additions post-MVP but not needed to validate the core experience.

### 2. System Creation: Foundational Propositions + Presupposition Onboarding

This step is essential to MVP because both the locked nodes and the presupposition answers power the validator. Without them, the AI has no philosophical context to reason against.

**Foundational Propositions (Locked Nodes — all included in MVP):**

When a new System is created, five locked nodes are automatically placed in the Foundational Dogma tier. These cannot be deleted or moved to another tier. They are identical for every user and every system — they are the axioms:

1. God the Eternal Father is real.
2. Jesus Christ is the Son of God, the Savior and Redeemer of the world.
3. The Holy Ghost is real.
4. The Atonement of Jesus Christ is real.
5. The Gospel of Jesus Christ has been restored.

These nodes display a lock icon and are visually distinct from user-created nodes.

**Presupposition Questionnaire (MVP subset — 8 questions):**

The full PRD spec defines 20 questions across 6 domains. MVP ships with 8 questions — the ones most directly needed to give the Soft-Logic Validator meaningful context. The remaining 12 are deferred to v1.1.

Every question uses the **three-state response model** (all three states included in MVP — this is architecturally load-bearing, not a polish feature):

- **Position:** Slider active (0–100) with labeled poles. Validator treats this as a firm constraint.
- **Undecided:** User cares but hasn't settled it. Validator flags tensions as *unresolved* rather than ignoring them.
- **Not Foundational:** This axis doesn't constrain the user's system. Validator ignores all contradiction checks involving this question entirely.

The 8 MVP questions:

| # | Domain | Question |
|---|---|---|
| E3 | Epistemology | Prophetic Infallibility: Can prophets teach false doctrine officially? Fully fallibilist ↔ High inerrancy |
| M1 | Metaphysics | Theory of Time: A-Theory (dynamic present) ↔ B-Theory (block universe) |
| M3 | Metaphysics | Metaphysics of Creation: Creatio ex materia ↔ Creatio ex nihilo |
| T1 | Theology Proper | Nature of God: Embodied, relational, passible ↔ Classical Theism (immutable, impassible) |
| T3 | Theology Proper | Divine Omniscience: Open Theism ↔ Classical exhaustive foreknowledge |
| T5 | Theology Proper | Lorenzo Snow Couplet: Literal cosmological claim ↔ Metaphorical/aspirational |
| A2 | Anthropology | Agency: Libertarian free will ↔ Compatibilist free will |
| S1 | Soteriology | Atonement Mechanism: Ranked multi-select (Penal Substitution, Moral Influence, Christus Victor, Ransom, Solidarity) |

S1 ranking contract for MVP:

- User assigns an integer rank to each atonement model from 0 to 4.
- Ranks are unique (no ties).
- `4` is highest emphasis and `0` is lowest emphasis.

**Real-Time Contradiction Detection (MVP — top 5 pairs only):**

The full PRD contradiction matrix has 10+ pairs. MVP checks the 5 most critical — these are the pairings most likely to affect a new user's first session:

| Pair | Severity |
|---|---|
| M1: B-Theory (high) + T3: Open Theism (high) | Hard Contradiction |
| T1: Classical Theism (high) + T3: Open Theism (high) | Hard Contradiction |
| M3: Creatio ex nihilo (high) + T5: Lorenzo Snow Couplet — literal (high) | Warning |
| T1: Classical Theism / Immutability (high) + T5: Lorenzo Snow Couplet — literal (high) | Hard Contradiction |
| T3: Exhaustive Foreknowledge (high) + A2: Libertarian Free Will (high) | Warning |

Checks are suppressed for any question set to "Not Foundational." Warnings appear inline between the two relevant questions — non-blocking, persistent until resolved.

Presuppositions are stored as JSONB on the System record and are editable anytime from a System Settings panel.

### 3. The Canvas

The canvas is the product. Without it, there's no product. But it can be simpler than the full vision.

- Infinite canvas powered by React Flow with pan, zoom, and minimap.
- Inverted triangle design rendered as a static background SVG with 4 default tiers (Foundational Dogma → Official Doctrine → Theological Deduction → Personal Speculation).
- Tiers are **not** customizable in MVP (no renaming, reordering, or resizing). The 4 defaults are fixed.
- No guided walkthrough tooltips. Instead, a single dismissible "Getting Started" modal on first load with a short explanation of the tier metaphor and how to create nodes.

### 4. Node Management

- Create nodes by double-clicking on the canvas. Node is placed in whatever tier the click falls within.
- Node detail side-panel with: Title (required), Description (plaintext textarea), and Notes (plaintext textarea for citations and references).
- No confidence levels, no structured scripture references, no tags. These are valuable but not needed to test the core loop.
- Nodes can be dragged to reposition. Dragging a node across a tier boundary reassigns it to the new tier.
- Delete node (with confirmation dialog, since it also removes connected edges).

### 5. Edge Management

- Create edges by clicking and dragging from one node's port to another.
- Edge type selection from a dropdown: Supports, Relies Upon, Contradicts, Qualifies.
- No freetext edge labels.
- Delete edge (click to select, then delete key or context menu).

### 6. Soft-Logic Validator (Node-Level Only)

This is the feature that makes Systematic more than just a mind-mapping tool. Even a basic version validates the concept.

- "Validate" button on the node detail side-panel.
- On click: the app constructs a JSON payload containing the target node, its directly connected nodes (1 degree of separation only — simpler than the 2-degree spec in the full PRD), and the system's presupposition values.
- API route sends the payload to Claude Sonnet 4 via Vercel AI SDK.
- Response displayed in the side-panel: consistency rating (Consistent / Warning / Contradiction) and a brief text critique.
- Visual indicator on the node after validation: green checkmark, yellow warning icon, or red X. Persists on the canvas until the node is edited (which clears the cached result).
- No system-wide audit. No missing-connection suggestions. No user flagging of results.
- Rate limiting: max 20 validations per user per day (prevents runaway API costs during early testing).

### 7. Persistence

- All state (systems, nodes, edges, positions, presuppositions, cached validation results) saved to Supabase PostgreSQL.
- Auto-save on every meaningful action (node create/edit/move, edge create/delete, presupposition change) with a debounced write (500ms after last action).
- Simple dashboard on login: list of the user's Systems with title and last-modified date. Click to open.

### 8. Export (Minimal)

- JSON export only: full system dump (nodes, edges, presuppositions, tiers, positions) as a downloadable .json file.
- No import, no PNG, no PDF, no Markdown. JSON export exists primarily as a data safety net so early users don't feel locked in.

---

## What's Out (Deferred to Post-MVP)

| Feature | Why It's Deferred |
|---|---|
| OAuth (Google/Apple) | Nice-to-have; email/password is sufficient to test |
| Custom/reorderable tiers | Adds UI complexity; fixed tiers test the core metaphor |
| Remaining 12 presupposition questions | MVP ships 8 of 20; remaining questions added in v1.1 post-validation |
| Custom presuppositions | Needs UI for dynamic form generation; not needed for validation |
| Node confidence levels | Visual polish, not core loop |
| Structured scripture references | Requires specialized input UI; plaintext notes suffice |
| Tags & filtering | Discovery feature, not creation feature |
| Freetext edge labels | Enum types are sufficient for MVP connections |
| Cross-tier dashed edge styling | Visual polish |
| Guided walkthrough tooltips | Single modal is enough for early adopters |
| Starter nodes from presuppositions | Requires LLM call or curated content; manual start is fine for v1 |
| System-wide audit | Expensive, complex chunking logic; node-level proves the concept |
| Missing connection suggestions | Requires full-graph awareness; deferred |
| Tension map overlay | Requires cached validation data across all nodes |
| Templates & starter systems | Requires content curation; blank canvas is fine for early users |
| Snapshots & versioning | Requires snapshot diffing UI; adds storage complexity |
| PNG/SVG/PDF/Markdown export | JSON covers data portability; rich exports are polish |
| JSON import | Can add once export format is validated and stable |
| Mobile view | Desktop-first; canvas interaction doesn't translate to mobile |
| Collaboration / sharing | Explicitly v2+; single-player validates the concept |
| Community template gallery | Requires user base first |
| Comparison mode | Requires multi-system loading |
| Offline/PWA | Requires service worker architecture |

---

## Non-Goals (MVP Guardrails)

To prevent scope creep during build, these are explicit non-goals for MVP:

- No system-wide audit or graph-wide AI chunking.
- No collaboration/sharing links/permissions model.
- No template marketplace or user publishing.
- No import pipeline or migration tooling.
- No mobile editing experience.
- No rich-text editor, scripture parser, or advanced filtering/search.

---

## Tech Stack (MVP)

Same as the full PRD, scoped down:

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js (App Router), React, TypeScript | |
| Styling | Tailwind CSS, shadcn/ui | |
| Canvas | React Flow | Core dependency; no substitutes |
| State | Zustand | Single store for graph state |
| Backend/DB | Supabase (PostgreSQL + Auth) | No Realtime needed for MVP |
| AI | Vercel AI SDK → Claude Sonnet 4 | Single provider, no fallback |
| Hosting | Vercel + Supabase | |

---

## Data Models (MVP)

Simplified from the full PRD — only what's needed.

### System

```
id: UUID (PK)
user_id: UUID (FK → auth.users)
title: string
presuppositions: JSONB  -- see format below
created_at: timestamp
updated_at: timestamp
```

Note: `tiers` are hardcoded in the frontend for MVP (not stored per-system).

**Presuppositions JSONB format:** Each key is a question ID (e.g., `"T3"`). The value is an object with a `mode` and optional `value`:

```json
{
  "E3": { "mode": "position", "value": 72 },
  "M1": { "mode": "undecided" },
  "M3": { "mode": "not_foundational" },
  "T1": { "mode": "position", "value": 15 },
  "T3": { "mode": "position", "value": 30 },
  "T5": { "mode": "position", "value": 80 },
  "A2": { "mode": "undecided" },
  "S1": { "mode": "position", "value": { "penal_substitution": 3, "moral_influence": 1, "christus_victor": 2, "ransom": 0, "solidarity": 4 } }
}
```

`mode` is one of: `"position"` | `"undecided"` | `"not_foundational"`. For `"position"`, `value` is 0–100 (or a ranked object for S1 using unique integer ranks 0..4). The validator payload serializes this object and filters out any `not_foundational` entries before sending.

### Node

```
id: UUID (PK)
system_id: UUID (FK → System)
tier_id: string (one of: foundational_dogma, official_doctrine, theological_deduction, personal_speculation)
title: string
description: text
notes: text
is_locked: boolean  -- true for the 5 foundational propositions; false for all user-created nodes
x_position: float
y_position: float
validation_status: enum (null, consistent, warning, contradiction)
validation_critique: text (nullable)
created_at: timestamp
updated_at: timestamp
```

Note: Validation result is stored directly on the node rather than in a separate table. This is simpler for MVP and avoids a join. When the node is edited, `validation_status` and `validation_critique` are set to null (stale result cleared). Locked nodes (`is_locked: true`) are seeded by the server on System creation — never by the client — and the API rejects any delete or tier-change request for locked nodes.

### Edge

```
id: UUID (PK)
system_id: UUID (FK → System)
source_node_id: UUID (FK → Node)
target_node_id: UUID (FK → Node)
relationship_type: enum (supports, relies_upon, contradicts, qualifies)
created_at: timestamp
```

---

## MVP User Flow

```
Sign Up (email/password)
    ↓
Dashboard (empty state: "Create your first System")
    ↓
Create System → Name it
    ↓
Step 1 — Presupposition Questionnaire
  8 questions, each with three-state choice: Position (slider) / Undecided / Not Foundational
  Real-time contradiction warnings appear inline as sliders are moved
  User can proceed at any time (questions are not required — they can be answered later in Settings)
    ↓
Step 2 — Canvas loads
  5 locked Foundational Proposition nodes auto-placed in Foundational Dogma tier
  Inverted triangle, 4 fixed tiers, dismissible "Getting Started" modal
    ↓
Double-click to create nodes → Fill in title/description in side panel
    ↓
Drag between nodes to create edges → Select relationship type
    ↓
Click "Validate" on a node → See consistency rating + critique
  (Validator payload includes node + 1-degree neighbors + presuppositions,
   filtering out any "not_foundational" questions)
    ↓
Continue building, connecting, validating
    ↓
Export to JSON when ready to back up
```

---

## Acceptance Criteria by Feature

### Authentication

- Users can sign up, sign in, and sign out with email/password.
- Authenticated users can only read/write their own Systems, Nodes, and Edges.

### System Creation + Presuppositions

- Creating a System server-seeds exactly 5 locked foundational nodes.
- API rejects delete and tier-change operations for locked nodes.
- Each presupposition answer is saved as `position`, `undecided`, or `not_foundational`.
- Contradiction checks only evaluate pairs where both sides are `position`.

### Canvas, Nodes, and Edges

- Nodes can be created, moved, edited, and deleted with autosave.
- Dragging across tier boundaries updates `tier_id` on save.
- Edges support only enum relationship types; no free-text labels.

### Soft-Logic Validator

- Validate action sends only node + 1-degree neighborhood + filtered presuppositions.
- UI always shows rating + critique + fixed non-authoritative disclaimer.
- Node status icon updates after successful response and persists across reloads.
- Validation result is invalidated when node, connected edges, or presuppositions change.
- If provider call fails, UI shows retryable non-destructive error; graph state remains intact.
- If rate limit is hit, UI shows remaining reset window and blocks further calls until reset.

### Export

- JSON export contains enough data to reconstruct a system: system metadata, presuppositions, nodes, edges, and positions.

## Success Criteria

The MVP is successful if:

1. **Users complete onboarding:** >70% of signups finish the presupposition questionnaire and create at least one node.
2. **Users build graphs:** Average system has ≥5 nodes and ≥3 edges after first session.
3. **Users use the validator:** >50% of users with 3+ nodes trigger at least one validation.
4. **Validator is useful:** <30% of validation results are dismissed immediately (proxy for "not helpful").
5. **Users return:** >30% of users who complete a first session return within 7 days.

---

## Telemetry and Privacy Rules (MVP)

All telemetry is metadata-only and excludes node text, notes, and presupposition values.

Allowed event fields:

- `user_id` (internal UUID)
- `system_id`
- event type (`signup_completed`, `system_created`, `node_created`, `edge_created`, `validation_requested`, `validation_succeeded`, `validation_failed`, `validation_dismissed`)
- timestamps and coarse counts

Prohibited telemetry fields:

- Node `title`, `description`, `notes`
- Full presupposition payload or slider values
- Validator prompt/response body text

Retention:

- Product analytics events: 90 days
- Error logs (without theological content): 30 days

---

## MVP Risk Register

| Risk | Impact | Mitigation | Owner |
|---|---|---|---|
| AI cost spike from validation usage | Budget overrun | Hard per-user daily limit, server-side enforcement, dashboard alert on spend threshold | Engineering |
| Low-quality validator feedback | Poor retention/trust | Prompt tests on curated fixtures, disclaimer, quick retry path, collect `validation_dismissed` signal | Product |
| Onboarding drop-off | Weak activation metrics | Keep questionnaire skippable, show fast path to first node, instrument funnel | Product |
| Data model churn between PRD and MVP | Rework and migration churn | Treat this MVP doc as canonical implementation contract until v1.1 merge pass | Engineering |
| Autosave race/conflict bugs | Data loss perception | Debounced writes + last-write-wins policy + visible save/error state in UI | Engineering |

---

## Estimated Scope

For a solo developer or small team familiar with the stack:

| Milestone | Estimate |
|---|---|
| Project scaffolding (Next.js, Supabase, React Flow setup) | 2–3 days |
| Auth + dashboard | 1–2 days |
| Presupposition onboarding UI | 2–3 days |
| Canvas with tiers + node CRUD | 4–5 days |
| Edge management | 2–3 days |
| Node detail side-panel | 2–3 days |
| Soft-Logic Validator (API route + prompt + UI) | 3–4 days |
| Auto-save + persistence | 2–3 days |
| JSON export | 0.5 day |
| Polish, testing, edge cases | 3–4 days |
| **Total** | **~22–30 days** |
