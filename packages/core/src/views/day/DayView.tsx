import { useCallback, useMemo, useRef, type ReactNode } from "react";
import { format } from "date-fns";
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
import { generateTimeSlots } from "../../utils/slot";
import { getEventsForDay, partitionAllDayEvents } from "../../utils/event-filter";
import { DEFAULTS } from "../../constants";
import { useRovingGrid, type GridPosition } from "../../hooks/use-roving-grid";
import { TimeSlotColumn } from "../week/TimeSlotColumn";
import { AllDayRow } from "../../components/AllDayRow";

export interface DayViewProps {
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

export function DayView({
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
}: DayViewProps) {
  const { classNames } = useCalendarConfig();
  const setFocusedDate = useCalendarStore((s) => s.setFocusedDate);
  const focusedDate = useCalendarStore((s) => s.focusedDate);

  const gridRef = useRef<HTMLDivElement>(null);

  // DayView shows a single day
  const day = dateRange.start;
  const days = useMemo(() => [day], [day]);

  const slots = useMemo(
    () => generateTimeSlots(slotMinTime, slotMaxTime, slotDuration),
    [slotMinTime, slotMaxTime, slotDuration],
  );

  // Compute initial grid position from focusedDate
  const initialPosition = useMemo<GridPosition>(() => {
    if (!focusedDate) return { row: 0, col: 0 };
    const focusedMinutes = focusedDate.getHours() * 60 + focusedDate.getMinutes();
    const rowIndex = slots.findIndex((s) => {
      const slotMinutes = s.start.getHours() * 60 + s.start.getMinutes();
      return slotMinutes === focusedMinutes;
    });
    return { row: rowIndex === -1 ? 0 : rowIndex, col: 0 };
  }, [focusedDate, slots]);

  const onCellFocus = useCallback(
    (pos: GridPosition) => {
      const slot = slots[pos.row] as (typeof slots)[number] | undefined;
      if (slot) {
        const date = new Date(day);
        date.setHours(slot.start.getHours(), slot.start.getMinutes(), 0, 0);
        setFocusedDate(date);
      }
    },
    [day, slots, setFocusedDate],
  );

  const { getCellProps } = useRovingGrid({
    rows: slots.length,
    cols: 1,
    gridRef,
    onCellFocus,
    initialPosition,
  });

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

  const timeLabelsWidth = 60;

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
      <AllDayRow
        days={[day]}
        allDayEvents={allDayEvents}
        eventContent={eventContent}
        onEventClick={onEventClick}
      />

      {/* Time grid: time labels + single column */}
      <div
        ref={gridRef}
        className="pro-calendr-react-day-grid"
        role="grid"
        aria-label="Day view calendar grid"
        aria-rowcount={slots.length}
        aria-colcount={1}
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

        {/* Single day column */}
        <TimeSlotColumn
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
          dayIndex={0}
        />
      </div>
    </div>
  );
}
