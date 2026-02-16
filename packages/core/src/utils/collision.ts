import type { CalendarEvent } from "../types";
import { parseDate, getMinutesSinceMidnight } from "./date-utils";

export interface CollisionResult {
  event: CalendarEvent;
  column: number;
  totalColumns: number;
}

interface EventInterval {
  event: CalendarEvent;
  startMinutes: number;
  endMinutes: number;
}

function eventsOverlap(a: EventInterval, b: EventInterval): boolean {
  return a.startMinutes < b.endMinutes && b.startMinutes < a.endMinutes;
}

/**
 * Compute column assignments for overlapping timed events using a sweep-line algorithm.
 *
 * Events are sorted by start time ascending, then by duration descending (longer events first).
 * Transitively overlapping events are grouped together and share the same totalColumns count.
 * Within each group, columns are assigned greedily: each event gets the first column where it
 * doesn't overlap with the last event placed in that column.
 *
 * @param events - Array of timed, single-day CalendarEvent objects
 * @returns CollisionResult[] with column index and totalColumns per event
 */
export function layoutCollisions(events: CalendarEvent[]): CollisionResult[] {
  if (events.length === 0) return [];

  // Step 1: Convert to intervals and sort (without mutating input)
  const intervals: EventInterval[] = [...events].map((event) => ({
    event,
    startMinutes: getMinutesSinceMidnight(parseDate(event.start)),
    endMinutes: getMinutesSinceMidnight(parseDate(event.end)),
  }));

  intervals.sort((a, b) => {
    if (a.startMinutes !== b.startMinutes) return a.startMinutes - b.startMinutes;
    const aDuration = a.endMinutes - a.startMinutes;
    const bDuration = b.endMinutes - b.startMinutes;
    return bDuration - aDuration; // longer events first
  });

  // Step 2: Build transitive collision groups using sweep-line
  const groups: EventInterval[][] = [];
  let currentGroup: EventInterval[] = [intervals[0]];
  let groupEnd = intervals[0].endMinutes;

  for (let i = 1; i < intervals.length; i++) {
    const interval = intervals[i];
    if (interval.startMinutes < groupEnd) {
      // Overlaps with current group (transitively)
      currentGroup.push(interval);
      groupEnd = Math.max(groupEnd, interval.endMinutes);
    } else {
      // No overlap — start new group
      groups.push(currentGroup);
      currentGroup = [interval];
      groupEnd = interval.endMinutes;
    }
  }
  groups.push(currentGroup);

  // Step 3: Assign columns within each group greedily
  const results: CollisionResult[] = [];

  for (const group of groups) {
    // columns[colIndex] = last interval placed in that column
    const columns: EventInterval[] = [];
    const assignments = new Map<CalendarEvent, number>();

    for (const interval of group) {
      let placed = false;
      for (let col = 0; col < columns.length; col++) {
        if (!eventsOverlap(columns[col], interval)) {
          columns[col] = interval;
          assignments.set(interval.event, col);
          placed = true;
          break;
        }
      }
      if (!placed) {
        assignments.set(interval.event, columns.length);
        columns.push(interval);
      }
    }

    const totalColumns = columns.length;
    for (const interval of group) {
      const column = assignments.get(interval.event) ?? 0;
      results.push({
        event: interval.event,
        column,
        totalColumns,
      });
    }
  }

  return results;
}
