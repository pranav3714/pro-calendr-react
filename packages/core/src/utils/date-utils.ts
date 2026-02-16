import {
  format,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addDays,
  eachDayOfInterval,
  eachWeekOfInterval,
  differenceInMinutes,
} from "date-fns";
import { TZDate } from "@date-fns/tz";
import type { CalendarViewType } from "../types";

/**
 * Create a calendar date, optionally in a specific timezone.
 * When timezone is provided, returns a TZDate; otherwise returns a plain Date.
 *
 * For string inputs without a timezone offset (e.g. "2026-02-16T10:00:00"),
 * the string is treated as wall-clock time in the specified timezone.
 *
 * @param date - A Date object or ISO string
 * @param timezone - Optional IANA timezone string (e.g. "America/New_York")
 */
export function createCalendarDate(date: Date | string, timezone?: string): Date {
  if (!timezone) {
    return typeof date === "string" ? new Date(date) : date;
  }
  if (typeof date === "string") {
    // Parse string components to preserve wall-clock time in the target timezone
    const parsed = new Date(date);
    return new TZDate(
      parsed.getFullYear(),
      parsed.getMonth(),
      parsed.getDate(),
      parsed.getHours(),
      parsed.getMinutes(),
      parsed.getSeconds(),
      timezone,
    );
  }
  return new TZDate(date.getTime(), timezone);
}

/**
 * Get "today" in the specified timezone, or as a plain Date if no timezone.
 *
 * @param timezone - Optional IANA timezone string
 */
export function getToday(timezone?: string): Date {
  if (!timezone) return new Date();
  return TZDate.tz(timezone);
}

/**
 * Format a date using date-fns format tokens.
 */
export function formatDate(date: Date, formatStr: string): string {
  return format(date, formatStr);
}

/**
 * Parse a string or Date into a Date object, optionally in a specific timezone.
 * When timezone is provided, returns a TZDate.
 *
 * @param value - A string or Date to parse
 * @param timezone - Optional IANA timezone string
 */
export function parseDate(value: string | Date, timezone?: string): Date {
  if (!timezone) {
    return typeof value === "string" ? new Date(value) : value;
  }
  if (typeof value === "string") {
    // Parse string components to preserve wall-clock time in the target timezone
    const parsed = new Date(value);
    return new TZDate(
      parsed.getFullYear(),
      parsed.getMonth(),
      parsed.getDate(),
      parsed.getHours(),
      parsed.getMinutes(),
      parsed.getSeconds(),
      timezone,
    );
  }
  return new TZDate(value.getTime(), timezone);
}

/**
 * Check if two dates represent the same calendar day.
 * Works with both Date and TZDate instances.
 */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Format a time value from a Date.
 * @param date - The date to extract time from
 * @param hour12 - Whether to use 12-hour format (default false)
 */
export function formatTime(date: Date, hour12 = false): string {
  return format(date, hour12 ? "h:mm a" : "HH:mm");
}

/**
 * Format a date for column/row headers based on view type.
 */
export function formatDateHeader(date: Date, view: CalendarViewType): string {
  switch (view) {
    case "week":
    case "timeline-week":
      return format(date, "EEE d");
    case "day":
    case "timeline-day":
      return format(date, "EEEE, MMMM d, yyyy");
    case "month":
    case "timeline-month":
      return format(date, "MMMM yyyy");
    case "timeline-year":
      return format(date, "yyyy");
    case "list":
      return format(date, "EEEE, MMMM d, yyyy");
    default:
      return format(date, "EEE d");
  }
}

/**
 * Get all days in a date range (inclusive).
 */
export function getDaysInRange(start: Date, end: Date): Date[] {
  return eachDayOfInterval({ start, end });
}

/**
 * Get the start of each week in a date range.
 * @param firstDay - 0 = Sunday, 1 = Monday
 */
export function getWeeksInRange(start: Date, end: Date, firstDay = 1): Date[] {
  return eachWeekOfInterval(
    { start, end },
    { weekStartsOn: firstDay as 0 | 1 | 2 | 3 | 4 | 5 | 6 },
  );
}

/**
 * Calculate the visible date range for a given view type and date.
 * When the input date is a TZDate, all returned dates preserve the timezone.
 *
 * @param date - The reference date (typically "currentDate")
 * @param view - The calendar view type
 * @param firstDay - 0 = Sunday, 1 = Monday (default 1)
 */
export function getDateRange(
  date: Date,
  view: CalendarViewType,
  firstDay = 1,
): { start: Date; end: Date } {
  const weekOptions = {
    weekStartsOn: firstDay as 0 | 1 | 2 | 3 | 4 | 5 | 6,
  };

  switch (view) {
    case "week":
    case "timeline-week": {
      const start = startOfWeek(date, weekOptions);
      const end = endOfWeek(date, weekOptions);
      return { start, end };
    }

    case "day":
    case "timeline-day": {
      return { start: startOfDay(date), end: endOfDay(date) };
    }

    case "month":
    case "list": {
      // Month grid: from the start-of-week of the first day of the month
      // to the end-of-week of the last day of the month (6 week grid)
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const start = startOfWeek(monthStart, weekOptions);
      const end = endOfWeek(monthEnd, weekOptions);
      return { start, end };
    }

    case "timeline-month": {
      return { start: startOfMonth(date), end: endOfMonth(date) };
    }

    case "timeline-year": {
      return { start: startOfYear(date), end: endOfYear(date) };
    }

    default:
      return { start: startOfDay(date), end: endOfDay(date) };
  }
}

/**
 * Parse an "HH:mm" time string into total minutes since midnight.
 */
export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert total minutes since midnight to a Date on a given reference day.
 * When timezone is provided, returns a TZDate.
 *
 * @param minutes - Minutes since midnight
 * @param referenceDate - The reference day
 * @param timezone - Optional IANA timezone string
 */
export function minutesToDate(minutes: number, referenceDate: Date, timezone?: string): Date {
  if (timezone) {
    const d = startOfDay(referenceDate);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return new TZDate(d.getFullYear(), d.getMonth(), d.getDate(), hours, mins, 0, timezone);
  }
  const d = startOfDay(referenceDate);
  d.setMinutes(minutes);
  return d;
}

/**
 * Get the number of minutes from midnight for a given date.
 * Works with both Date and TZDate (TZDate.getHours/getMinutes return timezone-local values).
 */
export function getMinutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * Get the duration in minutes between two dates.
 */
export function getDurationMinutes(start: Date, end: Date): number {
  return differenceInMinutes(end, start);
}

/**
 * Add days to a date (re-export for convenience).
 */
export { addDays };
