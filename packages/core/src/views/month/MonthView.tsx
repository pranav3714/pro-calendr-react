import { useMemo, type ReactNode } from "react";
import type { CalendarEvent, EventContentProps } from "../../types";
import { useCalendarConfig } from "../../components/CalendarContext";
import { cn } from "../../utils/cn";
import { getWeeksInRange, addDays, formatDate } from "../../utils/date-utils";
import { filterEventsInRange } from "../../utils/event-filter";
import { WeekRow } from "./WeekRow";

export interface MonthViewProps {
  events: CalendarEvent[];
  dateRange: { start: Date; end: Date };
  maxEventRows?: number;
  firstDay?: number;
  eventContent?: (props: EventContentProps) => ReactNode;
  onEventClick?: (event: CalendarEvent, nativeEvent: React.MouseEvent) => void;
}

/** Day-of-week labels for the header row. */
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_LABELS_SUNDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MonthView({
  events,
  dateRange,
  maxEventRows = 3,
  firstDay = 1,
  eventContent,
  onEventClick,
}: MonthViewProps) {
  const { classNames } = useCalendarConfig();

  // The current month is derived from the midpoint of the date range
  const currentMonth = useMemo(() => {
    const mid = new Date(
      (dateRange.start.getTime() + dateRange.end.getTime()) / 2,
    );
    return mid;
  }, [dateRange.start, dateRange.end]);

  // Get the start of each week in the range
  const weekStarts = useMemo(
    () => getWeeksInRange(dateRange.start, dateRange.end, firstDay),
    [dateRange.start, dateRange.end, firstDay],
  );

  const dayLabels = firstDay === 0 ? DAY_LABELS_SUNDAY : DAY_LABELS;

  return (
    <div
      data-testid="pro-calendr-react-month"
      className={cn("pro-calendr-react-month", classNames?.monthView)}
    >
      {/* Day-of-week header */}
      <div
        className={cn(
          "pro-calendr-react-month-header",
          classNames?.monthHeader,
        )}
      >
        {dayLabels.map((label) => (
          <div key={label} className="pro-calendr-react-month-header-cell">
            {label}
          </div>
        ))}
      </div>

      {/* Week rows */}
      {weekStarts.map((ws) => {
        const we = addDays(ws, 6);
        const weekEvents = filterEventsInRange(events, {
          start: ws,
          end: addDays(we, 1), // exclusive end for filtering
        });

        return (
          <WeekRow
            key={formatDate(ws, "yyyy-MM-dd")}
            weekStart={ws}
            weekEnd={we}
            events={weekEvents}
            maxEventRows={maxEventRows}
            currentMonth={currentMonth}
            eventContent={eventContent}
            onEventClick={onEventClick}
          />
        );
      })}
    </div>
  );
}
