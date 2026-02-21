import { SystemTier, TierId } from "@/lib/types";
import { defaultSystemTiers, tierFromY as fromDynamicTiers } from "@/lib/tiers";

export function tierFromY(y: number, tiers: SystemTier[] = defaultSystemTiers()): TierId {
  return fromDynamicTiers(y, tiers);
}
