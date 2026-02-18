import { describe, it, expect } from "vitest";
import { assignLanes } from "../lane-allocation";
import type { Booking } from "../../interfaces/booking";

function makeBooking(overrides: Partial<Booking> & { id: string }): Booking {
  return {
    resourceId: "r1",
    type: "flight",
    title: "Test",
    startMinutes: 0,
    endMinutes: 60,
    status: "confirmed",
    ...overrides,
  };
}

describe("assignLanes", () => {
  it("returns empty result for no bookings", () => {
    const result = assignLanes({ bookings: [] });
    expect(result.laneCount).toBe(0);
    expect(result.laneAssignments.size).toBe(0);
  });

  it("assigns a single booking to lane 0", () => {
    const bookings = [makeBooking({ id: "a", startMinutes: 60, endMinutes: 120 })];
    const result = assignLanes({ bookings });
    expect(result.laneCount).toBe(1);
    expect(result.laneAssignments.get("a")).toBe(0);
  });

  it("assigns non-overlapping bookings to the same lane", () => {
    const bookings = [
      makeBooking({ id: "a", startMinutes: 60, endMinutes: 120 }),
      makeBooking({ id: "b", startMinutes: 180, endMinutes: 240 }),
    ];
    const result = assignLanes({ bookings });
    expect(result.laneCount).toBe(1);
    expect(result.laneAssignments.get("a")).toBe(0);
    expect(result.laneAssignments.get("b")).toBe(0);
  });

  it("assigns overlapping bookings to different lanes", () => {
    const bookings = [
      makeBooking({ id: "a", startMinutes: 60, endMinutes: 180 }),
      makeBooking({ id: "b", startMinutes: 120, endMinutes: 240 }),
    ];
    const result = assignLanes({ bookings });
    expect(result.laneCount).toBe(2);
    expect(result.laneAssignments.get("a")).toBe(0);
    expect(result.laneAssignments.get("b")).toBe(1);
  });

  it("handles three overlapping bookings in a chain", () => {
    const bookings = [
      makeBooking({ id: "a", startMinutes: 0, endMinutes: 120 }),
      makeBooking({ id: "b", startMinutes: 60, endMinutes: 180 }),
      makeBooking({ id: "c", startMinutes: 120, endMinutes: 240 }),
    ];
    const result = assignLanes({ bookings });
    expect(result.laneCount).toBe(2);
    expect(result.laneAssignments.get("a")).toBe(0);
    expect(result.laneAssignments.get("b")).toBe(1);
    expect(result.laneAssignments.get("c")).toBe(0);
  });

  it("handles all bookings at the same time", () => {
    const bookings = [
      makeBooking({ id: "a", startMinutes: 60, endMinutes: 120 }),
      makeBooking({ id: "b", startMinutes: 60, endMinutes: 120 }),
      makeBooking({ id: "c", startMinutes: 60, endMinutes: 120 }),
    ];
    const result = assignLanes({ bookings });
    expect(result.laneCount).toBe(3);
    expect(result.laneAssignments.get("a")).toBe(0);
    expect(result.laneAssignments.get("b")).toBe(1);
    expect(result.laneAssignments.get("c")).toBe(2);
  });

  it("does not treat touching bookings as overlapping", () => {
    const bookings = [
      makeBooking({ id: "a", startMinutes: 60, endMinutes: 120 }),
      makeBooking({ id: "b", startMinutes: 120, endMinutes: 180 }),
    ];
    const result = assignLanes({ bookings });
    expect(result.laneCount).toBe(1);
  });

  it("handles zero-duration bookings", () => {
    const bookings = [
      makeBooking({ id: "a", startMinutes: 60, endMinutes: 60 }),
      makeBooking({ id: "b", startMinutes: 60, endMinutes: 60 }),
    ];
    const result = assignLanes({ bookings });
    expect(result.laneAssignments.get("a")).toBe(0);
    expect(result.laneAssignments.get("b")).toBe(0);
  });

  it("handles unsorted input correctly", () => {
    const bookings = [
      makeBooking({ id: "c", startMinutes: 240, endMinutes: 300 }),
      makeBooking({ id: "a", startMinutes: 60, endMinutes: 180 }),
      makeBooking({ id: "b", startMinutes: 120, endMinutes: 240 }),
    ];
    const result = assignLanes({ bookings });
    expect(result.laneCount).toBe(2);
    expect(result.laneAssignments.get("a")).toBe(0);
    expect(result.laneAssignments.get("b")).toBe(1);
    expect(result.laneAssignments.get("c")).toBe(0);
  });

  it("assigns every booking an id in the map", () => {
    const bookings = Array.from({ length: 20 }, (_, i) =>
      makeBooking({
        id: `b${String(i)}`,
        startMinutes: i * 30,
        endMinutes: i * 30 + 60,
      }),
    );
    const result = assignLanes({ bookings });
    for (const b of bookings) {
      expect(result.laneAssignments.has(b.id)).toBe(true);
    }
  });

  it("handles complex mixed overlaps", () => {
    const bookings = [
      makeBooking({ id: "a", startMinutes: 0, endMinutes: 60 }),
      makeBooking({ id: "b", startMinutes: 30, endMinutes: 90 }),
      makeBooking({ id: "c", startMinutes: 60, endMinutes: 120 }),
      makeBooking({ id: "d", startMinutes: 90, endMinutes: 150 }),
    ];
    const result = assignLanes({ bookings });
    expect(result.laneCount).toBe(2);
    expect(result.laneAssignments.get("a")).toBe(0);
    expect(result.laneAssignments.get("b")).toBe(1);
    expect(result.laneAssignments.get("c")).toBe(0);
    expect(result.laneAssignments.get("d")).toBe(1);
  });

  it("handles 500+ bookings within performance limits", () => {
    const bookings = Array.from({ length: 500 }, (_, i) =>
      makeBooking({
        id: `b${String(i)}`,
        startMinutes: (i % 24) * 60,
        endMinutes: (i % 24) * 60 + 45,
      }),
    );
    const start = performance.now();
    const result = assignLanes({ bookings });
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(50);
    expect(result.laneAssignments.size).toBe(500);
  });

  it("handles 1000 bookings within 50ms", () => {
    const bookings = Array.from({ length: 1000 }, (_, i) =>
      makeBooking({
        id: `bk${String(i)}`,
        startMinutes: Math.floor((i * 7) % 1440),
        endMinutes: Math.floor((i * 7) % 1440) + 60 + (i % 90),
      }),
    );
    const start = performance.now();
    const result = assignLanes({ bookings });
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(50);
    expect(result.laneAssignments.size).toBe(1000);
  });

  it("handles a single very long booking spanning the entire day", () => {
    const bookings = [
      makeBooking({ id: "long", startMinutes: 0, endMinutes: 1440 }),
      makeBooking({ id: "short", startMinutes: 480, endMinutes: 540 }),
    ];
    const result = assignLanes({ bookings });
    expect(result.laneCount).toBe(2);
    expect(result.laneAssignments.get("long")).toBe(0);
    expect(result.laneAssignments.get("short")).toBe(1);
  });
});
