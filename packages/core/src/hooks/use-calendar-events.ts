import type { CalendarEvent } from "../types";

export function useCalendarEvents(_events: CalendarEvent[] = []) {
  // TODO: event positioning, collision detection, stacking
  return {
    positionedEvents: [] as CalendarEvent[],
  };
}
