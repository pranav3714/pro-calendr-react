import { describe, it, expect } from "vitest";
import { minutesToPosition, positionToMinutes, snapToGrid, clampMinutes } from "../time-position";

describe("minutesToPosition", () => {
  const config = { dayStartHour: 0, hourWidth: 128 };

  it("converts midnight to position 0", () => {
    expect(minutesToPosition({ minutes: 0, config })).toBe(0);
  });

  it("converts 1 hour to hourWidth pixels", () => {
    expect(minutesToPosition({ minutes: 60, config })).toBe(128);
  });

  it("converts 30 minutes to half hourWidth", () => {
    expect(minutesToPosition({ minutes: 30, config })).toBe(64);
  });

  it("converts 24 hours to full day width", () => {
    expect(minutesToPosition({ minutes: 1440, config })).toBe(128 * 24);
  });

  it("accounts for non-zero dayStartHour", () => {
    const cfg = { dayStartHour: 6, hourWidth: 128 };
    expect(minutesToPosition({ minutes: 360, config: cfg })).toBe(0);
    expect(minutesToPosition({ minutes: 420, config: cfg })).toBe(128);
  });

  it("handles 15-minute increments precisely", () => {
    expect(minutesToPosition({ minutes: 15, config })).toBe(32);
    expect(minutesToPosition({ minutes: 45, config })).toBe(96);
  });
});

describe("positionToMinutes", () => {
  const config = { dayStartHour: 0, hourWidth: 128 };

  it("converts position 0 to midnight", () => {
    expect(positionToMinutes({ px: 0, config })).toBe(0);
  });

  it("converts hourWidth to 60 minutes", () => {
    expect(positionToMinutes({ px: 128, config })).toBe(60);
  });

  it("round-trips with minutesToPosition", () => {
    const original = 735;
    const px = minutesToPosition({ minutes: original, config });
    const result = positionToMinutes({ px, config });
    expect(result).toBeCloseTo(original);
  });

  it("accounts for non-zero dayStartHour", () => {
    const cfg = { dayStartHour: 8, hourWidth: 128 };
    expect(positionToMinutes({ px: 0, config: cfg })).toBe(480);
  });
});

describe("snapToGrid", () => {
  it("snaps down to nearest interval", () => {
    expect(snapToGrid({ minutes: 7, interval: 15 })).toBe(0);
  });

  it("snaps up to nearest interval", () => {
    expect(snapToGrid({ minutes: 8, interval: 15 })).toBe(15);
  });

  it("preserves exact multiples", () => {
    expect(snapToGrid({ minutes: 30, interval: 15 })).toBe(30);
    expect(snapToGrid({ minutes: 60, interval: 15 })).toBe(60);
  });

  it("works with 30-minute intervals", () => {
    expect(snapToGrid({ minutes: 14, interval: 30 })).toBe(0);
    expect(snapToGrid({ minutes: 16, interval: 30 })).toBe(30);
  });

  it("snaps at exact boundary (midpoint rounds up)", () => {
    expect(snapToGrid({ minutes: 7.5, interval: 15 })).toBe(15);
  });

  it("handles zero minutes", () => {
    expect(snapToGrid({ minutes: 0, interval: 15 })).toBe(0);
  });

  it("handles large values", () => {
    expect(snapToGrid({ minutes: 1433, interval: 15 })).toBe(1440);
  });
});

describe("clampMinutes", () => {
  const config = { dayStartHour: 0, dayEndHour: 24 };

  it("returns value within range unchanged", () => {
    expect(clampMinutes({ minutes: 720, config })).toBe(720);
  });

  it("clamps below minimum to dayStartHour * 60", () => {
    expect(clampMinutes({ minutes: -10, config })).toBe(0);
  });

  it("clamps above maximum to dayEndHour * 60", () => {
    expect(clampMinutes({ minutes: 1500, config })).toBe(1440);
  });

  it("handles custom day range", () => {
    const cfg = { dayStartHour: 6, dayEndHour: 22 };
    expect(clampMinutes({ minutes: 300, config: cfg })).toBe(360);
    expect(clampMinutes({ minutes: 1400, config: cfg })).toBe(1320);
    expect(clampMinutes({ minutes: 720, config: cfg })).toBe(720);
  });

  it("clamps at exact boundary", () => {
    expect(clampMinutes({ minutes: 0, config })).toBe(0);
    expect(clampMinutes({ minutes: 1440, config })).toBe(1440);
  });
});
