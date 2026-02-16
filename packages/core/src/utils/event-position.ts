import { parseDate, parseTimeToMinutes, getMinutesSinceMidnight } from "./date-utils";
import type { CalendarEvent } from "../types";

export interface EventPosition {
  top: number;
  height: number;
}

/**
 * Calculate the top and height (in pixels) for a timed event in a vertical time grid.
 *
 * @param event - The calendar event
 * @param slotMinTime - "HH:mm" start of visible time range (e.g. "00:00")
 * @param slotDuration - Duration of each slot in minutes (e.g. 30)
 * @param slotHeight - Height of each slot in pixels (e.g. 40)
 * @returns { top, height } in pixels
 */
export function calculateEventPosition(
  event: CalendarEvent,
  slotMinTime: string,
  slotDuration: number,
  slotHeight: number,
): EventPosition {
  const startDate = parseDate(event.start);
  const endDate = parseDate(event.end);

  const gridStartMinutes = parseTimeToMinutes(slotMinTime);
  const eventStartMinutes = getMinutesSinceMidnight(startDate);
  const eventEndMinutes = getMinutesSinceMidnight(endDate);

  // Clamp to visible range
  const visibleStart = Math.max(eventStartMinutes, gridStartMinutes);
  const visibleEnd = eventEndMinutes;

  const pixelsPerMinute = slotHeight / slotDuration;
  const top = (visibleStart - gridStartMinutes) * pixelsPerMinute;
  const height = Math.max(
    (visibleEnd - visibleStart) * pixelsPerMinute,
    slotHeight / 2, // minimum height: half a slot
  );

  return { top, height };
}

export interface CollisionPosition {
  leftPercent: number;
  widthPercent: number;
}

/**
 * Calculate the horizontal left and width (as percentages 0-100) for a collision-aware event.
 *
 * Each event in a collision group is assigned a column (0-based) and total column count.
 * This function converts those to percentage-based horizontal positioning.
 *
 * @param column - The 0-based column index for this event
 * @param totalColumns - Total number of columns in the collision group
 * @returns { leftPercent, widthPercent } as numbers 0-100
 */
export function calculateCollisionPosition(
  column: number,
  totalColumns: number,
): CollisionPosition {
  if (totalColumns <= 0) return { leftPercent: 0, widthPercent: 100 };

  const widthPercent = 100 / totalColumns;
  const leftPercent = column * widthPercent;

  return { leftPercent, widthPercent };
}

/**
 * Calculate the left position and width (as percentages) for a timeline event.
 *
 * @param event - The calendar event
 * @param rangeStart - Start of visible date range
 * @param rangeEnd - End of visible date range
 * @returns { left, width } as percentages (0-100)
 */
export function calculateTimelinePosition(
  event: CalendarEvent,
  rangeStart: Date,
  rangeEnd: Date,
): { left: number; width: number } {
  const start = parseDate(event.start);
  const end = parseDate(event.end);

  const totalMs = rangeEnd.getTime() - rangeStart.getTime();
  if (totalMs <= 0) return { left: 0, width: 0 };

  const eventStartMs = Math.max(start.getTime(), rangeStart.getTime());
  const eventEndMs = Math.min(end.getTime(), rangeEnd.getTime());

  const left = ((eventStartMs - rangeStart.getTime()) / totalMs) * 100;
  const width = Math.max(
    ((eventEndMs - eventStartMs) / totalMs) * 100,
    0.5, // minimum width: 0.5%
  );

  return { left, width };
}
