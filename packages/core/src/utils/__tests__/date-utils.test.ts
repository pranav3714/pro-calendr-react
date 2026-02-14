import { describe, it, expect } from "vitest";
import { parseDate, isSameDay } from "../date-utils";

describe("parseDate", () => {
  it("parses ISO string to Date", () => {
    const result = parseDate("2026-02-14T10:00:00.000Z");
    expect(result).toBeInstanceOf(Date);
  });

  it("returns Date object as-is", () => {
    const date = new Date();
    expect(parseDate(date)).toBe(date);
  });
});

describe("isSameDay", () => {
  it("returns true for same day", () => {
    const a = new Date(2026, 1, 14, 10, 0);
    const b = new Date(2026, 1, 14, 18, 30);
    expect(isSameDay(a, b)).toBe(true);
  });

  it("returns false for different days", () => {
    const a = new Date(2026, 1, 14);
    const b = new Date(2026, 1, 15);
    expect(isSameDay(a, b)).toBe(false);
  });
});
