import { tierFromY } from "@/lib/tier";
import { defaultSystemTiers } from "@/lib/tiers";

describe("tierFromY", () => {
  test("maps y to tier", () => {
    const tiers = defaultSystemTiers();
    // CANVAS_HEIGHT=850, top=40, bottom=40, usable=770, heightPerTier=192.5
    // foundational_core: 40–232.5, tier_1: 232.5–425, tier_2: 425–617.5, tier_3: 617.5–810
    expect(tierFromY(80, tiers)).toBe("foundational_core");
    expect(tierFromY(380, tiers)).toBe("tier_1");
    expect(tierFromY(500, tiers)).toBe("tier_2");
    expect(tierFromY(700, tiers)).toBe("tier_3");
  });
});
