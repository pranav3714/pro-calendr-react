import { describe, it, expect } from "vitest";
import type { Booking } from "../../interfaces/booking";
import { buildMonthCounts } from "../build-month-counts";
import { getMonthDays } from "../date-helpers";

function makeBooking(overrides: Partial<Booking> & { id: string; resourceId: string }): Booking {
  return {
    type: "flight",
    title: "Test",
    startMinutes: 480,
    endMinutes: 600,
    status: "confirmed",
    ...overrides,
  };
}

const FEB_2026 = new Date(2026, 1, 1);
const MONTH_DAYS = getMonthDays({ date: FEB_2026 });

describe("buildMonthCounts", () => {
  it("returns zero counts for empty bookings", () => {
    const result = buildMonthCounts({ bookings: [], monthDays: MONTH_DAYS });

    expect(result.size).toBe(MONTH_DAYS.length);
    const feb1 = result.get("2026-02-01");
    expect(feb1).toBeDefined();
    expect(feb1?.total).toBe(0);
    expect(Object.keys(feb1?.byType ?? {})).toHaveLength(0);
  });

  it("counts a single booking correctly", () => {
    const bookings = [makeBooking({ id: "b-1", resourceId: "ac-1", date: "2026-02-10" })];
    const result = buildMonthCounts({ bookings, monthDays: MONTH_DAYS });

    const counts = result.get("2026-02-10");
    expect(counts).toBeDefined();
    expect(counts?.total).toBe(1);
    expect(counts?.byType.flight).toBe(1);
  });

  it("counts multiple types on the same day", () => {
    const bookings = [
      makeBooking({ id: "b-1", resourceId: "ac-1", date: "2026-02-15", type: "flight" }),
      makeBooking({ id: "b-2", resourceId: "ac-2", date: "2026-02-15", type: "simulator" }),
      makeBooking({ id: "b-3", resourceId: "ac-3", date: "2026-02-15", type: "flight" }),
    ];
    const result = buildMonthCounts({ bookings, monthDays: MONTH_DAYS });

    const counts = result.get("2026-02-15");
    expect(counts).toBeDefined();
    expect(counts?.total).toBe(3);
    expect(counts?.byType.flight).toBe(2);
    expect(counts?.byType.simulator).toBe(1);
  });

  it("handles bookings across multiple days", () => {
    const bookings = [
      makeBooking({ id: "b-1", resourceId: "ac-1", date: "2026-02-05" }),
      makeBooking({ id: "b-2", resourceId: "ac-1", date: "2026-02-20" }),
    ];
    const result = buildMonthCounts({ bookings, monthDays: MONTH_DAYS });

    expect(result.get("2026-02-05")?.total).toBe(1);
    expect(result.get("2026-02-20")?.total).toBe(1);
    expect(result.get("2026-02-10")?.total).toBe(0);
  });

  it("ignores bookings without a date field", () => {
    const bookings = [makeBooking({ id: "b-1", resourceId: "ac-1" })];
    const result = buildMonthCounts({ bookings, monthDays: MONTH_DAYS });

    let totalAcrossAll = 0;
    for (const counts of result.values()) {
      totalAcrossAll += counts.total;
    }
    expect(totalAcrossAll).toBe(0);
  });

  it("ignores bookings with dates not in the month grid", () => {
    const bookings = [makeBooking({ id: "b-1", resourceId: "ac-1", date: "2026-04-15" })];
    const result = buildMonthCounts({ bookings, monthDays: MONTH_DAYS });

    let totalAcrossAll = 0;
    for (const counts of result.values()) {
      totalAcrossAll += counts.total;
    }
    expect(totalAcrossAll).toBe(0);
  });

  it("includes padding days from adjacent months in the grid", () => {
    const result = buildMonthCounts({ bookings: [], monthDays: MONTH_DAYS });

    // Feb 2026 starts on Sunday, so Monday-first grid includes Jan 26 as first day
    expect(result.has("2026-01-26")).toBe(true);
  });
});
