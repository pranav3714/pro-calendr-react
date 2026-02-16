import { describe, it, expect } from "vitest";
import { TZDate } from "@date-fns/tz";
import { calculateEventPosition, calculateTimelinePosition } from "../event-position";
import type { CalendarEvent } from "../../types";

function makeEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: "1",
    title: "Test",
    start: new Date(2026, 1, 14, 9, 0),
    end: new Date(2026, 1, 14, 10, 0),
    ...overrides,
  };
}

describe("calculateEventPosition", () => {
  const slotMinTime = "00:00";
  const slotDuration = 30; // minutes
  const slotHeight = 40; // pixels

  it("positions event at 9:00 AM correctly", () => {
    const event = makeEvent({
      start: new Date(2026, 1, 14, 9, 0),
      end: new Date(2026, 1, 14, 10, 0),
    });
    const pos = calculateEventPosition(event, slotMinTime, slotDuration, slotHeight);
    // 9 hours * 60 minutes / 30 min/slot * 40 px/slot = 720
    expect(pos.top).toBe(720);
    // 60 minutes / 30 min/slot * 40 px/slot = 80
    expect(pos.height).toBe(80);
  });

  it("positions event at midnight correctly", () => {
    const event = makeEvent({
      start: new Date(2026, 1, 14, 0, 0),
      end: new Date(2026, 1, 14, 0, 30),
    });
    const pos = calculateEventPosition(event, slotMinTime, slotDuration, slotHeight);
    expect(pos.top).toBe(0);
    expect(pos.height).toBe(40);
  });

  it("handles custom slotMinTime", () => {
    const event = makeEvent({
      start: new Date(2026, 1, 14, 9, 0),
      end: new Date(2026, 1, 14, 10, 0),
    });
    const pos = calculateEventPosition(event, "08:00", slotDuration, slotHeight);
    // (9:00 - 8:00) = 60 min / 30 * 40 = 80
    expect(pos.top).toBe(80);
  });

  it("enforces minimum height of half a slot", () => {
    const event = makeEvent({
      start: new Date(2026, 1, 14, 9, 0),
      end: new Date(2026, 1, 14, 9, 5),
    });
    const pos = calculateEventPosition(event, slotMinTime, slotDuration, slotHeight);
    // 5 min event → 5/30 * 40 = 6.67px which is less than 20px (half slot)
    expect(pos.height).toBe(slotHeight / 2);
  });

  it("handles 15-minute slot duration", () => {
    const event = makeEvent({
      start: new Date(2026, 1, 14, 9, 0),
      end: new Date(2026, 1, 14, 9, 30),
    });
    const pos = calculateEventPosition(event, "00:00", 15, 30);
    // 9h * 60min / 15 * 30 = 1080
    expect(pos.top).toBe(1080);
    // 30min / 15 * 30 = 60
    expect(pos.height).toBe(60);
  });
});

describe("calculateTimelinePosition", () => {
  const rangeStart = new Date(2026, 1, 14, 0, 0); // Feb 14, midnight
  const rangeEnd = new Date(2026, 1, 14, 24, 0); // Feb 14, end of day

  it("positions event at start of range", () => {
    const event = makeEvent({ start: rangeStart, end: new Date(2026, 1, 14, 1, 0) });
    const pos = calculateTimelinePosition(event, rangeStart, rangeEnd);
    expect(pos.left).toBeCloseTo(0, 1);
    // 1 hour out of 24 = 4.17%
    expect(pos.width).toBeCloseTo(100 / 24, 1);
  });

  it("positions event in the middle of range", () => {
    const event = makeEvent({
      start: new Date(2026, 1, 14, 12, 0),
      end: new Date(2026, 1, 14, 13, 0),
    });
    const pos = calculateTimelinePosition(event, rangeStart, rangeEnd);
    expect(pos.left).toBeCloseTo(50, 1);
    expect(pos.width).toBeCloseTo(100 / 24, 1);
  });

  it("clips event that starts before range", () => {
    const event = makeEvent({
      start: new Date(2026, 1, 13, 22, 0),
      end: new Date(2026, 1, 14, 2, 0),
    });
    const pos = calculateTimelinePosition(event, rangeStart, rangeEnd);
    expect(pos.left).toBe(0);
    // Only 2 hours visible
    expect(pos.width).toBeCloseTo((2 / 24) * 100, 1);
  });

  it("clips event that ends after range", () => {
    const event = makeEvent({
      start: new Date(2026, 1, 14, 22, 0),
      end: new Date(2026, 1, 15, 2, 0),
    });
    const pos = calculateTimelinePosition(event, rangeStart, rangeEnd);
    expect(pos.left).toBeCloseTo((22 / 24) * 100, 1);
    // Only 2 hours visible (22:00-24:00)
    expect(pos.width).toBeCloseTo((2 / 24) * 100, 1);
  });

  it("enforces minimum width", () => {
    const event = makeEvent({
      start: new Date(2026, 1, 14, 9, 0),
      end: new Date(2026, 1, 14, 9, 1),
    });
    const pos = calculateTimelinePosition(event, rangeStart, rangeEnd);
    expect(pos.width).toBeGreaterThanOrEqual(0.5);
  });

  it("returns zero for zero-length range", () => {
    const pos = calculateTimelinePosition(makeEvent(), rangeStart, rangeStart);
    expect(pos.left).toBe(0);
    expect(pos.width).toBe(0);
  });
});

// ─── Timezone-aware event position tests ────────────────────────────────────

describe("calculateEventPosition with TZDate", () => {
  const slotMinTime = "00:00";
  const slotDuration = 30;
  const slotHeight = 40;

  it("positions TZDate event at 10:00 AM New York correctly", () => {
    const event = makeEvent({
      start: new TZDate(2026, 1, 14, 10, 0, 0, "America/New_York"),
      end: new TZDate(2026, 1, 14, 11, 0, 0, "America/New_York"),
    });
    const pos = calculateEventPosition(event, slotMinTime, slotDuration, slotHeight);
    // 10 hours * 60 min / 30 min/slot * 40 px/slot = 800
    expect(pos.top).toBe(800);
    // 60 min / 30 * 40 = 80
    expect(pos.height).toBe(80);
  });

  it("produces same pixel positions as equivalent local time", () => {
    const localEvent = makeEvent({
      start: new Date(2026, 1, 14, 9, 0),
      end: new Date(2026, 1, 14, 10, 0),
    });
    const tzEvent = makeEvent({
      start: new TZDate(2026, 1, 14, 9, 0, 0, "America/New_York"),
      end: new TZDate(2026, 1, 14, 10, 0, 0, "America/New_York"),
    });
    const localPos = calculateEventPosition(localEvent, slotMinTime, slotDuration, slotHeight);
    const tzPos = calculateEventPosition(tzEvent, slotMinTime, slotDuration, slotHeight);
    // Same wall-clock time should produce same positions
    expect(tzPos.top).toBe(localPos.top);
    expect(tzPos.height).toBe(localPos.height);
  });
});
