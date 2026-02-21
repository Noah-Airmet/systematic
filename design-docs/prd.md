# Product Requirements Document: Systematic

**Version:** 0.5
**Last Updated:** February 20, 2026
**Author:** Noah
**Status:** Draft

---

## 1. Project Overview

Systematic is a web-based interactive visualization tool designed to help users map, construct, and validate a systematic theology. The app allows users to build a node-based knowledge graph structured within an inverted triangle framework. The visualization moves from sparse, foundational, required dogma at the bottom up to expansive, speculative, and complex theological frameworks at the top.

Think of it as a blueprint editor for belief systems — the way an architect maps load-bearing walls before adding rooms, Systematic maps load-bearing convictions before layering on doctrinal conclusions.

## 2. Target Audience

Individuals within the LDS philosophical and theological community looking to map how their foundational assumptions and philosophical frameworks interact with specific doctrinal conclusions. Secondary audiences include religious studies students, interfaith dialogue participants, and anyone interested in structured theological reasoning.

## 3. Core Features

### 3.1 System Initialization: Foundational Propositions & Presupposition Onboarding

Creating a new System has two initialization components: the locked foundational propositions and the presupposition questionnaire that configures the Soft-Logic Validator. The exact step ordering is implementation-defined (MVP documents the canonical implementation flow).

---

#### Part A — Foundational Propositions (Locked Nodes)

Every new System begins with a set of pre-placed, locked nodes in the Foundational Dogma tier. These represent the irreducible axioms of LDS faith — the propositions affirmed before baptism. They cannot be deleted, cannot be moved to another tier, and cannot have a "Contradicts" edge drawn from another Foundational Dogma node toward them. They are the bedrock the rest of the graph grows from.

The five locked nodes, placed automatically on every new System:

1. **God the Eternal Father is real.**
2. **Jesus Christ is the Son of God, the Savior and Redeemer of the world.**
3. **The Holy Ghost is real.**
4. **The Atonement of Jesus Christ is real.**
5. **The Gospel of Jesus Christ has been restored.**

These nodes carry a distinct visual treatment (e.g., a filled lock icon, immovable position, muted but permanent style) to communicate their locked status. All other nodes in the graph are built on top of them — either directly connected or derivable through the graph's chain of reasoning.

---

#### Part B — Presupposition Questionnaire

The user completes the presupposition questionnaire as part of system initialization. These answers are stored on the System and fed to the Soft-Logic Validator as context for every consistency check.

**How Each Question Works — Three States:**

Every presupposition question offers three response modes. The user chooses one:

- **Position:** The slider is active. The user places themselves on a spectrum between two named poles (0–100). The validator treats this as a firm constraint.
- **Undecided:** The user cares about this question but hasn't settled it. The validator flags tensions related to it as *unresolved* rather than ignoring them — e.g., "You haven't settled your Theory of Time; your answer here could affect three nodes in your system."
- **Not Foundational:** This axis doesn't constrain the user's system. They may be deliberately pluralist about it, or it may simply be irrelevant to the theology they're building. The validator **ignores this axis entirely** — no warnings, no contradiction flags related to it. This is distinct from Undecided: it is a confident declaration that the question has no load-bearing role in the user's framework.

**Custom Presuppositions:** After completing the default questions, users can add their own named spectrum questions. These work identically to the defaults and are stored in the presuppositions JSONB.

---

#### The Questions (Organized by Domain)

Questions are presented domain by domain, with a short framing sentence at the top of each domain explaining why this category matters for systematic theology.

---

**Domain 1 — Epistemology**
*How do you know what you know? These questions govern which sources of truth your system treats as authoritative, and how you'd resolve conflicts between them.*

| # | Question | Pole A (0) | Pole B (100) |
|---|---|---|---|
| E1 | Revelatory Authority: When prophetic teaching and personal reason or spiritual impression conflict, which do you weight more heavily? | Individual reason + personal revelation | Institutional prophetic authority |
| E2 | Canon Scope: What counts as authoritative input for your theology? | Strict canon (Standard Works only) | Expansive canon (King Follett, JD, living prophet = scripture) |
| E3 | Prophetic Infallibility: Can prophets teach false doctrine in their official capacity? | Fully fallibilist (prophets are inspired but fallible) | High inerrancy (prophets are protected from doctrinal error when speaking officially) |

