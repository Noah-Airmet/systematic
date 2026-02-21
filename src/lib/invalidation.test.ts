import { shouldClearValidationOnNodePatch } from "@/lib/invalidation";

describe("validation invalidation", () => {
  test("clears on content changes", () => {
    expect(shouldClearValidationOnNodePatch({ title: "x" })).toBe(true);
    expect(shouldClearValidationOnNodePatch({ description: "x" })).toBe(true);
    expect(shouldClearValidationOnNodePatch({ notes: "x" })).toBe(true);
    expect(shouldClearValidationOnNodePatch({ tier_id: "official_doctrine" })).toBe(true);
  });

  test("does not clear on position-only update", () => {
    expect(shouldClearValidationOnNodePatch({ x_position: 10, y_position: 20 })).toBe(false);
  });
});
