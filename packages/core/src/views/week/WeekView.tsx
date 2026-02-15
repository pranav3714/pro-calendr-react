import { useMemo, type ReactNode } from "react";
import type { CalendarEvent, EventContentProps } from "../../types";
import { getDaysInRange } from "../../utils/date-utils";
import { generateTimeSlots } from "../../utils/slot";
import { getEventsForDay, partitionAllDayEvents } from "../../utils/event-filter";
import { DEFAULTS } from "../../constants";
import { DayColumnHeaders } from "./DayColumnHeaders";
import { TimeSlotColumn } from "./TimeSlotColumn";

export interface WeekViewProps {
  events: CalendarEvent[];
  dateRange: { start: Date; end: Date };
  slotDuration?: number;
  slotMinTime?: string;
  slotMaxTime?: string;
  slotHeight?: number;
  eventContent?: (props: EventContentProps) => ReactNode;
  onEventClick?: (event: CalendarEvent, nativeEvent: React.MouseEvent) => void;
}

export function WeekView({
  events,
  dateRange,
  slotDuration = DEFAULTS.slotDuration,
  slotMinTime = DEFAULTS.slotMinTime,
  slotMaxTime = DEFAULTS.slotMaxTime,
  slotHeight = 40,
  eventContent,
  onEventClick,
}: WeekViewProps) {
  const days = useMemo(
    () => getDaysInRange(dateRange.start, dateRange.end),
    [dateRange.start, dateRange.end],
  );

  const slots = useMemo(
    () => generateTimeSlots(slotMinTime, slotMaxTime, slotDuration),
    [slotMinTime, slotMaxTime, slotDuration],
  );

  // Separate all-day events
  const { allDay: allDayEvents, timed: timedEvents } = useMemo(
    () => partitionAllDayEvents(events),
    [events],
  );

  return (
    <div data-testid="pro-calendr-react-week" className="pro-calendr-react-week">
      {/* Day column headers */}
      <DayColumnHeaders days={days} />

      {/* All-day events row */}
      {allDayEvents.length > 0 && (
        <div
          className="pro-calendr-react-allday-row"
          style={{
            display: "grid",
            gridTemplateColumns: `60px repeat(${String(days.length)}, 1fr)`,
            borderBottom: "1px solid var(--cal-border)",
            minHeight: 28,
          }}
        >
          <div
            style={{
              fontSize: "var(--cal-font-size-sm)",
              color: "var(--cal-text-muted)",
              padding: "4px 8px",
              borderRight: "1px solid var(--cal-border)",
              display: "flex",
              alignItems: "center",
            }}
          >
            all-day
          </div>
          {days.map((day) => {
            const dayAllDay = allDayEvents.filter((e) => {
              const start = typeof e.start === "string" ? new Date(e.start) : e.start;
              const end = typeof e.end === "string" ? new Date(e.end) : e.end;
              return start <= day && end >= day;
            });
            return (
              <div
                key={day.toISOString()}
                className="pro-calendr-react-allday-cell"
                style={{
                  padding: "2px 4px",
                  borderRight: "1px solid var(--cal-border)",
                }}
              >
                {dayAllDay.map((event) => (
                  <div
                    key={event.id}
                    className="pro-calendr-react-event pro-calendr-react-allday-event"
                    data-testid={`event-${event.id}`}
                    style={{
                      backgroundColor: event.backgroundColor ?? "var(--cal-event-default-bg)",
                      color: event.textColor ?? "var(--cal-event-default-text)",
                      borderRadius: "var(--cal-radius-sm)",
                      padding: "1px 4px",
                      fontSize: "var(--cal-font-size-sm)",
                      marginBottom: 2,
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Time grid */}
      <div
        className="pro-calendr-react-week-grid"
        style={{
          display: "grid",
          gridTemplateColumns: `60px repeat(${String(days.length)}, 1fr)`,
          overflow: "auto",
        }}
      >
        {/* Time labels column */}
        <div
          className="pro-calendr-react-time-labels"
          style={{
            borderRight: "1px solid var(--cal-border)",
          }}
        >
          {slots.map((slot, i) => (
            <div
              key={i}
              className="pro-calendr-react-time-label"
              style={{
                height: slotHeight,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "flex-end",
                paddingRight: 8,
                fontSize: "var(--cal-font-size-sm)",
                color: "var(--cal-text-muted)",
                transform: "translateY(-50%)",
                boxSizing: "border-box",
              }}
            >
              {i > 0 ? slot.label : ""}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day) => {
          const dayEvents = getEventsForDay(timedEvents, day).filter((e) => !e.allDay);

          return (
            <TimeSlotColumn
              key={day.toISOString()}
              day={day}
              events={dayEvents}
              slots={slots}
              slotMinTime={slotMinTime}
              slotDuration={slotDuration}
              slotHeight={slotHeight}
              eventContent={eventContent}
              onEventClick={onEventClick}
            />
          );
        })}
      </div>
    </div>
  );
}
