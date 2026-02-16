import { useCallback, useMemo, useRef, type ReactNode } from "react";
import type { CalendarEvent, EventContentProps } from "../../types";
import { useCalendarConfig, useCalendarStore } from "../../components/CalendarContext";
import { cn } from "../../utils/cn";
import { getWeeksInRange, addDays, formatDate, isSameDay } from "../../utils/date-utils";
import { filterEventsInRange } from "../../utils/event-filter";
import { useRovingGrid, type GridPosition } from "../../hooks/use-roving-grid";
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
  const setFocusedDate = useCalendarStore((s) => s.setFocusedDate);
  const focusedDate = useCalendarStore((s) => s.focusedDate);

  const gridRef = useRef<HTMLDivElement>(null);

  // The current month is derived from the midpoint of the date range
  const currentMonth = useMemo(() => {
    const mid = new Date((dateRange.start.getTime() + dateRange.end.getTime()) / 2);
    return mid;
  }, [dateRange.start, dateRange.end]);

  // Get the start of each week in the range
  const weekStarts = useMemo(
    () => getWeeksInRange(dateRange.start, dateRange.end, firstDay),
    [dateRange.start, dateRange.end, firstDay],
  );

  // Compute initial grid position from focusedDate
  const initialPosition = useMemo<GridPosition>(() => {
    if (!focusedDate) return { row: 0, col: 0 };
    for (let rowIdx = 0; rowIdx < weekStarts.length; rowIdx++) {
      const ws = weekStarts[rowIdx];
      for (let colIdx = 0; colIdx < 7; colIdx++) {
        const cellDate = addDays(ws, colIdx);
        if (isSameDay(cellDate, focusedDate)) {
          return { row: rowIdx, col: colIdx };
        }
      }
    }
    return { row: 0, col: 0 };
  }, [focusedDate, weekStarts]);

  const onCellFocus = useCallback(
    (pos: GridPosition) => {
      const ws = weekStarts[pos.row] as Date | undefined;
      if (ws) {
        const date = addDays(ws, pos.col);
        setFocusedDate(date);
      }
    },
    [weekStarts, setFocusedDate],
  );

  const { getCellProps } = useRovingGrid({
    rows: weekStarts.length,
    cols: 7,
    gridRef,
    onCellFocus,
    initialPosition,
  });

  const dayLabels = firstDay === 0 ? DAY_LABELS_SUNDAY : DAY_LABELS;

  return (
    <div
      data-testid="pro-calendr-react-month"
      className={cn("pro-calendr-react-month", classNames?.monthView)}
    >
      {/* Day-of-week header */}
      <div className={cn("pro-calendr-react-month-header", classNames?.monthHeader)}>
        {dayLabels.map((label) => (
          <div key={label} className="pro-calendr-react-month-header-cell">
            {label}
          </div>
        ))}
      </div>

      {/* Week rows grid container */}
      <div
        ref={gridRef}
        role="grid"
        aria-label="Month view calendar grid"
        aria-rowcount={weekStarts.length}
        aria-colcount={7}
      >
        {weekStarts.map((ws, weekRowIndex) => {
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
              getCellProps={getCellProps}
              weekRowIndex={weekRowIndex}
            />
          );
        })}
      </div>
    </div>
  );
}
