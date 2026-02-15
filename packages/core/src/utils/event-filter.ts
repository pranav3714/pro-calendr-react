import type { CalendarEvent } from "../types";
import { parseDate, formatDate } from "./date-utils";

/**
 * Filter events that overlap with a given date range.
 * An event overlaps if its start is before range end AND its end is after range start.
 */
export function filterEventsInRange(
  events: CalendarEvent[],
  dateRange: { start: Date; end: Date },
): CalendarEvent[] {
  const rangeStart = dateRange.start.getTime();
  const rangeEnd = dateRange.end.getTime();

  return events.filter((event) => {
    const eventStart = parseDate(event.start).getTime();
    const eventEnd = parseDate(event.end).getTime();
    return eventStart < rangeEnd && eventEnd > rangeStart;
  });
}

/**
 * Group events by their start date (YYYY-MM-DD key).
 * Multi-day events appear under their start date only.
 */
export function groupEventsByDate(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const groups = new Map<string, CalendarEvent[]>();

  for (const event of events) {
    const key = formatDate(parseDate(event.start), "yyyy-MM-dd");
    const group = groups.get(key);
    if (group) {
      group.push(event);
    } else {
      groups.set(key, [event]);
    }
  }

  return groups;
}

/**
 * Group events by their resource IDs.
 * Events with multiple resourceIds appear in multiple groups.
 * Events without resourceIds are grouped under "__unassigned".
 */
export function groupEventsByResource(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const groups = new Map<string, CalendarEvent[]>();

  for (const event of events) {
    const resourceIds =
      event.resourceIds && event.resourceIds.length > 0 ? event.resourceIds : ["__unassigned"];

    for (const id of resourceIds) {
      const group = groups.get(id);
      if (group) {
        group.push(event);
      } else {
        groups.set(id, [event]);
      }
    }
  }

  return groups;
}

/**
 * Sort events by start time, then by duration (longer first).
 */
export function sortEventsByStart(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => {
    const aStart = parseDate(a.start).getTime();
    const bStart = parseDate(b.start).getTime();
    if (aStart !== bStart) return aStart - bStart;
    // Longer events first (for better stacking)
    const aDuration = parseDate(a.end).getTime() - parseDate(a.start).getTime();
    const bDuration = parseDate(b.end).getTime() - parseDate(b.start).getTime();
    return bDuration - aDuration;
  });
}

/**
 * Get events that fall on a specific day.
 * Includes events that start on, end on, or span across the day.
 */
export function getEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(day);
  dayEnd.setHours(23, 59, 59, 999);

  return events.filter((event) => {
    const eventStart = parseDate(event.start);
    const eventEnd = parseDate(event.end);
    return eventStart <= dayEnd && eventEnd >= dayStart;
  });
}

/**
 * Separate all-day events from timed events.
 */
export function partitionAllDayEvents(events: CalendarEvent[]): {
  allDay: CalendarEvent[];
  timed: CalendarEvent[];
} {
  const allDay: CalendarEvent[] = [];
  const timed: CalendarEvent[] = [];

  for (const event of events) {
    if (event.allDay) {
      allDay.push(event);
    } else {
      timed.push(event);
    }
  }

  return { allDay, timed };
}
