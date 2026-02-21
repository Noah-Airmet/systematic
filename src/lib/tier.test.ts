import { tierFromY } from "@/lib/tier";
import { defaultSystemTiers } from "@/lib/tiers";

describe("tierFromY", () => {
  test("maps y to tier", () => {
    const tiers = defaultSystemTiers();
    expect(tierFromY(80, tiers)).toBe("foundational_core");
    expect(tierFromY(380, tiers)).toBe("tier_1");
    expect(tierFromY(900, tiers)).toBe("tier_2");
  });
});
