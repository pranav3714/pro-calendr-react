import type { ReactNode } from "react";
import type { CalendarEvent, EventContentProps } from "../../types";
import type { TimeSlot } from "../../utils/slot";
import { calculateEventPosition } from "../../utils/event-position";
import { EventBlock } from "../../components/EventBlock";

export interface TimeSlotColumnProps {
  day: Date;
  events: CalendarEvent[];
  slots: TimeSlot[];
  slotMinTime: string;
  slotDuration: number;
  slotHeight: number;
  eventContent?: (props: EventContentProps) => ReactNode;
  onEventClick?: (event: CalendarEvent, nativeEvent: React.MouseEvent) => void;
}

export function TimeSlotColumn({
  day,
  events,
  slots,
  slotMinTime,
  slotDuration,
  slotHeight,
  eventContent,
  onEventClick,
}: TimeSlotColumnProps) {
  return (
    <div
      className="pro-calendr-react-time-slot-column"
      data-date={day.toISOString()}
      style={{
        minHeight: slots.length * slotHeight,
      }}
    >
      {/* Slot grid lines */}
      {slots.map((_slot, i) => (
        <div key={i} className="pro-calendr-react-time-slot" style={{ height: slotHeight }} />
      ))}

      {/* Events positioned absolutely */}
      {events.map((event) => {
        const pos = calculateEventPosition(event, slotMinTime, slotDuration, slotHeight);

        return (
          <EventBlock
            key={event.id}
            event={event}
            eventContent={eventContent}
            onClick={onEventClick}
            style={{
              top: pos.top,
              height: pos.height,
              left: 2,
              right: 2,
            }}
          />
        );
      })}
    </div>
  );
}
