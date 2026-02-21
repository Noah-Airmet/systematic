export function shouldClearValidationOnNodePatch(changes: {
  title?: string;
  description?: string;
  notes?: string;
  x_position?: number;
  y_position?: number;
  tier_id?: string;
}) {
  return (
    typeof changes.title !== "undefined" ||
    typeof changes.description !== "undefined" ||
    typeof changes.notes !== "undefined" ||
    typeof changes.tier_id !== "undefined"
  );
}
