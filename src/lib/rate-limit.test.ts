import { currentUsageDate, nextResetWindow } from "@/lib/rate-limit";

describe("rate limit helpers", () => {
  test("formats usage date", () => {
    expect(currentUsageDate(new Date("2026-02-20T12:00:00.000Z"))).toBe("2026-02-20");
  });

  test("computes next reset window", () => {
    expect(nextResetWindow(new Date("2026-02-20T08:00:00.000Z"))).toBe(
      "2026-02-21T00:00:00.000Z",
    );
  });
});
