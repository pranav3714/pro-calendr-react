import { describe, it, expect } from "vitest";
import { TZDate } from "@date-fns/tz";
import {
  parseDate,
  isSameDay,
  formatDate,
  formatTime,
  formatDateHeader,
  getDateRange,
  getDaysInRange,
  getWeeksInRange,
  parseTimeToMinutes,
  minutesToDate,
  getMinutesSinceMidnight,
  getDurationMinutes,
  createCalendarDate,
  getToday,
} from "../date-utils";

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

describe("formatDate", () => {
  it("formats date with given format string", () => {
    const date = new Date(2026, 1, 14); // Feb 14, 2026
    expect(formatDate(date, "yyyy-MM-dd")).toBe("2026-02-14");
  });

  it("formats with day name", () => {
    const date = new Date(2026, 1, 14); // Saturday
    expect(formatDate(date, "EEEE")).toBe("Saturday");
  });
});

describe("formatTime", () => {
  it("formats time in 24-hour format by default", () => {
    const date = new Date(2026, 1, 14, 14, 30);
    expect(formatTime(date)).toBe("14:30");
  });

  it("formats time in 12-hour format", () => {
    const date = new Date(2026, 1, 14, 14, 30);
    expect(formatTime(date, true)).toBe("2:30 PM");
  });

  it("formats midnight correctly", () => {
    const date = new Date(2026, 1, 14, 0, 0);
    expect(formatTime(date)).toBe("00:00");
    expect(formatTime(date, true)).toBe("12:00 AM");
  });

  it("formats noon correctly", () => {
    const date = new Date(2026, 1, 14, 12, 0);
    expect(formatTime(date)).toBe("12:00");
    expect(formatTime(date, true)).toBe("12:00 PM");
  });
});

describe("formatDateHeader", () => {
  const date = new Date(2026, 1, 14); // Feb 14, 2026 (Saturday)

  it("formats for week view", () => {
    expect(formatDateHeader(date, "week")).toBe("Sat 14");
  });

  it("formats for timeline-week view", () => {
    expect(formatDateHeader(date, "timeline-week")).toBe("Sat 14");
  });

  it("formats for day view", () => {
    expect(formatDateHeader(date, "day")).toBe("Saturday, February 14, 2026");
  });

  it("formats for month view", () => {
    expect(formatDateHeader(date, "month")).toBe("February 2026");
  });

  it("formats for timeline-year view", () => {
    expect(formatDateHeader(date, "timeline-year")).toBe("2026");
  });

  it("formats for list view", () => {
    expect(formatDateHeader(date, "list")).toBe("Saturday, February 14, 2026");
  });
});

describe("getDateRange", () => {
  describe("week view", () => {
    it("returns Monday-Sunday for firstDay=1", () => {
      const date = new Date(2026, 1, 11); // Wednesday Feb 11
      const range = getDateRange(date, "week", 1);
      expect(range.start.getDay()).toBe(1); // Monday
      expect(range.start.getDate()).toBe(9); // Feb 9
      expect(range.end.getDay()).toBe(0); // Sunday
      expect(range.end.getDate()).toBe(15); // Feb 15
    });

    it("returns Sunday-Saturday for firstDay=0", () => {
      const date = new Date(2026, 1, 11); // Wednesday Feb 11
      const range = getDateRange(date, "week", 0);
      expect(range.start.getDay()).toBe(0); // Sunday
      expect(range.start.getDate()).toBe(8); // Feb 8
      expect(range.end.getDay()).toBe(6); // Saturday
      expect(range.end.getDate()).toBe(14); // Feb 14
    });

    it("handles week crossing month boundary", () => {
      const date = new Date(2026, 1, 1); // Feb 1 (Sunday)
      const range = getDateRange(date, "week", 1);
      expect(range.start.getMonth()).toBe(0); // January
      expect(range.start.getDate()).toBe(26); // Jan 26
    });
  });

  describe("timeline-week view", () => {
    it("returns same range as week view", () => {
      const date = new Date(2026, 1, 11);
      const weekRange = getDateRange(date, "week", 1);
      const timelineRange = getDateRange(date, "timeline-week", 1);
      expect(timelineRange.start.getTime()).toBe(weekRange.start.getTime());
      expect(timelineRange.end.getTime()).toBe(weekRange.end.getTime());
    });
  });

  describe("day view", () => {
    it("returns start and end of the day", () => {
      const date = new Date(2026, 1, 14, 10, 30);
      const range = getDateRange(date, "day");
      expect(range.start.getHours()).toBe(0);
      expect(range.start.getMinutes()).toBe(0);
      expect(range.end.getHours()).toBe(23);
      expect(range.end.getMinutes()).toBe(59);
    });
  });

  describe("timeline-day view", () => {
    it("returns same range as day view", () => {
      const date = new Date(2026, 1, 14);
      const dayRange = getDateRange(date, "day");
      const timelineRange = getDateRange(date, "timeline-day");
      expect(timelineRange.start.getTime()).toBe(dayRange.start.getTime());
      expect(timelineRange.end.getTime()).toBe(dayRange.end.getTime());
    });
  });

  describe("month view", () => {
    it("returns full grid range including overflow weeks", () => {
      const date = new Date(2026, 1, 14); // Feb 2026
      const range = getDateRange(date, "month", 1);
      // Feb 1 2026 is Sunday, so with Monday start, grid starts Jan 26
      expect(range.start.getDay()).toBe(1); // Monday
      // Feb 28 2026 is Saturday, so grid ends Mar 1 (Sunday)
      expect(range.end.getDay()).toBe(0); // Sunday
    });

    it("respects firstDay for month grid", () => {
      const date = new Date(2026, 1, 14);
      const range = getDateRange(date, "month", 0);
      expect(range.start.getDay()).toBe(0); // Sunday
    });
  });

  describe("list view", () => {
    it("returns same range as month view", () => {
      const date = new Date(2026, 1, 14);
      const monthRange = getDateRange(date, "month", 1);
      const listRange = getDateRange(date, "list", 1);
      expect(listRange.start.getTime()).toBe(monthRange.start.getTime());
      expect(listRange.end.getTime()).toBe(monthRange.end.getTime());
    });
  });

  describe("timeline-month view", () => {
    it("returns exact month boundaries", () => {
      const date = new Date(2026, 1, 14);
      const range = getDateRange(date, "timeline-month");
      expect(range.start.getDate()).toBe(1);
      expect(range.end.getDate()).toBe(28); // Feb 2026 has 28 days
    });
  });

  describe("timeline-year view", () => {
    it("returns Jan 1 to Dec 31", () => {
      const date = new Date(2026, 5, 15);
      const range = getDateRange(date, "timeline-year");
      expect(range.start.getMonth()).toBe(0);
      expect(range.start.getDate()).toBe(1);
      expect(range.end.getMonth()).toBe(11);
      expect(range.end.getDate()).toBe(31);
    });
  });

  describe("default fallback", () => {
    it("returns day range for unknown view", () => {
      const date = new Date(2026, 1, 14, 10, 30);
      const range = getDateRange(date, "unknown" as never);
      expect(range.start.getHours()).toBe(0);
      expect(range.end.getHours()).toBe(23);
    });
  });
});

