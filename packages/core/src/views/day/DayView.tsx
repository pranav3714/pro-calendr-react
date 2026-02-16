import { useMemo, type ReactNode } from "react";
import { format } from "date-fns";
import type { CalendarEvent, EventContentProps } from "../../types";
import { useCalendarConfig } from "../../components/CalendarContext";
import { cn } from "../../utils/cn";
import { generateTimeSlots } from "../../utils/slot";
import { getEventsForDay, partitionAllDayEvents } from "../../utils/event-filter";
import { DEFAULTS } from "../../constants";
import { TimeSlotColumn } from "../week/TimeSlotColumn";

export interface DayViewProps {
  events: CalendarEvent[];
  dateRange: { start: Date; end: Date };
  slotDuration?: number;
  slotMinTime?: string;
  slotMaxTime?: string;
  slotHeight?: number;
  eventContent?: (props: EventContentProps) => ReactNode;
  onEventClick?: (event: CalendarEvent, nativeEvent: React.MouseEvent) => void;
}

export function DayView({
  events,
  dateRange,
  slotDuration = DEFAULTS.slotDuration,
  slotMinTime = DEFAULTS.slotMinTime,
  slotMaxTime = DEFAULTS.slotMaxTime,
  slotHeight = 40,
  eventContent,
  onEventClick,
}: DayViewProps) {
  const { classNames } = useCalendarConfig();

  // DayView shows a single day
  const day = dateRange.start;

  const slots = useMemo(
    () => generateTimeSlots(slotMinTime, slotMaxTime, slotDuration),
    [slotMinTime, slotMaxTime, slotDuration],
  );

  // Separate all-day events from timed events
  const { allDay: allDayEvents, timed: timedEvents } = useMemo(
    () => partitionAllDayEvents(events),
    [events],
  );

  // Get timed events for this specific day
  const dayEvents = useMemo(
    () => getEventsForDay(timedEvents, day).filter((e) => !e.allDay),
    [timedEvents, day],
  );

  // Get all-day events for this specific day
  const dayAllDayEvents = useMemo(
    () =>
      allDayEvents.filter((e) => {
        const start = typeof e.start === "string" ? new Date(e.start) : e.start;
        const end = typeof e.end === "string" ? new Date(e.end) : e.end;
        return start <= day && end >= day;
      }),
    [allDayEvents, day],
  );

  return (
    <div
      data-testid="pro-calendr-react-day"
      className={cn("pro-calendr-react-day", classNames?.dayView)}
    >
      {/* Day header showing full date */}
      <div className={cn("pro-calendr-react-day-header-bar", classNames?.dayHeaderBar)}>
        {format(day, "EEEE, MMMM d, yyyy")}
      </div>

      {/* All-day events row */}
      {dayAllDayEvents.length > 0 && (
        <div
          className={cn("pro-calendr-react-allday-row", classNames?.alldayRow)}
          style={{
            gridTemplateColumns: "var(--cal-time-label-width, 60px) 1fr",
          }}
        >
          <div className="pro-calendr-react-allday-label">all-day</div>
          <div className={cn("pro-calendr-react-allday-cell", classNames?.alldayCell)}>
            {dayAllDayEvents.map((event) => (
              <div
                key={event.id}
                className="pro-calendr-react-event pro-calendr-react-allday-event"
                data-testid={`event-${event.id}`}
                style={{
                  backgroundColor: event.backgroundColor ?? undefined,
                  color: event.textColor ?? undefined,
                }}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time grid: time labels + single column */}
      <div className="pro-calendr-react-day-grid">
        {/* Time labels column */}
        <div className="pro-calendr-react-time-labels">
          {slots.map((slot, i) => (
            <div
              key={i}
              className={cn("pro-calendr-react-time-label", classNames?.timeLabel)}
              style={{ height: slotHeight }}
            >
              {i > 0 ? slot.label : ""}
            </div>
          ))}
        </div>

        {/* Single day column */}
        <TimeSlotColumn
          day={day}
          events={dayEvents}
          slots={slots}
          slotMinTime={slotMinTime}
          slotDuration={slotDuration}
          slotHeight={slotHeight}
          eventContent={eventContent}
          onEventClick={onEventClick}
        />
      </div>
    </div>
  );
}
