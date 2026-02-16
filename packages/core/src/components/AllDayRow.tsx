import type { ReactNode } from "react";
import type { CalendarEvent, EventContentProps } from "../types";
import { useCalendarConfig } from "./CalendarContext";
import { cn } from "../utils/cn";
import { parseDate } from "../utils/date-utils";

export interface AllDayRowProps {
  days: Date[];
  allDayEvents: CalendarEvent[];
  eventContent?: (props: EventContentProps) => ReactNode;
  onEventClick?: (event: CalendarEvent, nativeEvent: React.MouseEvent) => void;
}

/**
 * Shared all-day events row used by both WeekView and DayView.
 * Renders a grid with a time-label column followed by one column per day.
 * Returns null when there are no all-day events.
 */
export function AllDayRow({ days, allDayEvents, eventContent, onEventClick }: AllDayRowProps) {
  const { classNames } = useCalendarConfig();

  if (allDayEvents.length === 0) {
    return null;
  }

  return (
    <div
      className={cn("pro-calendr-react-allday-row", classNames?.alldayRow)}
      style={{
        gridTemplateColumns: `var(--cal-time-label-width, 60px) repeat(${String(days.length)}, 1fr)`,
      }}
    >
      <div className="pro-calendr-react-allday-label">all-day</div>
      {days.map((day) => {
        const dayAllDay = allDayEvents.filter((e) => {
          const start = parseDate(e.start);
          const end = parseDate(e.end);
          return start <= day && end >= day;
        });
        return (
          <div
            key={day.toISOString()}
            className={cn("pro-calendr-react-allday-cell", classNames?.alldayCell)}
          >
            {dayAllDay.map((event) => {
              if (eventContent) {
                return (
                  <div
                    key={event.id}
                    className={cn(
                      "pro-calendr-react-event pro-calendr-react-allday-event",
                      classNames?.alldayEvent,
                    )}
                    data-testid={`event-${event.id}`}
                    style={{
                      backgroundColor: event.backgroundColor ?? undefined,
                      color: event.textColor ?? undefined,
                    }}
                    onClick={(e) => onEventClick?.(event, e)}
                  >
                    {eventContent({
                      event,
                      density: "compact",
                      isSelected: false,
                      isDragging: false,
                    })}
                  </div>
                );
              }

              return (
                <div
                  key={event.id}
                  className={cn(
                    "pro-calendr-react-event pro-calendr-react-allday-event",
                    classNames?.alldayEvent,
                  )}
                  data-testid={`event-${event.id}`}
                  style={{
                    backgroundColor: event.backgroundColor ?? undefined,
                    color: event.textColor ?? undefined,
                  }}
                  onClick={(e) => onEventClick?.(event, e)}
                >
                  {event.title}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
