import { SystemTemplate } from "./index";

export const brighamYoungTemplate: SystemTemplate = {
    id: "brigham-young-cosmology",
    name: "Brigham Young Cosmology",
    description: "A theological framework based on the extensive discourses of Brigham Young, focusing on Adam-God doctrine, continuous progression, the materiality of spirit, and blood atonement.",
    author: "Systematic Official",
    presuppositions: {
        "god-nature": { mode: "position", value: "Material and Embodied" },
        "scripture-inerrancy": { mode: "position", value: "Fallible but Inspired" },
        "salvation-grace-works": { mode: "position", value: "Exaltation through Obedience and Ordinances" },
        "creation-ex-nihilo": { mode: "position", value: "Organized from Pre-existing Matter" },
        "church-authority": { mode: "position", value: "Absolute and Prophetic" },
    },
    nodes: [
        {
            id: "by-1",
            tier_id: "Foundational Dogma",
            title: "Materiality of Spirit",
            description: "All spirit is matter, but more fine or pure.",
            notes: "A direct continuation of Joseph Smith's D&C 131 revelation, heavily emphasized by Young to reject all mysticism.",
            x_position: 150,
            y_position: 80,
            grounds: "D&C 131:7-8 - 'There is no such thing as immaterial matter. All spirit is matter...'",
            warrant: "If spirit is material, then spiritual laws are ultimately physical laws operating on refined matter.",
            qualifier: "necessarily",
            epistemic_sources: ["canonical_scripture", "prophetic_teaching"]
        },
        {
            id: "by-2",
            tier_id: "Official Doctrine",
            title: "God is an Exalted Man",
            description: "God the Father was once a man on another earth who progressed to Godhood.",
            x_position: 450,
            y_position: 80,
            grounds: "King Follett Discourse (Joseph Smith) passed down and expanded.",
            warrant: "God's perfection is a result of evolutionary progression through a mortal probation.",
            qualifier: "necessarily",
            epistemic_sources: ["prophetic_teaching"]
        },
        {
            id: "by-3",
            tier_id: "Official Doctrine",
            title: "Adam-God Doctrine",
            description: "Adam is Michael the Archangel, the Ancient of Days, and the only God with whom we have to do.",
            notes: "Taught publicly multiple times by Brigham Young, including at the pulpit in General Conference and woven into early temple ceremonies.",
            x_position: 100,
            y_position: 500,
            grounds: "Brigham Young's April 9, 1852 discourse: 'When our father Adam came into the garden of Eden, he came into it with a celestial body... He is our Father and our God.'",
            warrant: "As the first man and progenitor of the human race, Adam holds the keys of salvation for this earth under the direction of Elohim.",
            rebuttal: "Later disavowed by Spencer W. Kimball in 1976.",
            qualifier: "probably",
            epistemic_sources: ["prophetic_teaching", "general_conference"]
        },
        {
            id: "by-4",
            tier_id: "Official Doctrine",
            title: "Eternal Progression (Law of Increase)",
            description: "Exalted beings continue to have spirit children and organize new worlds eternally.",
            x_position: 400,
            y_position: 280,
            grounds: "D&C 132 teaches continuation of the seeds forever.",
            warrant: "Godhood is defined by the power to procreate spirit children and build kingdoms.",
            qualifier: "necessarily",
            epistemic_sources: ["canonical_scripture"]
        },
        {
            id: "by-5",
            tier_id: "Theological Deduction",
            title: "Plural Marriage as Necessity",
            description: "Plural marriage is necessary for the highest degree of exaltation and to rapidly multiply a righteous seed.",
            x_position: 400,
            y_position: 480,
            grounds: "Journal of Discourses, Vol 11., p.269 - Brigham Young asserts it as a requirement for celestial glory.",
            warrant: "If exaltation requires kingdoms of posterity, plural marriage accelerates the creation of 'increase'.",
            qualifier: "necessarily",
            epistemic_sources: ["prophetic_teaching"]
        },
        {
            id: "by-6",
            tier_id: "Official Doctrine",
            title: "Blood Atonement",
            description: "Certain severe sins (like murder or covenant breaking) put a person beyond the reach of Christ's blood, requiring their own blood to be shed as an offering.",
            x_position: 700,
            y_position: 680,
            grounds: "Journal of Discourses, Vol 4, p.219-220 - 'there are sins that men commit for which they cannot receive forgiveness in this world... and if they had their eyes open to see their true condition, they would be perfectly willing to have their blood spilt...'",
            warrant: "Justice demands a penalty; if Christ's atonement doesn't cover a sin, the sinner must pay the debt maximally.",
            rebuttal: "Strongly rejected by modern church leadership (e.g., Bruce R. McConkie in 1978).",
            qualifier: "presumably",
            epistemic_sources: ["prophetic_teaching"]
        },
        {
            id: "by-7",
            tier_id: "Personal Speculation",
            title: "Building Zion (The Kingdom of God)",
            description: "Zion is a literal, political, and economic kingdom to be built on earth, distinct from secular governments.",
            x_position: 700,
            y_position: 280,
            grounds: "The establishment of the State of Deseret and the Council of Fifty.",
            warrant: "God's laws should govern earthly society in preparation for the Millennium.",
            qualifier: "necessarily",
            epistemic_sources: ["historical_record"]
        },
        {
            id: "by-8",
            tier_id: "Foundational Dogma",
            title: "Intelligence is Uncreated",
            description: "The core identity or 'intelligence' of man cannot be created or destroyed.",
            x_position: 100,
            y_position: 280,
            grounds: "D&C 93:29 - 'Intelligence, or the light of truth, was not created or made, neither indeed can be.'",
            warrant: "Mankind is co-eternal with God in their fundamental essence.",
            qualifier: "necessarily",
            epistemic_sources: ["canonical_scripture"]
        }
    ],
    edges: [
        { source_node_id: "by-1", target_node_id: "by-2", relationship_type: "supports", inference_type: "deductive" },
        { source_node_id: "by-2", target_node_id: "by-3", relationship_type: "supports", inference_type: "deductive" },
        { source_node_id: "by-2", target_node_id: "by-4", relationship_type: "supports", inference_type: "inductive" },
        { source_node_id: "by-4", target_node_id: "by-5", relationship_type: "relies_upon", inference_type: "deductive" },
        { source_node_id: "by-2", target_node_id: "by-6", relationship_type: "supports", inference_type: "abductive" },
        { source_node_id: "by-8", target_node_id: "by-2", relationship_type: "supports", inference_type: "deductive" },
        { source_node_id: "by-4", target_node_id: "by-7", relationship_type: "supports", inference_type: "analogical" }
    ],
    definitions: [
        {
            term: "Intelligence",
            definition: "The uncreated, co-eternal essence of individual identity that predates spirit birth.",
            linked_nodes: ["by-8"]
        },
        {
            term: "Increase",
            definition: "The continuation of the seeds; the ability to eternally procreate spirit children.",
            linked_nodes: ["by-4", "by-5"]
        }
    ]
};
