import { startOfDay, differenceInCalendarDays } from "date-fns";
import type { CalendarEvent } from "../types";
import { parseDate } from "./date-utils";

/**
 * Represents a clipped event segment within a single week row.
 */
export interface EventSegment {
  /** The original calendar event */
  event: CalendarEvent;
  /** 0-based day index where segment starts (0 = first day of row) */
  left: number;
  /** Exclusive end day index */
  right: number;
  /** Number of days the segment spans (right - left) */
  span: number;
  /** Whether the event actually starts in this week (not a continuation) */
  isStart: boolean;
  /** Whether the event actually ends in this week (not continuing to next week) */
  isEnd: boolean;
}

/**
 * Result of lane allocation: segments assigned to lanes, plus overflow.
 */
export interface LaneAllocation {
  /** Each lane is an array of non-overlapping segments */
  lanes: EventSegment[][];
  /** Segments that could not fit within maxLanes */
  overflow: EventSegment[];
}

/**
 * Build event segments clipped to a week row's boundaries.
 *
 * For each event, clips it to the week range and produces an EventSegment with
 * day indices relative to weekStart. Events entirely outside the week are excluded.
 *
 * Segments are sorted: multi-day/all-day first (by span descending), then single-day timed events.
 *
 * @param events - Calendar events to segment
 * @param weekStart - First day of the week row (inclusive)
 * @param weekEnd - Last day of the week row (inclusive)
 */
export function buildEventSegments(
  events: CalendarEvent[],
  weekStart: Date,
  weekEnd: Date,
): EventSegment[] {
  const weekStartDay = startOfDay(weekStart);
  const weekEndDay = startOfDay(weekEnd);

  const segments: EventSegment[] = [];

  for (const event of events) {
    const eventStart = startOfDay(parseDate(event.start));
    const eventEnd = startOfDay(parseDate(event.end));

    // Skip events entirely outside the week
    if (eventEnd < weekStartDay || eventStart > weekEndDay) {
      continue;
    }

    // Clip to week boundaries
    const clippedStart = eventStart < weekStartDay ? weekStartDay : eventStart;
    const clippedEnd = eventEnd > weekEndDay ? weekEndDay : eventEnd;

    const left = differenceInCalendarDays(clippedStart, weekStartDay);
    // right is exclusive: if event ends on a day, it occupies that day, so right = dayIndex + 1
    const right = differenceInCalendarDays(clippedEnd, weekStartDay) + 1;

    const span = right - left;

    // Determine if event genuinely starts/ends within this week
    const isStart = eventStart >= weekStartDay;
    const isEnd = eventEnd <= weekEndDay;

    segments.push({
      event,
      left,
      right,
      span,
      isStart,
      isEnd,
    });
  }

  // Sort: multi-day/all-day first (by span desc), then single-day timed events
  segments.sort((a, b) => {
    const aIsMulti = a.span > 1 || a.event.allDay === true;
    const bIsMulti = b.span > 1 || b.event.allDay === true;

    // Multi-day/all-day events come first
    if (aIsMulti && !bIsMulti) return -1;
    if (!aIsMulti && bIsMulti) return 1;

    // Among multi-day, sort by span descending (wider events first)
    if (aIsMulti && bIsMulti) {
      if (a.span !== b.span) return b.span - a.span;
      // Tie-break by left position
      return a.left - b.left;
    }

    // Among single-day, sort by left position
    return a.left - b.left;
  });

  return segments;
}

/**
 * Greedily assign segments to lanes, respecting a maximum lane count.
 *
 * Each segment is placed in the first lane where it doesn't overlap with existing segments.
 * If all lanes are full and the lane count has reached maxLanes, the segment goes to overflow.
 *
 * @param segments - Sorted event segments (from buildEventSegments)
 * @param maxLanes - Maximum number of visible lanes
 */
export function allocateLanes(
  segments: EventSegment[],
  maxLanes: number,
): LaneAllocation {
  if (segments.length === 0) {
    return { lanes: [], overflow: [] };
  }

  const lanes: EventSegment[][] = [];
  const overflow: EventSegment[] = [];

  for (const segment of segments) {
    let placed = false;

    // Try to find an existing lane with no overlap
    for (let i = 0; i < lanes.length; i++) {
      const lane = lanes[i];
      const hasOverlap = lane.some(
        (existing) => existing.left < segment.right && segment.left < existing.right,
      );

      if (!hasOverlap) {
        lane.push(segment);
        placed = true;
        break;
      }
    }

    if (!placed) {
      // Create a new lane if we haven't exceeded maxLanes
      if (lanes.length < maxLanes) {
        lanes.push([segment]);
      } else {
        overflow.push(segment);
      }
    }
  }

  return { lanes, overflow };
}
