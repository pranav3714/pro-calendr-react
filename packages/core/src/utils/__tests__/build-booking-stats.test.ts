import { describe, it, expect } from "vitest";
import { buildBookingStats } from "../build-booking-stats";
import type { Booking } from "../../interfaces/booking";
import type { BookingTypeConfig } from "../../interfaces/booking-type";

function makeBooking(overrides: Partial<Booking> & { type: string }): Booking {
  return {
    id: `booking-${Math.random().toString(36).slice(2)}`,
    resourceId: "r1",
    title: "Test Booking",
    startMinutes: 480,
    endMinutes: 540,
    status: "confirmed",
    ...overrides,
  };
}

const TEST_TYPES: Readonly<Record<string, BookingTypeConfig>> = {
  flight: {
    label: "Flight",
    dot: "bg-blue-500",
    bg: "bg-blue-50",
    border: "border-l-blue-500",
    text: "text-blue-900",
    sub: "text-blue-600",
    badge: "bg-blue-100 text-blue-700",
    ring: "ring-blue-500",
    headerBg: "bg-blue-500",
  },
  ground: {
    label: "Ground School",
    dot: "bg-amber-500",
    bg: "bg-amber-50",
    border: "border-l-amber-500",
    text: "text-amber-900",
    sub: "text-amber-600",
    badge: "bg-amber-100 text-amber-700",
    ring: "ring-amber-500",
    headerBg: "bg-amber-500",
  },
  simulator: {
    label: "Simulator",
    dot: "bg-violet-500",
    bg: "bg-violet-50",
    border: "border-l-violet-500",
    text: "text-violet-900",
    sub: "text-violet-600",
    badge: "bg-violet-100 text-violet-700",
    ring: "ring-violet-500",
    headerBg: "bg-violet-500",
  },
};

describe("buildBookingStats", () => {
  it("returns zero total and empty pills for empty bookings", () => {
    const result = buildBookingStats({
      bookings: [],
      bookingTypes: TEST_TYPES,
      activeTypeFilter: null,
    });

    expect(result.totalCount).toBe(0);
    expect(result.pills).toHaveLength(0);
  });

  it("counts a single booking type correctly", () => {
    const bookings = [
      makeBooking({ type: "flight" }),
      makeBooking({ type: "flight" }),
      makeBooking({ type: "flight" }),
    ];

    const result = buildBookingStats({
      bookings,
      bookingTypes: TEST_TYPES,
      activeTypeFilter: null,
    });

    expect(result.totalCount).toBe(3);
    expect(result.pills).toHaveLength(1);
    expect(result.pills[0].type).toBe("flight");
    expect(result.pills[0].count).toBe(3);
    expect(result.pills[0].label).toBe("Flight");
    expect(result.pills[0].dotClass).toBe("bg-blue-500");
    expect(result.pills[0].isActive).toBe(false);
  });

  it("counts multiple booking types correctly", () => {
    const bookings = [
      makeBooking({ type: "flight" }),
      makeBooking({ type: "flight" }),
      makeBooking({ type: "ground" }),
      makeBooking({ type: "simulator" }),
      makeBooking({ type: "simulator" }),
    ];

    const result = buildBookingStats({
      bookings,
      bookingTypes: TEST_TYPES,
      activeTypeFilter: null,
    });

    expect(result.totalCount).toBe(5);
    expect(result.pills).toHaveLength(3);
    expect(result.pills[0].count).toBe(2);
    expect(result.pills[1].count).toBe(1);
    expect(result.pills[2].count).toBe(2);
  });

  it("excludes types with zero bookings from pills", () => {
    const bookings = [makeBooking({ type: "flight" })];

    const result = buildBookingStats({
      bookings,
      bookingTypes: TEST_TYPES,
      activeTypeFilter: null,
    });

    expect(result.pills).toHaveLength(1);
    expect(result.pills[0].type).toBe("flight");
  });

  it("sets isActive on the matching filter type", () => {
    const bookings = [makeBooking({ type: "flight" }), makeBooking({ type: "ground" })];

    const result = buildBookingStats({
      bookings,
      bookingTypes: TEST_TYPES,
      activeTypeFilter: "flight",
    });

    expect(result.pills).toHaveLength(2);

    const flightPill = result.pills.find((p) => p.type === "flight");
    const groundPill = result.pills.find((p) => p.type === "ground");

    expect(flightPill?.isActive).toBe(true);
    expect(groundPill?.isActive).toBe(false);
  });

  it("no pill is active when activeTypeFilter is null", () => {
    const bookings = [makeBooking({ type: "flight" }), makeBooking({ type: "ground" })];

    const result = buildBookingStats({
      bookings,
      bookingTypes: TEST_TYPES,
      activeTypeFilter: null,
    });

    for (const pill of result.pills) {
      expect(pill.isActive).toBe(false);
    }
  });

  it("counts bookings with unknown types in total but creates no pill", () => {
    const bookings = [
      makeBooking({ type: "flight" }),
      makeBooking({ type: "mystery" }),
      makeBooking({ type: "mystery" }),
    ];

    const result = buildBookingStats({
      bookings,
      bookingTypes: TEST_TYPES,
      activeTypeFilter: null,
    });

    expect(result.totalCount).toBe(3);
    expect(result.pills).toHaveLength(1);
    expect(result.pills[0].type).toBe("flight");
  });

  it("preserves booking type order from bookingTypes config", () => {
    const bookings = [
      makeBooking({ type: "simulator" }),
      makeBooking({ type: "flight" }),
      makeBooking({ type: "ground" }),
    ];

    const result = buildBookingStats({
      bookings,
      bookingTypes: TEST_TYPES,
      activeTypeFilter: null,
    });

    expect(result.pills[0].type).toBe("flight");
    expect(result.pills[1].type).toBe("ground");
    expect(result.pills[2].type).toBe("simulator");
  });

  it("populates badge and ring classes from booking type config", () => {
    const bookings = [makeBooking({ type: "flight" })];

    const result = buildBookingStats({
      bookings,
      bookingTypes: TEST_TYPES,
      activeTypeFilter: null,
    });

    expect(result.pills[0].badgeClass).toBe("bg-blue-100 text-blue-700");
    expect(result.pills[0].ringClass).toBe("ring-blue-500");
  });
});
