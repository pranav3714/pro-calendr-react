import { describe, it, expect } from "vitest";
import type { Booking } from "../../interfaces/booking";
import { buildWeekBookingIndex } from "../build-week-booking-index";

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

const WEEK_DAYS = [
  new Date(2026, 1, 16), // Mon
  new Date(2026, 1, 17), // Tue
  new Date(2026, 1, 18), // Wed
  new Date(2026, 1, 19), // Thu
  new Date(2026, 1, 20), // Fri
  new Date(2026, 1, 21), // Sat
  new Date(2026, 1, 22), // Sun
];

describe("buildWeekBookingIndex", () => {
  it("returns empty map for empty bookings", () => {
    const result = buildWeekBookingIndex({ bookings: [], weekDays: WEEK_DAYS });
    expect(result.size).toBe(0);
  });

  it("maps a single booking to the correct cell key", () => {
    const bookings = [makeBooking({ id: "b-1", resourceId: "ac-1", date: "2026-02-16" })];
    const result = buildWeekBookingIndex({ bookings, weekDays: WEEK_DAYS });

    const cell = result.get("2026-02-16:ac-1");
    expect(cell).toHaveLength(1);
    expect(cell?.[0].id).toBe("b-1");
  });

  it("groups multiple bookings on the same day and resource", () => {
    const bookings = [
      makeBooking({ id: "b-1", resourceId: "ac-1", date: "2026-02-16" }),
      makeBooking({
        id: "b-2",
        resourceId: "ac-1",
        date: "2026-02-16",
        startMinutes: 660,
        endMinutes: 780,
      }),
    ];
    const result = buildWeekBookingIndex({ bookings, weekDays: WEEK_DAYS });

    expect(result.get("2026-02-16:ac-1")).toHaveLength(2);
  });

  it("places bookings across multiple days in separate cells", () => {
    const bookings = [
      makeBooking({ id: "b-1", resourceId: "ac-1", date: "2026-02-16" }),
      makeBooking({ id: "b-2", resourceId: "ac-1", date: "2026-02-18" }),
    ];
    const result = buildWeekBookingIndex({ bookings, weekDays: WEEK_DAYS });

    expect(result.get("2026-02-16:ac-1")).toHaveLength(1);
    expect(result.get("2026-02-18:ac-1")).toHaveLength(1);
  });

  it("adds booking to linked resource buckets", () => {
    const bookings = [
      makeBooking({
        id: "b-1",
        resourceId: "ac-1",
        date: "2026-02-17",
        linkedResourceIds: ["inst-1", "inst-2"],
      }),
    ];
    const result = buildWeekBookingIndex({ bookings, weekDays: WEEK_DAYS });

    expect(result.get("2026-02-17:ac-1")).toHaveLength(1);
    expect(result.get("2026-02-17:inst-1")).toHaveLength(1);
    expect(result.get("2026-02-17:inst-2")).toHaveLength(1);
  });

  it("skips bookings without a date field", () => {
    const bookings = [makeBooking({ id: "b-1", resourceId: "ac-1" })];
    const result = buildWeekBookingIndex({ bookings, weekDays: WEEK_DAYS });

    expect(result.size).toBe(0);
  });

  it("skips bookings with dates outside the week range", () => {
    const bookings = [makeBooking({ id: "b-1", resourceId: "ac-1", date: "2026-02-10" })];
    const result = buildWeekBookingIndex({ bookings, weekDays: WEEK_DAYS });

    expect(result.size).toBe(0);
  });

  it("handles large number of bookings efficiently", () => {
    const bookings: Booking[] = [];
    for (let i = 0; i < 5000; i++) {
      const dayIndex = i % 7;
      const dateKey = `2026-02-${String(16 + dayIndex).padStart(2, "0")}`;
      bookings.push(
        makeBooking({
          id: `b-${String(i)}`,
          resourceId: `r-${String(i % 100)}`,
          date: dateKey,
        }),
      );
    }

    const start = performance.now();
    const result = buildWeekBookingIndex({ bookings, weekDays: WEEK_DAYS });
    const elapsed = performance.now() - start;

    expect(result.size).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(50);
  });
});