---

**Domain 2 — Metaphysics**
*These questions concern the fundamental nature of reality — time, matter, mind, and existence itself.*

| # | Question | Pole A (0) | Pole B (100) |
|---|---|---|---|
| M1 | Theory of Time: Is the present moment objectively privileged, or are past, present, and future equally real? | A-Theory: Dynamic — only the present is real | B-Theory: Static — past, present, and future all exist equally (block universe) |
| M2 | Nature of Intelligence: Are intelligences/spirits co-eternal with God, or did God bring them into being? | Eternal & self-existent intelligences — God did not create them | God is the source of intelligences/spirits — they are not co-eternal with him |
| M3 | Metaphysics of Creation: Did God organize pre-existing matter, or did he create everything from nothing? | Creatio ex materia — eternal matter exists independently of God | Creatio ex nihilo — God created all things from nothing |
| M4 | Mind/Body: What is the relationship between spirit and physical matter? | Refined Materialism — spirit is a finer form of matter; no ontological gap | Substance Dualism — spirit and body are fundamentally different kinds of substance |

---

**Domain 3 — Theology Proper (Doctrine of God)**
*These questions define the nature, capacities, and mode of existence of God himself.*

| # | Question | Pole A (0) | Pole B (100) |
|---|---|---|---|
| T1 | Nature of God: Is God embodied, relational, and passible (capable of genuine emotion and change)? | Embodied, relational, passible Theism — God is in time, has a body, and is genuinely affected by creation | Classical Theism — God is immutable, impassible, incorporeal, and simple |
| T2 | Divine Temporality: Does God experience time as we do, or does he exist outside of time? | God is in time — he experiences sequence, before/after, and genuine becoming | God is atemporal — he exists outside time in an eternal now |
| T3 | Divine Omniscience: Does God know the future exhaustively, or is the future partly open even to God? | Open Theism — the future is partly undetermined; God knows it as possibilities and probabilities | Classical Omniscience — God has exhaustive, infallible foreknowledge of all events |
| T4 | Divine Omnipotence: Is God's power constrained by eternal, co-existent laws and principles? | God is constrained by eternal law — intelligence, agency, and moral law are co-eternal with him | God is the source of all law — his power is limited only by logical contradiction |
| T5 | Lorenzo Snow Couplet: "As man now is, God once was; as God now is, man may become." | Literal cosmological claim — God progressed to his current state; humans can become gods | Metaphorical or aspirational — the couplet describes character/relationship, not literal divine ontology |

---

**Domain 4 — Anthropology**
*What are humans, where did we come from, and what is our fundamental moral situation?*

| # | Question | Pole A (0) | Pole B (100) |
|---|---|---|---|
| A1 | Pre-mortal Individuality: How differentiated and formative was our pre-mortal existence? | Rich, individuated pre-mortal life with meaningful choices that shape our mortal character | Minimal or undifferentiated pre-mortal existence — individual identity begins at or near birth |
| A2 | Agency: Is human free will genuinely libertarian (uncaused) or compatibilist (free within determined conditions)? | Libertarian free will — choices are genuinely undetermined by prior causes | Compatibilist free will — freedom means acting according to one's own desires, even in a determined system |
| A3 | Nature of the Fall: Was the Fall a necessary and fortunate step in God's plan (felix culpa), or a genuine deviation from God's ideal? | Fortunate Fall — the Fall was planned and necessary for human progression | Tragic Fall — God's ideal was Eden; the Fall is a deviation he has worked to redeem |
| A4 | Human Nature: Are humans fundamentally divine and good, or do they have a fallen nature requiring transformation? | Inherently divine — humans are literal spirit children of God with divine potential as their basic nature | Fallen nature — mortal humans are in a state requiring redemption; the natural man is an enemy to God |

---

**Domain 5 — Soteriology**
*How does salvation work, and what does it require?*