describe("getDaysInRange", () => {
  it("returns all days inclusive", () => {
    const start = new Date(2026, 1, 9);
    const end = new Date(2026, 1, 15);
    const days = getDaysInRange(start, end);
    expect(days).toHaveLength(7);
    expect(days[0].getDate()).toBe(9);
    expect(days[6].getDate()).toBe(15);
  });

  it("returns single day for same start and end", () => {
    const date = new Date(2026, 1, 14);
    const days = getDaysInRange(date, date);
    expect(days).toHaveLength(1);
  });
});

describe("getWeeksInRange", () => {
  it("returns week starts for a month range", () => {
    const start = new Date(2026, 1, 1);
    const end = new Date(2026, 1, 28);
    const weeks = getWeeksInRange(start, end, 1);
    expect(weeks.length).toBeGreaterThanOrEqual(4);
    weeks.forEach((week) => {
      expect(week.getDay()).toBe(1); // Monday
    });
  });

  it("returns Sunday starts when firstDay=0", () => {
    const start = new Date(2026, 1, 1);
    const end = new Date(2026, 1, 28);
    const weeks = getWeeksInRange(start, end, 0);
    weeks.forEach((week) => {
      expect(week.getDay()).toBe(0); // Sunday
    });
  });
});

describe("parseTimeToMinutes", () => {
  it("parses midnight", () => {
    expect(parseTimeToMinutes("00:00")).toBe(0);
  });

  it("parses noon", () => {
    expect(parseTimeToMinutes("12:00")).toBe(720);
  });

  it("parses end of day", () => {
    expect(parseTimeToMinutes("24:00")).toBe(1440);
  });

  it("parses arbitrary time", () => {
    expect(parseTimeToMinutes("08:30")).toBe(510);
  });
});

describe("minutesToDate", () => {
  it("converts minutes to date on reference day", () => {
    const ref = new Date(2026, 1, 14, 10, 30); // will be normalized to midnight
    const result = minutesToDate(510, ref); // 8:30
    expect(result.getHours()).toBe(8);
    expect(result.getMinutes()).toBe(30);
    expect(result.getDate()).toBe(14);
  });

  it("handles midnight", () => {
    const ref = new Date(2026, 1, 14);
    const result = minutesToDate(0, ref);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
  });
});

describe("getMinutesSinceMidnight", () => {
  it("returns 0 for midnight", () => {
    expect(getMinutesSinceMidnight(new Date(2026, 1, 14, 0, 0))).toBe(0);
  });

  it("returns correct minutes", () => {
    expect(getMinutesSinceMidnight(new Date(2026, 1, 14, 14, 30))).toBe(870);
  });
});

