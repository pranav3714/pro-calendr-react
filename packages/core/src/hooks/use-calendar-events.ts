import { useMemo } from "react";
import type { CalendarEvent } from "../types";
import {
  filterEventsInRange,
  groupEventsByDate,
  groupEventsByResource,
  sortEventsByStart,
  partitionAllDayEvents,
} from "../utils/event-filter";

export interface UseCalendarEventsResult {
  /** Events filtered to the visible date range, sorted by start time */
  visibleEvents: CalendarEvent[];
  /** Visible events grouped by date (YYYY-MM-DD → events) */
  eventsByDate: Map<string, CalendarEvent[]>;
  /** Visible events grouped by resource ID */
  eventsByResource: Map<string, CalendarEvent[]>;
  /** All-day events separated from timed events */
  allDayEvents: CalendarEvent[];
  /** Timed (non all-day) events */
  timedEvents: CalendarEvent[];
}

/**
 * Process and organize events for rendering in calendar views.
 *
 * Filters events to the visible date range, sorts them, and groups them
 * by date and resource for efficient rendering.
 */
export function useCalendarEvents(
  events: CalendarEvent[] = [],
  dateRange: { start: Date; end: Date },
): UseCalendarEventsResult {
  const visibleEvents = useMemo(
    () => sortEventsByStart(filterEventsInRange(events, dateRange)),
    [events, dateRange],
  );

  const eventsByDate = useMemo(() => groupEventsByDate(visibleEvents), [visibleEvents]);

  const eventsByResource = useMemo(() => groupEventsByResource(visibleEvents), [visibleEvents]);

  const { allDay: allDayEvents, timed: timedEvents } = useMemo(
    () => partitionAllDayEvents(visibleEvents),
    [visibleEvents],
  );

  return {
    visibleEvents,
    eventsByDate,
    eventsByResource,
    allDayEvents,
    timedEvents,
  };
}
