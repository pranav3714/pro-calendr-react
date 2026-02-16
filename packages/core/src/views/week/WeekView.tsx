import { useCallback, useMemo, useRef, type ReactNode } from "react";
import type {
  CalendarEvent,
  EventContentProps,
  EventDropInfo,
  EventResizeInfo,
  SelectInfo,
  DropValidationResult,
} from "../../types";
import type { BusinessHours } from "../../types/config";
import { useCalendarConfig, useCalendarStore } from "../../components/CalendarContext";
import { cn } from "../../utils/cn";
import { getDaysInRange, isSameDay } from "../../utils/date-utils";
import { generateTimeSlots } from "../../utils/slot";
import { getEventsForDay, partitionAllDayEvents } from "../../utils/event-filter";
import { DEFAULTS } from "../../constants";
import { useRovingGrid, type GridPosition } from "../../hooks/use-roving-grid";
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
  editable?: boolean;
  selectable?: boolean;
  onEventDrop?: (info: EventDropInfo) => void;
  onEventResize?: (info: EventResizeInfo) => void;
  onSelect?: (info: SelectInfo) => void;
  validateDrop?: (info: {
    event: CalendarEvent;
    newStart: Date;
    newEnd: Date;
    newResourceId?: string;
  }) => DropValidationResult;
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
  editable = false,
  selectable = false,
  onEventDrop,
  onEventResize,
  onSelect,
  validateDrop,
}: WeekViewProps) {
  const { classNames } = useCalendarConfig();
  const setFocusedDate = useCalendarStore((s) => s.setFocusedDate);
  const focusedDate = useCalendarStore((s) => s.focusedDate);

  const gridRef = useRef<HTMLDivElement>(null);

  const days = useMemo(
    () => getDaysInRange(dateRange.start, dateRange.end),
    [dateRange.start, dateRange.end],
  );

  const slots = useMemo(
    () => generateTimeSlots(slotMinTime, slotMaxTime, slotDuration),
    [slotMinTime, slotMaxTime, slotDuration],
  );

  // Compute initial grid position from focusedDate
  const initialPosition = useMemo<GridPosition>(() => {
    if (!focusedDate) return { row: 0, col: 0 };
    const colIndex = days.findIndex((d) => isSameDay(d, focusedDate));
    if (colIndex === -1) return { row: 0, col: 0 };
    // Find the matching time slot row based on hours/minutes
    const focusedMinutes = focusedDate.getHours() * 60 + focusedDate.getMinutes();
    const rowIndex = slots.findIndex((s) => {
      const slotMinutes = s.start.getHours() * 60 + s.start.getMinutes();
      return slotMinutes === focusedMinutes;
    });
    return { row: rowIndex === -1 ? 0 : rowIndex, col: colIndex };
  }, [focusedDate, days, slots]);

  const onCellFocus = useCallback(
    (pos: GridPosition) => {
      const focusDay = days[pos.col] as Date | undefined;
      const slot = slots[pos.row] as (typeof slots)[number] | undefined;
      if (focusDay && slot) {
        const date = new Date(focusDay);
        date.setHours(slot.start.getHours(), slot.start.getMinutes(), 0, 0);
        setFocusedDate(date);
      }
    },
    [days, slots, setFocusedDate],
  );

  const { getCellProps } = useRovingGrid({
    rows: slots.length,
    cols: days.length,
    gridRef,
    onCellFocus,
    initialPosition,
  });

  // Separate all-day events
  const { allDay: allDayEvents, timed: timedEvents } = useMemo(
    () => partitionAllDayEvents(events),
    [events],
  );

  const timeLabelsWidth = 60;

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
        ref={gridRef}
        className="pro-calendr-react-week-grid"
        role="grid"
        aria-label="Week view calendar grid"
        aria-rowcount={slots.length}
        aria-colcount={days.length}
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
        {days.map((day, index) => {
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
              editable={editable}
              selectable={selectable}
              onEventDrop={onEventDrop}
              onEventResize={onEventResize}
              onSelect={onSelect}
              validateDrop={validateDrop}
              days={days}
              timeLabelsWidth={timeLabelsWidth}
              getCellProps={getCellProps}
              dayIndex={index}
            />
          );
        })}
      </div>
    </div>
  );
}