describe("getDurationMinutes", () => {
  it("calculates duration between two times", () => {
    const start = new Date(2026, 1, 14, 9, 0);
    const end = new Date(2026, 1, 14, 10, 30);
    expect(getDurationMinutes(start, end)).toBe(90);
  });

  it("returns 0 for same time", () => {
    const date = new Date(2026, 1, 14, 9, 0);
    expect(getDurationMinutes(date, date)).toBe(0);
  });
});

// ─── Timezone-aware tests ───────────────────────────────────────────────────

describe("createCalendarDate", () => {
  it("creates a TZDate when timezone is provided with a string", () => {
    const result = createCalendarDate("2026-02-16T10:00:00", "America/New_York");
    expect(result).toBeInstanceOf(TZDate);
    expect(result.getHours()).toBe(10);
    expect(result.getMinutes()).toBe(0);
  });

  it("creates a TZDate when timezone is provided with a Date", () => {
    const date = new Date(2026, 1, 16, 10, 0, 0);
    const result = createCalendarDate(date, "America/New_York");
    expect(result).toBeInstanceOf(TZDate);
  });

  it("returns a plain Date when no timezone is provided with a string", () => {
    const result = createCalendarDate("2026-02-16T10:00:00");
    expect(result).toBeInstanceOf(Date);
    // Should NOT be a TZDate
    expect(result.constructor.name).toBe("Date");
  });

  it("returns the same Date when no timezone is provided with a Date", () => {
    const date = new Date(2026, 1, 16, 10, 0, 0);
    const result = createCalendarDate(date);
    expect(result).toBe(date);
  });
});

describe("getToday", () => {
  it("returns a TZDate when timezone is provided", () => {
    const result = getToday("America/New_York");
    expect(result).toBeInstanceOf(TZDate);
  });

  it("returns a plain Date when no timezone is provided", () => {
    const result = getToday();
    expect(result).toBeInstanceOf(Date);
    expect(result.constructor.name).toBe("Date");
  });
});

describe("parseDate with timezone", () => {
  it("returns a TZDate when timezone is provided with a string", () => {
    const result = parseDate("2026-02-16T10:00:00", "America/New_York");
    expect(result).toBeInstanceOf(TZDate);
    expect(result.getHours()).toBe(10);
  });

  it("converts a Date to TZDate when timezone is provided", () => {
    const date = new Date(2026, 1, 16, 10, 0, 0);
    const result = parseDate(date, "America/New_York");
    expect(result).toBeInstanceOf(TZDate);
  });

  it("returns a plain Date when no timezone is provided (backward compat)", () => {
    const date = new Date(2026, 1, 16, 10, 0, 0);
    const result = parseDate(date);
    expect(result).toBe(date);
  });
});

describe("isSameDay with TZDate", () => {
  it("works correctly with TZDate instances", () => {
    const a = new TZDate(2026, 1, 16, 10, 0, 0, "America/New_York");
    const b = new TZDate(2026, 1, 16, 18, 30, 0, "America/New_York");
    expect(isSameDay(a, b)).toBe(true);
  });

  it("returns false for different days in TZDate", () => {
    const a = new TZDate(2026, 1, 16, 10, 0, 0, "America/New_York");
    const b = new TZDate(2026, 1, 17, 10, 0, 0, "America/New_York");
    expect(isSameDay(a, b)).toBe(false);
  });
});

describe("getDateRange with TZDate", () => {
  it("returns TZDate start/end when input is TZDate", () => {
    const tzDate = new TZDate(2026, 1, 11, 12, 0, 0, "America/New_York");
    const range = getDateRange(tzDate, "week", 1);
    expect(range.start).toBeInstanceOf(TZDate);
    expect(range.end).toBeInstanceOf(TZDate);
    expect(range.start.getDay()).toBe(1); // Monday
    expect(range.end.getDay()).toBe(0); // Sunday
  });

  it("handles DST spring forward (March 8 2026 US)", () => {
    // March 8, 2026 is when US springs forward (2:00 AM -> 3:00 AM)
    const tzDate = new TZDate(2026, 2, 8, 12, 0, 0, "America/New_York");
    const range = getDateRange(tzDate, "week", 1);
    // Week should be March 2 (Mon) to March 8 (Sun)
    expect(range.start.getDate()).toBe(2);
    expect(range.end.getDate()).toBe(8);
    expect(range.start).toBeInstanceOf(TZDate);
    expect(range.end).toBeInstanceOf(TZDate);
  });
});

describe("minutesToDate with timezone", () => {
  it("produces TZDate when timezone is provided", () => {
    const ref = new TZDate(2026, 1, 14, 0, 0, 0, "America/New_York");
    const result = minutesToDate(510, ref, "America/New_York"); // 8:30 AM
    expect(result).toBeInstanceOf(TZDate);
    expect(result.getHours()).toBe(8);
    expect(result.getMinutes()).toBe(30);
  });

  it("produces plain Date when no timezone (backward compat)", () => {
    const ref = new Date(2026, 1, 14);
    const result = minutesToDate(510, ref);
    expect(result.getHours()).toBe(8);
    expect(result.getMinutes()).toBe(30);
    expect(result.constructor.name).toBe("Date");
  });
});
