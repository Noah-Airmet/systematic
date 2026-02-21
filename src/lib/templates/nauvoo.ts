import { SystemTemplate } from "./index";

export const nauvooTemplate: SystemTemplate = {
    id: "nauvoo-era-mormonism",
    name: "Nauvoo-Era Mormonism (1839-1846)",
    description: "The sweeping theological developments of Joseph Smith's late Nauvoo period, including the plurality of Gods, temple soteriology, sealing powers, and the King Follett concepts.",
    author: "Systematic Official",
    presuppositions: {
        "god-nature": { mode: "position", value: "Material, Embodied, and Plural" },
        "scripture-inerrancy": { mode: "position", value: "Fallible; ongoing revelation supersedes" },
        "salvation-grace-works": { mode: "position", value: "Exaltation through Ritual and Sealing" },
        "creation-ex-nihilo": { mode: "position", value: "Organization of Chaos by a Council" },
        "church-authority": { mode: "position", value: "Keys of the Kingdom and Temple" },
    },
    nodes: [
        {
            id: "nv-1",
            tier_id: "Foundational Dogma",
            title: "Council of the Gods",
            description: "Elohim is a governing head among a council of plural Gods who planned the creation of this earth.",
            notes: "A radical departure from early monotheism; introduced in the Book of Abraham and the King Follett discourse.",
            x_position: 200,
            y_position: 80,
            grounds: "King Follett Discourse: 'I will preach on the plurality of Gods. I have selected this text for that express purpose...'",
            warrant: "Genesis 'Elohim' is plural; creation was an organized effort by multiple divine beings.",
            qualifier: "necessarily",
            epistemic_sources: ["prophetic_teaching", "canonical_scripture"]
        },
        {
            id: "nv-2",
            tier_id: "Foundational Dogma",
            title: "God was once a Man",
            description: "God himself was once as we are now, and is an exalted man, and sits enthroned in yonder heavens.",
            x_position: 500,
            y_position: 80,
            grounds: "King Follett Discourse (April 1844).",
            warrant: "God's existence is contingent on a past mortal probation; he is the pinnacle of human evolution, not fundamentally 'other'.",
            qualifier: "necessarily",
            epistemic_sources: ["prophetic_teaching"]
        },
        {
            id: "nv-3",
            tier_id: "Official Doctrine",
            title: "The Sealing Power",
            description: "Priesthood keys to bind on earth and in heaven, necessary for eternal family units and proxy ordinances.",
            notes: "Introduced by Elijah in Kirtland (1836) but fully realized in Nauvoo.",
            x_position: 350,
            y_position: 280,
            grounds: "D&C 128:18 - '...a welding link of some kind or other between the fathers and the children...'",
            warrant: "Celestial glory is a communal, familial state, requiring ritual binding.",
            qualifier: "necessarily",
            epistemic_sources: ["canonical_scripture", "prophetic_teaching"]
        },
        {
            id: "nv-4",
            tier_id: "Theological Deduction",
            title: "Proxy Baptism for the Dead",
            description: "The living can perform saving ordinances vicariously for the deceased.",
            x_position: 150,
            y_position: 480,
            grounds: "1 Corinthians 15:29 and D&C 127/128.",
            warrant: "God is just and merciful; those who died without law must have anomalous access to salvation via the sealing power.",
            qualifier: "necessarily",
            epistemic_sources: ["canonical_scripture"]
        },
        {
            id: "nv-5",
            tier_id: "Theological Deduction",
            title: "The Endowment",
            description: "A comprehensive ritual drama conveying keys, signs, and tokens necessary to pass the angels to exaltation.",
            x_position: 450,
            y_position: 500,
            grounds: "Introduced to the Quorum of the Anointed in the Red Brick Store (May 1842).",
            warrant: "The path to Godhood is esoteric and requires specific, revealed knowledge and covenants.",
            qualifier: "necessarily",
            epistemic_sources: ["historical_record"]
        },
        {
            id: "nv-6",
            tier_id: "Official Doctrine",
            title: "Calling and Election Made Sure",
            description: "The Second Comforter; a guarantee of exaltation sealed upon an individual in this life.",
            x_position: 650,
            y_position: 300,
            grounds: "2 Peter 1:10 and Joseph Smith's Nauvoo teachings.",
            warrant: "Mortal probation can be concluded early by divine guarantee; securing exaltation before death.",
            qualifier: "necessarily",
            epistemic_sources: ["prophetic_teaching"]
        },
        {
            id: "nv-7",
            tier_id: "Theological Deduction",
            title: "Plural Marriage (Dynastic)",
            description: "The practice of sealing multiple wives to priesthood leaders to create vast, interconnected dynastic eternal networks.",
            x_position: 750,
            y_position: 520,
            grounds: "D&C 132 (recorded 1843).",
            warrant: "Salvation in Nauvoo was highly relational; marrying into the families of the prophets secured one's exaltation.",
            qualifier: "necessarily",
            epistemic_sources: ["historical_record"]
        }
    ],
    edges: [
        { source_node_id: "nv-1", target_node_id: "nv-2", relationship_type: "supports", inference_type: "deductive" },
        { source_node_id: "nv-3", target_node_id: "nv-4", relationship_type: "relies_upon", inference_type: "deductive" },
        { source_node_id: "nv-3", target_node_id: "nv-5", relationship_type: "relies_upon", inference_type: "deductive" },
        { source_node_id: "nv-3", target_node_id: "nv-6", relationship_type: "relies_upon", inference_type: "inductive" },
        { source_node_id: "nv-3", target_node_id: "nv-7", relationship_type: "relies_upon", inference_type: "deductive" },
        { source_node_id: "nv-2", target_node_id: "nv-5", relationship_type: "supports", inference_type: "abductive" },
    ],
    definitions: [
        {
            term: "Calling and Election",
            definition: "The unconditional promise of eternal life, or the 'more sure word of prophecy'.",
            linked_nodes: ["nv-6"]
        },
        {
            term: "Council of Fifty",
            definition: "The political organization intended to establish the Kingdom of God on earth as a literal government.",
            linked_nodes: []
        }
    ]
};
