import { format } from "date-fns";

export const DAILY_VALIDATION_LIMIT = 20;

export function currentUsageDate(d = new Date()) {
  return format(d, "yyyy-MM-dd");
}

export function nextResetWindow(now = new Date()) {
  const dt = new Date(now);
  dt.setUTCHours(24, 0, 0, 0);
  return dt.toISOString();
}
