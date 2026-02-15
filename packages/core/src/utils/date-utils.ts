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
import type { CalendarViewType } from "../types";

/**
 * Format a date using date-fns format tokens.
 */
export function formatDate(date: Date, formatStr: string): string {
  return format(date, formatStr);
}

/**
 * Parse a string or Date into a Date object.
 */
export function parseDate(value: string | Date): Date {
  return typeof value === "string" ? new Date(value) : value;
}

/**
 * Check if two dates represent the same calendar day.
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
 */
export function minutesToDate(minutes: number, referenceDate: Date): Date {
  const d = startOfDay(referenceDate);
  d.setMinutes(minutes);
  return d;
}

/**
 * Get the number of minutes from midnight for a given date.
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
