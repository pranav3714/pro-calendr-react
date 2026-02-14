import type { CalendarEvent } from "../types";

export interface Conflict {
  eventA: CalendarEvent;
  eventB: CalendarEvent;
  level: "error" | "warning";
  message: string;
}

export function detectConflicts(_events: CalendarEvent[]): Conflict[] {
  // TODO: O(n log n) sort + sweep algorithm
  return [];
}
