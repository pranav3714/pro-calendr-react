import type { CalendarEvent } from "../types";

export interface CollisionGroup {
  events: CalendarEvent[];
  columns: number;
}

export function detectCollisions(_events: CalendarEvent[]): CollisionGroup[] {
  // TODO: interval overlap algorithm
  return [];
}
