export function shouldClearValidationOnNodePatch(changes: {
  title?: string;
  description?: string;
  notes?: string;
  x_position?: number;
  y_position?: number;
  tier_id?: string;
  grounds?: string;
  warrant?: string;
  backing?: string;
  qualifier?: string | null;
  rebuttal?: string;
}) {
  return (
    typeof changes.title !== "undefined" ||
    typeof changes.description !== "undefined" ||
    typeof changes.notes !== "undefined" ||
    typeof changes.tier_id !== "undefined" ||
    typeof changes.grounds !== "undefined" ||
    typeof changes.warrant !== "undefined" ||
    typeof changes.backing !== "undefined" ||
    typeof changes.qualifier !== "undefined" ||
    typeof changes.rebuttal !== "undefined"
  );
}
