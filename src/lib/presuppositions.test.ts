import { detectContradictions, filterNotFoundational, validateS1Ranks } from "@/lib/presuppositions";

describe("presupposition helpers", () => {
  test("S1 ranks enforce unique integers 0..4", () => {
    expect(
      validateS1Ranks({
        penal_substitution: 4,
        moral_influence: 3,
        christus_victor: 2,
        ransom: 1,
        solidarity: 0,
      }),
    ).toBe(true);

    expect(
      validateS1Ranks({
        penal_substitution: 4,
        moral_influence: 4,
        christus_victor: 2,
        ransom: 1,
        solidarity: 0,
      }),
    ).toBe(false);
  });

  test("contradiction checks only when both are position", () => {
    const contradictions = detectContradictions({
      M1: { mode: "position", value: "B-Theory (block universe)" },
      T3: { mode: "position", value: "Open Theism" },
    });
    expect(contradictions.length).toBeGreaterThan(0);

    const noCheck = detectContradictions({
      M1: { mode: "position", value: "B-Theory (block universe)" },
      T3: { mode: "undecided" },
    });
    expect(noCheck).toHaveLength(0);
  });

  test("filters not_foundational entries", () => {
    const filtered = filterNotFoundational({
      M1: { mode: "position", value: "B-Theory (block universe)" },
      T3: { mode: "not_foundational" },
    });

    expect(filtered.M1).toBeDefined();
    expect(filtered.T3).toBeUndefined();
  });
});