| # | Question | Pole A (0) | Pole B (100) |
|---|---|---|---|
| S1 | Atonement Mechanism: *Multi-model, ranked.* How does the Atonement actually accomplish what it accomplishes? | *(Ranked multi-select: Penal Substitution — paying a legal/infinite debt; Moral Influence — demonstrating divine love to transform human hearts; Christus Victor — conquering sin and death; Ransom Theory — liberating humanity from bondage; Solidarity/Suffering — Christ's suffering in Gethsemane enables empathy and healing)* | ← Same poles; user assigns relative weight to each model |
| S2 | Justification: What is the role of grace vs. covenant faithfulness in salvation? | Grace alone (activated by faith) — the Atonement covers everything; works are the fruit, not the condition | Grace + covenant faithfulness — both divine grace and human obedience are necessary conditions |
| S3 | Proxy Ordinances: Are temple ordinances and proxy work necessary conditions for exaltation, or efficacious expressions of covenant community? | Necessary conditions — without the ordinances, progression to the Celestial Kingdom is not possible | Efficacious by grace — ordinances are real and important, but God's grace is not ultimately blocked by their absence |
| S4 | Post-Mortem Progression: Can genuine repentance and spiritual growth occur after death? | Full post-mortem progression — the spirit world is a genuine continuation of the repentance and learning process | Mortality is the time — the decisions and character formed in mortality are substantially determinative |

S1 ranking semantics:

- Each model receives a unique integer rank from 0 to 4.
- `4` means highest explanatory weight; `0` means lowest explanatory weight.
- Contradiction checks that reference "X only" operate when X is highest-ranked and all alternatives are ranked lower by at least 2 points.

---

**Domain 6 — Eschatology**
*What is the end state of human existence, and what does the final judgment mean?*

| # | Question | Pole A (0) | Pole B (100) |
|---|---|---|---|
| Es1 | Degrees of Glory: Are the lower kingdoms genuinely good outcomes, or are they lesser than God's full desire for his children? | All kingdoms of glory are genuinely good — the Terrestrial and Telestial are real fulfillments of different capacities | Only the Celestial is God's full desire — lower kingdoms represent genuine loss, even if they are still glorious |
| Es2 | Inter-Kingdom Progression: After the final judgment, can people progress between kingdoms eternally? | Eternal progression is universal — people can continue to grow and move between kingdoms after judgment | Judgment is final — the assignment to a kingdom of glory is permanent |
| Es3 | Exaltation: What does becoming "gods" actually mean? | Literal deification — exalted humans literally become gods, creators of worlds, in the same ontological category as Heavenly Father | Sanctification and union — exaltation means becoming fully Christ-like in character and relationship; the language of "gods" is participatory, not ontologically distinct |

---

#### Real-Time Contradiction Detection

As the user moves sliders, the questionnaire performs **client-side contradiction checks** against a hardcoded compatibility matrix. When two active Position answers trigger a known tension, an inline warning banner appears between the two questions — non-blocking (users can continue) but persistent until they resolve or mark one as Not Foundational.

Severity levels: **Hard Contradiction** (traditionally considered mutually exclusive) and **Warning** (significant tension with known philosophical reconciliations).

| Presupposition A | Presupposition B | Severity | Explanation shown to user |
|---|---|---|---|
| M1: B-Theory (high) | T3: Open Theism (high) | Hard Contradiction | A block universe means the future already exists. Open Theism requires the future to be genuinely undetermined. These are mutually exclusive. |
| T1: Classical Theism (high) | T3: Open Theism (high) | Hard Contradiction | An immutable, atemporal God cannot be genuinely responsive to open creaturely choices. Classical Theism and Open Theism are traditionally incompatible. |
| M2: Eternal Intelligence (high) | M3: Creatio ex nihilo (high) | Hard Contradiction | If intelligences are co-eternal and self-existent, God cannot have created all things from nothing. These are mutually exclusive cosmologies. |
| T1: Classical Theism / Immutability (high) | T5: Lorenzo Snow Couplet — literal (high) | Hard Contradiction | A simple, immutable being cannot have "once been as man now is." Divine progression requires temporality and change; classical immutability denies both. |
| T1: Classical Theism (high) | M1: A-Theory of Time (low) | Warning | If the present moment is dynamically and objectively real (A-Theory), a God who exists entirely outside temporal sequence — as Classical Theism requires — is difficult to situate in that metaphysic. Classical Theism fits more naturally with B-Theory's block universe. |
| T3: Exhaustive Foreknowledge (high) | A2: Libertarian Free Will (high) | Warning | If God timelessly and infallibly knows all my future choices, it is unclear how those choices are genuinely undetermined. Molinism offers a middle-ground but is contested. |
| M1: B-Theory (high) | A2: Libertarian Free Will (high) | Warning | In a block universe, all events — including future choices — already exist timelessly. This strains the notion of genuinely undetermined libertarian agency. |
| M3: Creatio ex nihilo (high) | T5: Lorenzo Snow Couplet — literal (high) | Warning | If God created all things from nothing, the claim that intelligences are co-eternal (implied by the couplet's cosmology) is strained. |
| E3: High Prophetic Infallibility (high) | T3: Open Theism (high) | Warning | Most modern LDS prophets have taught or implied classical exhaustive foreknowledge. A high-inerrancy view makes significant departure from this position difficult to justify. |
| A3: Fortunate Fall (high) | A2: Compatibilism / low free will (high) | Warning | If the Fall was predetermined by God and agency is largely illusory, the moral culpability and genuine choice of Adam and Eve is in tension. |
| S1: Penal Substitution only (high) | S1: Moral Influence only (high) | Warning | These atonement models are not logically incompatible, but Penal Substitution grounds salvation in legal satisfaction while Moral Influence denies it — building a system on both requires careful integration. |

*Note: Contradiction checks are suppressed for any presupposition where the user has selected "Not Foundational." If a user marks T3 (Divine Omniscience) as Not Foundational, no warnings involving T3 will appear, regardless of other slider positions.*

### 3.2 The Canvas (Inverted Triangle UI)

**Visual Layout:** The main view is an infinite canvas featuring an inverted triangle (narrow at the bottom, wide at the top) divided into horizontal tiers. The triangle serves as a visual guardrail — it communicates that foundational beliefs are few and load-bearing, while upper tiers have room for breadth and exploration.

**Customizable Tiers:** Users can add, rename, reorder, and resize (adjust the height/width of) the horizontal tiers.

**Default Tiers (Bottom to Top):**

1. Foundational Dogma
2. Official Doctrine
3. Theological Deduction
4. Personal Speculation

**Empty State & Onboarding:** On the first interactive canvas load of a new system, the app provides:

- A brief guided walkthrough (dismissible tooltip sequence) explaining the tier metaphor and how to create nodes.
- 2–3 suggested starter nodes pre-placed in the Foundational Dogma tier based on the user's presupposition answers (e.g., if they leaned toward Creatio ex materia, a starter node for "Eternal matter/intelligence" appears). Users can keep, edit, or delete these.
- A persistent "Add your first node" affordance in each empty tier.

### 3.3 Node & Edge Management (Graph System)

**Node Creation:** Users can double-click anywhere on the canvas or drag-and-drop from a sidebar to create a node. Nodes are visually contained within the boundaries of a specific tier.

**Node Confidence Level:** Each node carries a user-set confidence indicator: Settled, Exploring, or Troubled. This is displayed as a subtle visual treatment (e.g., solid border, dashed border, pulsing border) so the canvas communicates epistemic certainty at a glance.

**Connections (Edges):** Users can click and drag from the port of one node to another to establish a directional relationship.

**Edge Types (Enum):** Supports, Relies Upon, Contradicts, Qualifies.

**Edge Labels (Freetext):** Users can optionally add a custom label to any edge for more specific descriptions (e.g., "Exegetes via 2 Nephi 2:11").

**Cross-Tier Connections:** Edges can connect nodes in any tier to nodes in any other tier. Cross-tier edges that skip tiers are rendered with a distinct dashed style to highlight long-range dependencies.

### 3.4 Node Detail & Soft-Logic Validator Panel

Clicking on a node opens a side-panel with the following components:

**Title & Description:** Basic text fields for the premise or doctrine.

**Confidence Level:** Selector for Settled / Exploring / Troubled.

**Notes & Citations:** Rich text area for deeper explanations and general notes.

**Scripture References (Structured):** A dedicated, structured input for scripture citations (book, chapter, verse). This enables reverse-lookup queries across the system (e.g., "Show me every node citing 2 Nephi 2") and highlights when contradicting nodes cite the same passage.

**Tags:** Freeform tags for categorization and filtering (e.g., "eschatology," "priesthood," "cosmology").

**Timestamps:** Created and last modified dates, displayed in the panel.

### 3.5 The Soft-Logic Validator

The Soft-Logic Validator is the AI-powered consistency engine and the primary differentiating feature of Systematic. It operates in two modes:

**Node-Level Validation (Manual Trigger):**

A button on the node detail panel triggers an API call to an LLM. The app packages the current node, its connected neighbors (up to 2 degrees of separation), and the user's presupposition settings into a structured JSON payload. The LLM returns:

- A **consistency rating:** Consistent, Warning, or Contradiction.
- A **brief philosophical critique** explaining the rating (e.g., "Warning: You placed 'Absolute Predestination' here, but your system initialization leans 80% toward Open Theism. These are traditionally incompatible. Consider whether your view of predestination is compatibilist.").
- **Missing connection suggestions:** The validator may note potentially relevant but unconnected nodes (e.g., "This node about temple covenants has no connection to your Atonement model — is that intentional?").

Implementation note: MVP simplifies node-level payloads to 1-degree neighbors, then expands to 2-degree in post-MVP phases.

**System-Wide Audit (Manual Trigger):**

A top-level action that runs validation across the entire graph. For large graphs (50+ nodes), this uses a chunked approach — validating clusters of related nodes in batches rather than sending the entire graph in one payload. The output is a summary report highlighting the top tensions, contradictions, and orphaned nodes (nodes with no connections).

**Guardrails & LLM Reliability:**

- All validator outputs include a confidence disclaimer: "This analysis reflects common philosophical and theological frameworks. It is not authoritative."
- Users can flag a validator result as "Incorrect" or "Unhelpful," which is logged for future prompt tuning.
- The prompt architecture emphasizes identifying *traditional* tensions rather than making normative theological claims. The LLM is instructed to reason from the user's own presuppositions, not from a default theological position.
- Context window management: For node-level validation, the payload is limited to 2-degree neighbor subgraph. For system-wide audit, the graph is chunked by tier and connection clusters.

### 3.6 Tension Map View

An optional overlay mode that renders a heat-map across the canvas. Areas of high internal tension (clusters with Warnings or Contradictions from the validator) glow warmer. This gives users a bird's-eye sense of where their system has unresolved friction — like a weather radar for theological consistency.

### 3.7 Templates & Starter Systems

Pre-built partial graphs for common theological frameworks lower the barrier to entry. Users can browse a template gallery and fork a template into their own system for modification.

**Default Templates:**

- Classical LDS (correlated, mainstream)
- Progressive LDS
- Early Restoration Cosmology (Brigham Young–era, King Follett discourse emphasis)
- Blank (empty canvas with only default tiers)

Users can also publish their own systems as community templates (future feature; see Section 10).

### 3.8 Versioning & Snapshots

Users can save named snapshots of their system at any point in time. The app stores a full copy of the graph state (nodes, edges, positions, presuppositions) per snapshot.

**Snapshot Diff:** Users can select two snapshots and view a visual diff — added nodes in green, removed nodes in red, moved nodes with a trail indicator. This supports theological reflection: "Here's what I believed in January versus now."

### 3.9 Export & Data Ownership

Users own their data. The following export formats are supported:

- **JSON:** Full system export (nodes, edges, presuppositions, tiers) for backup or interoperability.
- **PNG / SVG:** Visual snapshot of the current canvas state.
- **PDF:** Formatted report of all nodes, organized by tier, with their descriptions, citations, and validator results.
- **Markdown:** Structured text export of the system for use in Obsidian or other tools.

Import from JSON is also supported to restore or migrate systems.

## 4. User Flows

### 4.1 New User Journey

1. User signs up (email/password; OAuth providers are post-MVP).
2. User creates a new System or selects a Template.
3. If new System: Presupposition Onboarding questionnaire (3.1).
4. Canvas loads with the inverted triangle, default tiers, and starter nodes (if applicable).
5. Guided walkthrough tooltips appear (dismissible).
6. User begins creating nodes, connecting edges, and validating.

### 4.2 Returning User Session

1. User logs in and sees a dashboard listing their Systems with last-modified dates.
2. User selects a System; canvas loads with all saved state.
3. User continues editing, runs validations, or takes a snapshot.

### 4.3 Validation Flow

1. User clicks "Validate" on a node's detail panel.
2. Loading indicator appears on the node (subtle pulse animation).
3. Validator panel displays the result: rating, critique, suggestions.
4. If Warning or Contradiction, the node and relevant edges receive a visual indicator (yellow or red glow).
5. User can dismiss, accept, or flag the result.

## 5. Authentication & Access

**V1 Scope:** Single-player only. Each user has their own account and private systems. No sharing or collaboration.

**Authentication:** Supabase Auth with email/password in MVP, with OAuth providers (Google, Apple) added post-MVP.

**Future Consideration:** The data model is designed to support multi-user access in the future (shared systems, view-only links, collaborative editing). The `user_id` on the System model will eventually become a many-to-many relationship via a `system_members` join table. This is explicitly out of scope for v1 but should not be blocked by architectural decisions.

## 6. Tech Stack

**Frontend Framework:** Next.js (App Router), React, TypeScript.

**Styling:** Tailwind CSS, shadcn/ui (for sidebars, modals, buttons, and form components).

**Graph Visualization:** React Flow (handles the infinite canvas, node dragging, edge connections, and minimap).

**State Management:** Zustand (manages the complex state of nodes, edges, and tiers without React Context overhead).

**Backend/Database:** Supabase (PostgreSQL for storing user profiles, system configurations, nodes, edges, and snapshots. Supabase Realtime reserved for future collaboration features).

**AI Integration:** Vercel AI SDK connecting to Claude Sonnet 4 for MVP. Multi-provider fallback (e.g., Gemini 2.5 Pro) is post-MVP.

**Hosting:** Vercel (frontend), Supabase (backend/database).

## 7. Data Models

Implementation note: for MVP build execution, `/Users/noahairmet/Documents/personal-projects/systematic/design-docs/mvp.md` is the canonical contract for schema and API payload details. This PRD remains the long-range product spec.

### System (The Graph)

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | Foreign key → User |
| title | string | System name |
| presuppositions | JSONB | Spectrum values, custom presuppositions |
| tiers | JSONB | Array of { id, label, order_index, height } |
| created_at | timestamp | Auto-set on creation |
| updated_at | timestamp | Auto-updated on modification |

### Node

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| system_id | UUID | Foreign key → System |
| tier_id | string | Which tier this node belongs to |
| title | string | Node headline |
| description | text | Description / premise |
| notes | text | Freeform citations/notes |
| confidence | enum | settled, exploring, troubled |
| scripture_refs | JSONB | Array of { book, chapter, verse } |
| tags | text[] | Array of freeform tag strings |
| x_position | float | Canvas X coordinate |
| y_position | float | Canvas Y coordinate |
| created_at | timestamp | Auto-set on creation |
| updated_at | timestamp | Auto-updated on modification |

### Edge

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| system_id | UUID | Foreign key → System |
| source_node_id | UUID | Foreign key → Node |
| target_node_id | UUID | Foreign key → Node |
| relationship_type | enum | supports, relies_upon, contradicts, qualifies |
| label | string (nullable) | Optional freeform label |
| created_at | timestamp | Auto-set on creation |

### Snapshot

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| system_id | UUID | Foreign key → System |
| name | string | User-provided snapshot name |
| graph_state | JSONB | Full serialized graph (nodes, edges, positions, presuppositions) |
| created_at | timestamp | Auto-set on creation |

### Validation Result (cached)

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| node_id | UUID | Foreign key → Node |
| system_id | UUID | Foreign key → System |
| rating | enum | consistent, warning, contradiction |
| critique | text | LLM-generated explanation |
| suggestions | JSONB | Missing connection suggestions |
| flagged | boolean | User flagged as incorrect |
| created_at | timestamp | When validation was run |

Implementation note: MVP stores `validation_status` and `validation_critique` directly on `Node` for simplicity. A separate `Validation Result` table is the post-MVP evolution path.

## 8. Platform & Responsive Scope

**V1: Desktop-first.** The node-graph canvas interaction (dragging, connecting, zooming) is designed for mouse and keyboard. The minimum supported viewport is 1024px wide.

**Mobile (Future):** A simplified read-only mobile view that displays the system as a structured list (grouped by tier) rather than a canvas. Node detail panels and validation results are accessible, but graph editing is not. This is out of scope for v1.

## 9. Privacy & Theological Sensitivity

Users are building deeply personal theological frameworks. The app must respect this:

- Presupposition data and node content are never used for analytics, advertising, or model training.
- LLM API calls for validation send only the minimum necessary context (subgraph + presuppositions) and do not persist on the AI provider's side (use ephemeral/zero-retention API options where available).
- Users can delete their account and all associated data (GDPR-style right to erasure).
- No system is public by default. Sharing requires explicit user action (future feature).

### 9.1 Telemetry Boundary (Metadata-Only)

To support product success metrics without inspecting theological content:

- Allowed telemetry: event names, timestamps, coarse counts, internal IDs (`user_id`, `system_id`), and success/failure status.
- Prohibited telemetry: node titles/descriptions/notes, presupposition values, validator prompt bodies, validator critique text.
- Retention target: analytics events 90 days, operational error logs 30 days.

## 10. Future Considerations (Out of Scope for V1)

These features are intentionally deferred but should not be blocked by v1 architecture:

- **Collaborative editing:** Multiple users editing a shared system in real-time (Supabase Realtime).
- **Community template gallery:** Users publish and browse community-created starter systems.
- **Comparison mode:** Overlay two systems side-by-side to compare theological frameworks.
- **Denominational expansion:** Presupposition sets for Catholic, Reformed, Orthodox, and other traditions.
- **Plugin system:** Community-contributed presupposition packs and validator prompt profiles.
- **Offline/PWA support:** Service worker caching for offline canvas viewing and editing with sync-on-reconnect.

## 11. Entity Relationship Diagram

```
┌──────────┐       ┌──────────────┐       ┌──────────┐
│   User   │──1:N──│    System    │──1:N──│ Snapshot │
└──────────┘       └──────────────┘       └──────────┘
                          │
                     1:N  │  1:N
                   ┌──────┴──────┐
                   ▼             ▼
              ┌────────┐    ┌────────┐
              │  Node  │    │  Edge  │
              └────────┘    └────────┘
                   │             │
                   │        (source_node_id,
                   │         target_node_id)
              1:N  │         → Node FK × 2
                   ▼
           ┌──────────────────┐
           │ Validation Result│
           └──────────────────┘
```

## 12. V1 Acceptance Criteria

- System creation always seeds the five locked foundational nodes server-side.
- Locked node delete and tier-change operations are rejected by API policy.
- Presupposition modes (`position`, `undecided`, `not_foundational`) persist correctly and drive contradiction checks.
- Node-level validation returns rating + critique + non-authoritative disclaimer.
- Validation operations fail safely (no graph data mutation on provider error or rate limit).
- JSON export includes enough data to reconstruct the user system (metadata, nodes, edges, positions, presuppositions).

## 13. V1 Risk Register

| Risk | Impact | Mitigation | Owner |
|---|---|---|---|
| AI cost spikes | Budget risk | Server-side daily limits + spend alerts | Engineering |
| Validator quality variance | Trust risk | Prompt fixtures, disclaimer, dismissal signal review | Product |
| Onboarding drop-off | Activation risk | Short questionnaire path + first-node fast path | Product |
| Schema churn across docs | Delivery risk | Treat MVP doc as canonical until post-MVP schema merge | Engineering |
| Autosave race conditions | Data-loss perception | Debounce writes, visible save state, retry-safe writes | Engineering |
