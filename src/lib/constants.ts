import { Presuppositions } from "@/lib/types";

export const VALIDATOR_DISCLAIMER =
  "This analysis reflects common philosophical and theological frameworks. It is not authoritative.";

export const FOUNDATIONAL_NODES = [
  "God exists.",
  "Jesus Christ is the Savior.",
  "Joseph Smith was a prophet.",
  "Baptism is required.",
];

export const DEFAULT_PRESUPPOSITIONS: Presuppositions = {
  E3: { mode: "undecided" },
  M1: { mode: "undecided" },
  M3: { mode: "undecided" },
  T1: { mode: "undecided" },
  T3: { mode: "undecided" },
  T5: { mode: "undecided" },
  A2: { mode: "undecided" },
  S1: { mode: "undecided" },
};

export const MVP_QUESTIONS = [
  {
    id: "E3",
    label: "Prophetic Infallibility",
    options: ["Fully fallibilist", "High inerrancy"],
    type: "choice",
  },
  {
    id: "M1",
    label: "Theory of Time",
    options: ["A-Theory (dynamic present)", "B-Theory (block universe)"],
    type: "choice",
  },
  {
    id: "M3",
    label: "Metaphysics of Creation",
    options: ["Creatio ex materia", "Creatio ex nihilo"],
    type: "choice",
  },
  {
    id: "T1",
    label: "Nature of God",
    options: ["Embodied, relational, passible", "Classical Theism"],
    type: "choice",
  },
  {
    id: "T3",
    label: "Divine Omniscience",
    options: ["Open Theism", "Exhaustive foreknowledge"],
    type: "choice",
  },
  {
    id: "T5",
    label: "Lorenzo Snow Couplet",
    options: ["Literal cosmological claim", "Metaphorical/aspirational"],
    type: "choice",
  },
  {
    id: "A2",
    label: "Agency",
    options: ["Libertarian free will", "Compatibilist free will"],
    type: "choice",
  },
  {
    id: "S1",
    label: "Atonement Mechanism",
    options: ["Penal Substitution", "Moral Influence", "Christus Victor", "Ransom", "Solidarity"],
    type: "choice",
  },
] as const;

export const CONTRADICTION_PAIRS = [
  {
    left: "M1",
    right: "T3",
    severity: "hard",
    message:
      "B-Theory + Open Theism is a hard contradiction: a fixed block future conflicts with an open future.",
    check: (a: string, b: string) => a === "B-Theory (block universe)" && b === "Open Theism",
  },
  {
    left: "T1",
    right: "T3",
    severity: "hard",
    message:
      "Classical Theism + Open Theism is traditionally incompatible (immutability/atemporality vs genuinely open future).",
    check: (a: string, b: string) => a === "Classical Theism" && b === "Open Theism",
  },
  {
    left: "M3",
    right: "T5",
    severity: "warning",
    message:
      "Creatio ex nihilo with literal Lorenzo Snow cosmology creates significant metaphysical tension.",
    check: (a: string, b: string) => a === "Creatio ex nihilo" && b === "Literal cosmological claim",
  },
  {
    left: "T1",
    right: "T5",
    severity: "hard",
    message:
      "Classical immutability conflicts with a literal divine progression claim in the Lorenzo Snow couplet.",
    check: (a: string, b: string) => a === "Classical Theism" && b === "Literal cosmological claim",
  },
  {
    left: "T3",
    right: "A2",
    severity: "warning",
    message:
      "Exhaustive foreknowledge and libertarian free will is a known philosophical tension.",
    check: (a: string, b: string) => a === "Exhaustive foreknowledge" && b === "Libertarian free will",
  },
] as const;
