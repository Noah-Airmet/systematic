import { SystemTemplate } from "./index";

export const blakeOstlerTemplate: SystemTemplate = {
    id: "blake-ostler-relational-theology",
    name: "Blake Ostler Relational Theology",
    description: "A robust philosophical framework drawing on Open and Relational Theology, focusing on God's passibility, agape love, kenotic christology, and libertarian free will.",
    author: "Systematic Official",
    presuppositions: {
        "god-nature": { mode: "position", value: "Embodies maximally great relational properties (Omni-competent, but open)" },
        "scripture-inerrancy": { mode: "position", value: "Errant human encounters with the Divine" },
        "salvation-grace-works": { mode: "position", value: "Synergistic relationship of transforming love" },
        "creation-ex-nihilo": { mode: "position", value: "Co-creation with uncreated actual entities" },
        "church-authority": { mode: "position", value: "A community of mutual consent, not absolutist hierarchy" },
    },
    nodes: [
        {
            id: "bo-1",
            tier_id: "Foundational Dogma",
            title: "Libertarian Free Will",
            description: "Agents possess the irreducible capacity to choose differently under identical historical circumstances.",
            notes: "The linchpin of Ostler's theology; prevents determinism and requires an Open future.",
            x_position: 150,
            y_position: 100,
            grounds: "2 Nephi 2:27 - 'free to choose liberty and eternal life... or to choose captivity'",
            warrant: "True, morally significant love (agape) requires the non-necessitated choice of the agent.",
            qualifier: "necessarily",
            epistemic_sources: ["canonical_scripture", "philosophical_argument"]
        },
        {
            id: "bo-2",
            tier_id: "Foundational Dogma",
            title: "Open Theism (The Open Future)",
            description: "God knows everything that is knowable, but future free choices do not yet exist to be known.",
            notes: "Opposes classical omniscience where God timelessly sees all history simultaneously.",
            x_position: 450,
            y_position: 100,
            grounds: "God tests Abraham (Gen 22:12 - 'now I know that thou fearest God'), altering divine plans based on human reaction.",
            warrant: "If free choices were exhaustively foreknown, they would be fixed and thus not free. Omniscience must only entail knowing all possibilities and their probabilities.",
            qualifier: "necessarily",
            epistemic_sources: ["scriptural_exegesis", "philosophical_argument"]
        },
        {
            id: "bo-3",
            tier_id: "Foundational Dogma",
            title: "Divine Passibility",
            description: "God is deeply affected by, suffers with, and genuinely responds to the emotions and actions of His creations.",
            x_position: 750,
            y_position: 100,
            grounds: "Moses 7 (Enoch's vision of the weeping God).",
            warrant: "A perfectly loving being cannot be apathetic or immutable to the immense suffering of those He loves.",
            qualifier: "necessarily",
            epistemic_sources: ["canonical_scripture", "theological_reasoning"]
        },
        {
            id: "bo-4",
            tier_id: "Official Doctrine",
            title: "Kenotic Christology",
            description: "Christ, as a pre-mortal divine being, voluntarily divested or limited Himself of 'omni' attributes to experience true humanity.",
            x_position: 80,
            y_position: 300,
            grounds: "Philippians 2:7 - 'made himself of no reputation' (ekenōsen).",
            warrant: "To be a true sympathetic high priest, the condescension required genuine vulnerability and risk of failure.",
            qualifier: "probably",
            epistemic_sources: ["canonical_scripture", "scholarly_consensus"]
        },
        {
            id: "bo-5",
            tier_id: "Official Doctrine",
            title: "Compassionate Theism",
            description: "God's primary relational attribute is suffering, self-giving love (Agape), not coercive power.",
            x_position: 380,
            y_position: 320,
            grounds: "The Book of Mormon focus on the 'condescension of God'.",
            warrant: "Maximally great power is defined by the ability to persuade and mutually relate, not unilaterally dictate.",
            qualifier: "necessarily",
            epistemic_sources: ["philosophical_argument"]
        },
        {
            id: "bo-6",
            tier_id: "Official Doctrine",
            title: "The Problem of Evil (Finitism)",
            description: "God cannot unilaterally prevent all evil because He operates alongside co-eternal, uncreated intelligences and matter that resist His will.",
            x_position: 680,
            y_position: 300,
            grounds: "D&C 93:29 - 'Intelligence... was not created or made, neither indeed can be.'",
            warrant: "If God did not create all things ex nihilo, He is not culpable for the inherent unruliness of the cosmos or the misuse of pre-existing agency.",
            qualifier: "necessarily",
            epistemic_sources: ["philosophical_argument", "canonical_scripture"]
        },
        {
            id: "bo-7",
            tier_id: "Theological Deduction",
            title: "Synergistic Salvation",
            description: "Salvation is an ongoing, relational process of becoming, requiring the joint action of God's grace and human consent.",
            x_position: 380,
            y_position: 540,
            grounds: "2 Nephi 25:23 - 'it is by grace that we are saved, after all we can do' interpreted as 'despite all we can do' or 'in relation to our yielding'.",
            warrant: "God's love cannot force transformation; it must be received and participated in.",
            qualifier: "necessarily",
            epistemic_sources: ["theological_reasoning"]
        }
    ],
    edges: [
        { source_node_id: "bo-1", target_node_id: "bo-2", relationship_type: "supports", inference_type: "deductive" },
        { source_node_id: "bo-3", target_node_id: "bo-5", relationship_type: "supports", inference_type: "deductive" },
        { source_node_id: "bo-4", target_node_id: "bo-5", relationship_type: "supports", inference_type: "inductive" },
        { source_node_id: "bo-1", target_node_id: "bo-6", relationship_type: "supports", inference_type: "deductive" },
        { source_node_id: "bo-5", target_node_id: "bo-7", relationship_type: "supports", inference_type: "abductive" },
        { source_node_id: "bo-2", target_node_id: "bo-6", relationship_type: "supports", inference_type: "analogical" }
    ],
    definitions: [
        {
            term: "Agape",
            definition: "Unconditional, self-giving, vulnerable love that seeks relationship overriding control.",
            linked_nodes: ["bo-5"]
        },
        {
            term: "Kenosis",
            definition: "The act of self-emptying or divine limitation.",
            linked_nodes: ["bo-4"]
        },
        {
            term: "Passibility",
            definition: "The capacity of God to experience emotion, particularly suffering, induced by the actions of His creations.",
            linked_nodes: ["bo-3"]
        }
    ]
};
