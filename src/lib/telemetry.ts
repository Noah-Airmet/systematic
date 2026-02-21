export type TelemetryEvent =
  | "signup_completed"
  | "system_created"
  | "node_created"
  | "edge_created"
  | "validation_requested"
  | "validation_succeeded"
  | "validation_failed"
  | "validation_dismissed";

export function track(event: TelemetryEvent, payload: Record<string, string | number>) {
  console.info("[telemetry]", event, payload);
}
