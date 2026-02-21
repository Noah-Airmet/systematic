import { NodeRow, SystemTier } from "@/lib/types";
import { buildTierBands, FOUNDATIONAL_TIER_ID } from "@/lib/tiers";

const FOUNDATION_MIN_X = 120;
const FOUNDATION_MAX_X = 1200;
const FOUNDATION_NODE_WIDTH = 190;
const FOUNDATION_NODE_HEIGHT = 90;
const FOUNDATION_GAP_X = 18;
const FOUNDATION_GAP_Y = 14;

function foundationTopY(tiers: SystemTier[]) {
  const band = buildTierBands(tiers).find((tier) => tier.id === FOUNDATIONAL_TIER_ID);
  if (!band) return 80;
  return band.yMin + 50;
}

export function foundationPosition(index: number, total: number, tiers: SystemTier[]) {
  const topY = foundationTopY(tiers);
  const usableWidth = FOUNDATION_MAX_X - FOUNDATION_MIN_X;
  const perNode = FOUNDATION_NODE_WIDTH + FOUNDATION_GAP_X;
  const columns = Math.max(1, Math.floor((usableWidth + FOUNDATION_GAP_X) / perNode));
  const row = Math.floor(index / columns);
  const col = index % columns;
  const nodesInRow = row === Math.floor((total - 1) / columns) ? (total % columns || columns) : columns;
  const rowWidth = nodesInRow * FOUNDATION_NODE_WIDTH + (nodesInRow - 1) * FOUNDATION_GAP_X;
  const startX = FOUNDATION_MIN_X + Math.max(0, (usableWidth - rowWidth) / 2);

  return {
    x: startX + col * (FOUNDATION_NODE_WIDTH + FOUNDATION_GAP_X),
    y: topY + row * (FOUNDATION_NODE_HEIGHT + FOUNDATION_GAP_Y),
  };
}

export function foundationalNodeUpdates(nodes: NodeRow[], tiers: SystemTier[]) {
  const foundational = nodes
    .filter((node) => node.tier_id === FOUNDATIONAL_TIER_ID)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

  return foundational
    .map((node, index) => {
      const position = foundationPosition(index, foundational.length, tiers);
      if (node.x_position === position.x && node.y_position === position.y) {
        return null;
      }

      return {
        id: node.id,
        x_position: position.x,
        y_position: position.y,
      };
    })
    .filter(Boolean) as Array<{ id: string; x_position: number; y_position: number }>;
}

export function applyFoundationalLayout(nodes: NodeRow[], tiers: SystemTier[]) {
  const updates = foundationalNodeUpdates(nodes, tiers);
  if (!updates.length) return nodes;

  const updateMap = new Map(updates.map((item) => [item.id, item]));

  return nodes.map((node) => {
    const update = updateMap.get(node.id);
    if (!update) return node;
    return {
      ...node,
      x_position: update.x_position,
      y_position: update.y_position,
    };
  });
}
