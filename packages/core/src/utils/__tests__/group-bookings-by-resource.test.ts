import { describe, it, expect } from "vitest";
import { groupBookingsByResource } from "../group-bookings-by-resource";
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

describe("groupBookingsByResource", () => {
  it("returns an empty map for no bookings", () => {
    const result = groupBookingsByResource({ bookings: [] });
    expect(result.size).toBe(0);
  });

  it("groups a single booking by its resourceId", () => {
    const bookings = [makeBooking({ id: "a", resourceId: "r1" })];
    const result = groupBookingsByResource({ bookings });
    expect(result.get("r1")).toHaveLength(1);
    expect(result.get("r1")?.[0].id).toBe("a");
  });

  it("groups multiple bookings to same resource", () => {
    const bookings = [
      makeBooking({ id: "a", resourceId: "r1" }),
      makeBooking({ id: "b", resourceId: "r1" }),
    ];
    const result = groupBookingsByResource({ bookings });
    expect(result.get("r1")).toHaveLength(2);
  });

  it("groups bookings to different resources", () => {
    const bookings = [
      makeBooking({ id: "a", resourceId: "r1" }),
      makeBooking({ id: "b", resourceId: "r2" }),
    ];
    const result = groupBookingsByResource({ bookings });
    expect(result.get("r1")).toHaveLength(1);
    expect(result.get("r2")).toHaveLength(1);
  });

  it("adds booking to linked resources as well", () => {
    const bookings = [
      makeBooking({
        id: "a",
        resourceId: "r1",
        linkedResourceIds: ["r2", "r3"],
      }),
    ];
    const result = groupBookingsByResource({ bookings });
    expect(result.get("r1")).toHaveLength(1);
    expect(result.get("r2")).toHaveLength(1);
    expect(result.get("r3")).toHaveLength(1);
    expect(result.get("r2")?.[0].id).toBe("a");
  });

  it("handles booking with empty linkedResourceIds", () => {
    const bookings = [makeBooking({ id: "a", resourceId: "r1", linkedResourceIds: [] })];
    const result = groupBookingsByResource({ bookings });
    expect(result.size).toBe(1);
    expect(result.get("r1")).toHaveLength(1);
  });

  it("handles booking without linkedResourceIds", () => {
    const bookings = [makeBooking({ id: "a", resourceId: "r1" })];
    const result = groupBookingsByResource({ bookings });
    expect(result.size).toBe(1);
  });

  it("handles large dataset efficiently", () => {
    const bookings = Array.from({ length: 5000 }, (_, i) =>
      makeBooking({
        id: `b${String(i)}`,
        resourceId: `r${String(i % 100)}`,
      }),
    );
    const start = performance.now();
    const result = groupBookingsByResource({ bookings });
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(20);
    expect(result.size).toBe(100);
    expect(result.get("r0")).toHaveLength(50);
  });
});
