import type { CalendarEvent } from "../../types";

export interface EventStackProps {
  events: CalendarEvent[];
}

/**
 * EventStack handles collision/overlap resolution for events within a column.
 * Currently a placeholder — full collision resolution will be added in Milestone 3.
 * For now, events are rendered directly by TimeSlotColumn with absolute positioning.
 */
export function EventStack({ events }: EventStackProps) {
  return (
    <div
      className="pro-calendr-react-event-stack"
      data-testid="pro-calendr-react-event-stack"
      data-event-count={events.length}
    />
  );
}
