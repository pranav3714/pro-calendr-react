import { describe, it, expect } from "vitest";
import {
  isSameDay,
  getWeekDays,
  getMonthDays,
  formatDateFull,
  formatDateShort,
  formatDateLabel,
  navigateDate,
} from "../date-helpers";

describe("isSameDay", () => {
  it("returns true for identical dates", () => {
    const date = new Date(2026, 1, 18);
    expect(isSameDay({ dateA: date, dateB: date })).toBe(true);
  });

  it("returns true for same day different times", () => {
    const a = new Date(2026, 1, 18, 9, 0);
    const b = new Date(2026, 1, 18, 17, 30);
    expect(isSameDay({ dateA: a, dateB: b })).toBe(true);
  });

  it("returns false for different days", () => {
    const a = new Date(2026, 1, 18);
    const b = new Date(2026, 1, 19);
    expect(isSameDay({ dateA: a, dateB: b })).toBe(false);
  });
});

describe("getWeekDays", () => {
  it("returns 7 days starting on Monday", () => {
    const date = new Date(2026, 1, 18);
    const days = getWeekDays({ date });
    expect(days).toHaveLength(7);
    expect(days[0].getDay()).toBe(1);
  });

  it("returns correct week for a Wednesday", () => {
    const wed = new Date(2026, 1, 18);
    const days = getWeekDays({ date: wed });
    expect(days[0].getDate()).toBe(16);
    expect(days[6].getDate()).toBe(22);
  });

  it("returns correct week for a Sunday", () => {
    const sun = new Date(2026, 1, 22);
    const days = getWeekDays({ date: sun });
    expect(days[0].getDate()).toBe(16);
    expect(days[6].getDate()).toBe(22);
  });

  it("handles month boundary", () => {
    const date = new Date(2026, 1, 27);
    const days = getWeekDays({ date });
    expect(days[0].getDate()).toBe(23);
    expect(days[0].getMonth()).toBe(1);
    expect(days[6].getDate()).toBe(1);
    expect(days[6].getMonth()).toBe(2);
  });
});

describe("getMonthDays", () => {
  it("returns a grid starting on Monday", () => {
    const date = new Date(2026, 1, 1);
    const days = getMonthDays({ date });
    expect(days[0].getDay()).toBe(1);
  });

  it("includes padding days from previous/next month", () => {
    const date = new Date(2026, 1, 1);
    const days = getMonthDays({ date });
    expect(days.length % 7).toBe(0);
    expect(days.length).toBeGreaterThanOrEqual(28);
  });

  it("returns at least 28 days", () => {
    const date = new Date(2026, 1, 1);
    const days = getMonthDays({ date });
    expect(days.length).toBeGreaterThanOrEqual(28);
  });

  it("includes all days of the month", () => {
    const date = new Date(2026, 0, 1);
    const days = getMonthDays({ date });
    const janDays = days.filter((d) => d.getMonth() === 0);
    expect(janDays).toHaveLength(31);
  });
});

describe("formatDateFull", () => {
  it("formats a date as full string", () => {
    const date = new Date(2026, 1, 18);
    expect(formatDateFull({ date })).toBe("Wednesday, 18 February 2026");
  });
});

describe("formatDateShort", () => {
  it("formats a date as short string", () => {
    const date = new Date(2026, 1, 18);
    expect(formatDateShort({ date })).toBe("18 Feb");
  });
});

describe("formatDateLabel", () => {
  const date = new Date(2026, 1, 18);

  it("returns full date for day view", () => {
    expect(formatDateLabel({ date, viewMode: "day" })).toBe("Wednesday, 18 February 2026");
  });

  it("returns week range for week view", () => {
    const result = formatDateLabel({ date, viewMode: "week" });
    expect(result).toContain("16 Feb");
    expect(result).toContain("22 Feb");
    expect(result).toContain("–");
  });

  it("returns month year for month view", () => {
    expect(formatDateLabel({ date, viewMode: "month" })).toBe("February 2026");
  });
});

describe("navigateDate", () => {
  const date = new Date(2026, 1, 18);

  it("returns today for 'today' direction", () => {
    const result = navigateDate({ date, direction: "today", viewMode: "day" });
    const now = new Date();
    expect(result.getDate()).toBe(now.getDate());
  });

  it("adds one day for day view next", () => {
    const result = navigateDate({ date, direction: "next", viewMode: "day" });
    expect(result.getDate()).toBe(19);
  });

  it("subtracts one day for day view prev", () => {
    const result = navigateDate({ date, direction: "prev", viewMode: "day" });
    expect(result.getDate()).toBe(17);
  });

  it("adds one week for week view next", () => {
    const result = navigateDate({ date, direction: "next", viewMode: "week" });
    expect(result.getDate()).toBe(25);
  });

  it("subtracts one week for week view prev", () => {
    const result = navigateDate({ date, direction: "prev", viewMode: "week" });
    expect(result.getDate()).toBe(11);
  });

  it("adds one month for month view next", () => {
    const result = navigateDate({
      date,
      direction: "next",
      viewMode: "month",
    });
    expect(result.getMonth()).toBe(2);
  });

  it("subtracts one month for month view prev", () => {
    const result = navigateDate({
      date,
      direction: "prev",
      viewMode: "month",
    });
    expect(result.getMonth()).toBe(0);
  });
});
