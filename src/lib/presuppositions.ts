import { CONTRADICTION_PAIRS } from "@/lib/constants";
import { Presuppositions, S1RankValue } from "@/lib/types";

export function validateS1Ranks(value: S1RankValue): boolean {
  const vals = Object.values(value);
  if (vals.length !== 5) return false;
  const unique = new Set(vals);
  if (unique.size !== 5) return false;
  return vals.every((v) => Number.isInteger(v) && v >= 0 && v <= 4);
}

export function filterNotFoundational(p: Presuppositions): Presuppositions {
  return Object.fromEntries(
    Object.entries(p).filter(([, v]) => v.mode !== "not_foundational"),
  );
}

export function detectContradictions(p: Presuppositions) {
  const output: Array<{ pair: string; severity: "hard" | "warning"; message: string }> = [];

  for (const pair of CONTRADICTION_PAIRS) {
    const left = p[pair.left];
    const right = p[pair.right];
    if (!left || !right) continue;
    if (left.mode !== "position" || right.mode !== "position") continue;
    if (typeof left.value !== "string" || typeof right.value !== "string") continue;
    if (pair.check(left.value, right.value)) {
      output.push({
        pair: `${pair.left} + ${pair.right}`,
        severity: pair.severity,
        message: pair.message,
      });
    }
  }

  return output;
}
