import { SystemTier, TierId } from "@/lib/types";

export const CANVAS_HEIGHT = 850;
export const FOUNDATIONAL_TIER_ID = "foundational_core";

export type TierBand = {
  id: TierId;
  name: string;
  yMin: number;
  yMax: number;
  yCenter: number;
  order: number;
  is_foundational?: boolean;
};

function withDefaults(tier: Partial<SystemTier>, fallbackOrder: number): SystemTier {
  return {
    id: typeof tier.id === "string" && tier.id ? tier.id : `tier_${fallbackOrder}`,
    name: typeof tier.name === "string" && tier.name ? tier.name : `Tier ${fallbackOrder + 1}`,
    order: typeof tier.order === "number" ? tier.order : fallbackOrder,
    is_foundational: Boolean(tier.is_foundational),
  };
}

function sortByOrder(tiers: SystemTier[]) {
  return [...tiers].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function reindex(tiers: SystemTier[]) {
  return sortByOrder(tiers).map((tier, index) => ({ ...tier, order: index }));
}

export function defaultSystemTiers(): SystemTier[] {
  return [
    { id: FOUNDATIONAL_TIER_ID, name: "Foundational Dogma", order: 0, is_foundational: true },
    { id: "tier_1", name: "Official Doctrine", order: 1, is_foundational: false },
    { id: "tier_2", name: "Theological Deduction", order: 2, is_foundational: false },
    { id: "tier_3", name: "Personal Speculation", order: 3, is_foundational: false },
  ];
}

export function normalizeSystemTiers(tiers: unknown): SystemTier[] {
  if (!Array.isArray(tiers)) {
    return defaultSystemTiers();
  }

  const clean = tiers
    .filter((item) => typeof item === "object" && item !== null)
    .map((item, index) => withDefaults(item as Partial<SystemTier>, index));

  if (!clean.length) {
    return defaultSystemTiers();
  }

  const foundationIdx = clean.findIndex((tier) => tier.id === FOUNDATIONAL_TIER_ID || tier.is_foundational);
  if (foundationIdx < 0) {
    clean.unshift({ id: FOUNDATIONAL_TIER_ID, name: "Foundational Dogma", is_foundational: true, order: 0 });
  }

  const marked = clean.map((tier) =>
    tier.id === FOUNDATIONAL_TIER_ID
      ? { ...tier, name: "Foundational Dogma", is_foundational: true }
      : { ...tier, is_foundational: false },
  );

  const foundation = marked.find((tier) => tier.id === FOUNDATIONAL_TIER_ID)!;
  const withoutFoundation = marked.filter((tier) => tier.id !== FOUNDATIONAL_TIER_ID);

  return reindex([foundation, ...withoutFoundation]);
}

export function buildTierBands(tiers: SystemTier[], canvasHeight = CANVAS_HEIGHT): TierBand[] {
  const normalized = normalizeSystemTiers(tiers);
  const top = 40;
  const bottom = 40;
  const usable = canvasHeight - top - bottom;
  const heightPerTier = usable / normalized.length;

  return normalized.map((tier, index) => {
    const yMin = top + index * heightPerTier;
    const yMax = yMin + heightPerTier;
    return {
      id: tier.id,
      name: tier.name,
      order: tier.order ?? index,
      yMin,
      yMax,
      yCenter: (yMin + yMax) / 2,
      is_foundational: tier.is_foundational,
    };
  });
}

export function tierFromY(y: number, tiers: SystemTier[]): TierId {
  const bands = buildTierBands(tiers);
  const band = bands.find((t) => y >= t.yMin && y < t.yMax);
  return band?.id ?? bands[bands.length - 1]?.id ?? FOUNDATIONAL_TIER_ID;
}

export function addCustomTier(tiers: SystemTier[]) {
  const normalized = normalizeSystemTiers(tiers);
  const foundation = normalized.find((tier) => tier.id === FOUNDATIONAL_TIER_ID)!;
  const custom = normalized.filter((tier) => tier.id !== FOUNDATIONAL_TIER_ID);

  const newTier: SystemTier = {
    id: `tier_${Date.now()}`,
    name: `Tier ${custom.length + 2}`,
    order: custom.length + 1,
    is_foundational: false,
  };

  return reindex([foundation, ...custom, newTier]);
}

export function removeTopCustomTier(tiers: SystemTier[]) {
  const normalized = normalizeSystemTiers(tiers);
  const foundation = normalized.find((tier) => tier.id === FOUNDATIONAL_TIER_ID)!;
  const custom = normalized.filter((tier) => tier.id !== FOUNDATIONAL_TIER_ID);

  if (!custom.length) {
    return null;
  }

  const removed = custom[custom.length - 1];
  const remaining = normalized.filter((tier) => tier.id !== removed.id);
  const targetTier = custom[custom.length - 2] ?? foundation;

  return {
    tiers: reindex(remaining),
    removedTierId: removed.id,
    targetTierId: targetTier.id,
  };
}

export function renameTier(tiers: SystemTier[], tierId: string, name: string) {
  const normalized = normalizeSystemTiers(tiers);
  return normalized.map((tier) => (tier.id === tierId ? { ...tier, name: name.trim() || tier.name } : tier));
}

export function moveTier(tiers: SystemTier[], tierId: string, direction: "up" | "down") {
  const normalized = normalizeSystemTiers(tiers);
  const foundation = normalized.find((tier) => tier.id === FOUNDATIONAL_TIER_ID);
  const custom = normalized.filter((tier) => tier.id !== FOUNDATIONAL_TIER_ID);
  const index = custom.findIndex((tier) => tier.id === tierId);
  if (index < 0) return normalized;

  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= custom.length) return normalized;

  const clone = [...custom];
  [clone[index], clone[target]] = [clone[target], clone[index]];

  return reindex([foundation!, ...(clone as SystemTier[])]);
}

export function moveTierToIndex(tiers: SystemTier[], tierId: string, targetCustomIndex: number) {
  const normalized = normalizeSystemTiers(tiers);
  const foundation = normalized.find((tier) => tier.id === FOUNDATIONAL_TIER_ID)!;
  const custom = normalized.filter((tier) => tier.id !== FOUNDATIONAL_TIER_ID);
  const currentIndex = custom.findIndex((tier) => tier.id === tierId);
  if (currentIndex < 0) return normalized;

  const boundedTarget = Math.max(0, Math.min(targetCustomIndex, custom.length - 1));
  if (boundedTarget === currentIndex) return normalized;

  const next = [...custom];
  const [moved] = next.splice(currentIndex, 1);
  next.splice(boundedTarget, 0, moved);

  return reindex([foundation, ...next]);
}
