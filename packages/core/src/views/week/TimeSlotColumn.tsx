import { useMemo, type ReactNode } from "react";
import type { CalendarEvent, EventContentProps } from "../../types";
import type { BusinessHours } from "../../types/config";
import type { TimeSlot } from "../../utils/slot";
import { useCalendarConfig } from "../../components/CalendarContext";
import { cn } from "../../utils/cn";
import { calculateEventPosition, calculateCollisionPosition } from "../../utils/event-position";
import { layoutCollisions } from "../../utils/collision";
import { EventBlock } from "../../components/EventBlock";
import { NowIndicator } from "../../components/NowIndicator";
import { BusinessHoursOverlay } from "../../components/BusinessHoursOverlay";

export interface TimeSlotColumnProps {
  day: Date;
  events: CalendarEvent[];
  slots: TimeSlot[];
  slotMinTime: string;
  slotMaxTime: string;
  slotDuration: number;
  slotHeight: number;
  businessHours?: BusinessHours;
  eventContent?: (props: EventContentProps) => ReactNode;
  onEventClick?: (event: CalendarEvent, nativeEvent: React.MouseEvent) => void;
}

export function TimeSlotColumn({
  day,
  events,
  slots,
  slotMinTime,
  slotMaxTime,
  slotDuration,
  slotHeight,
  businessHours,
  eventContent,
  onEventClick,
}: TimeSlotColumnProps) {
  const { classNames } = useCalendarConfig();

  const collisionResults = useMemo(() => layoutCollisions(events), [events]);

  // Build a lookup map from event id to collision result
  const collisionMap = useMemo(() => {
    const map = new Map<string, { column: number; totalColumns: number }>();
    for (const result of collisionResults) {
      map.set(result.event.id, {
        column: result.column,
        totalColumns: result.totalColumns,
      });
    }
    return map;
  }, [collisionResults]);

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
        <div
          key={i}
          className={cn("pro-calendr-react-time-slot", classNames?.timeSlot)}
          style={{ height: slotHeight }}
        />
      ))}

      {/* Business hours overlay */}
      {businessHours && (
        <BusinessHoursOverlay
          businessHours={businessHours}
          day={day}
          slotMinTime={slotMinTime}
          slotMaxTime={slotMaxTime}
          slotDuration={slotDuration}
          slotHeight={slotHeight}
        />
      )}

      {/* Events positioned absolutely */}
      {events.map((event) => {
        const pos = calculateEventPosition(event, slotMinTime, slotDuration, slotHeight);
        const collision = collisionMap.get(event.id);
        const totalColumns = collision?.totalColumns ?? 1;
        const column = collision?.column ?? 0;

        // Single non-overlapping event: use original full-width positioning
        if (totalColumns === 1) {
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
        }

        // Overlapping events: use percentage-based collision positioning
        const collisionPos = calculateCollisionPosition(column, totalColumns);

        return (
          <EventBlock
            key={event.id}
            event={event}
            eventContent={eventContent}
            onClick={onEventClick}
            style={{
              top: pos.top,
              height: pos.height,
              left: `${String(collisionPos.leftPercent)}%`,
              width: `calc(${String(collisionPos.widthPercent)}% - 4px)`,
            }}
          />
        );
      })}

      {/* Now indicator */}
      <NowIndicator
        day={day}
        slotMinTime={slotMinTime}
        slotMaxTime={slotMaxTime}
        slotDuration={slotDuration}
        slotHeight={slotHeight}
      />
    </div>
  );
}
