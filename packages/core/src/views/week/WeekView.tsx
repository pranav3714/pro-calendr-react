import { useMemo, type ReactNode } from "react";
import type { CalendarEvent, EventContentProps } from "../../types";
import type { BusinessHours } from "../../types/config";
import { useCalendarConfig } from "../../components/CalendarContext";
import { cn } from "../../utils/cn";
import { getDaysInRange } from "../../utils/date-utils";
import { generateTimeSlots } from "../../utils/slot";
import { getEventsForDay, partitionAllDayEvents } from "../../utils/event-filter";
import { DEFAULTS } from "../../constants";
import { DayColumnHeaders } from "./DayColumnHeaders";
import { TimeSlotColumn } from "./TimeSlotColumn";
import { AllDayRow } from "../../components/AllDayRow";

export interface WeekViewProps {
  events: CalendarEvent[];
  dateRange: { start: Date; end: Date };
  slotDuration?: number;
  slotMinTime?: string;
  slotMaxTime?: string;
  slotHeight?: number;
  businessHours?: BusinessHours;
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
  businessHours,
  eventContent,
  onEventClick,
}: WeekViewProps) {
  const { classNames } = useCalendarConfig();

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
    <div
      data-testid="pro-calendr-react-week"
      className={cn("pro-calendr-react-week", classNames?.weekView)}
    >
      {/* Day column headers */}
      <DayColumnHeaders days={days} />

      {/* All-day events row */}
      <AllDayRow
        days={days}
        allDayEvents={allDayEvents}
        eventContent={eventContent}
        onEventClick={onEventClick}
      />

      {/* Time grid */}
      <div
        className="pro-calendr-react-week-grid"
        style={{
          gridTemplateColumns: `var(--cal-time-label-width, 60px) repeat(${String(days.length)}, 1fr)`,
        }}
      >
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
              slotMaxTime={slotMaxTime}
              slotDuration={slotDuration}
              slotHeight={slotHeight}
              businessHours={businessHours}
              eventContent={eventContent}
              onEventClick={onEventClick}
            />
          );
        })}
      </div>
    </div>
  );
}
