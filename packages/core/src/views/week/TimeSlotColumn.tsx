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
import type { TimeSlot } from "../../utils/slot";
import { useCalendarStore, useCalendarConfig } from "../../components/CalendarContext";
import { cn } from "../../utils/cn";
import { calculateEventPosition, calculateCollisionPosition } from "../../utils/event-position";
import { layoutCollisions } from "../../utils/collision";
import { isSameDay, parseTimeToMinutes, getMinutesSinceMidnight } from "../../utils/date-utils";
import { EventBlock } from "../../components/EventBlock";
import { NowIndicator } from "../../components/NowIndicator";
import { BusinessHoursOverlay } from "../../components/BusinessHoursOverlay";
import { SelectionOverlay } from "../../components/SelectionOverlay";
import { DropIndicator } from "../../components/DropIndicator";
import { useEventInteractions } from "../../hooks/use-event-interactions";
import { useSlotSelection } from "../../hooks/use-selection";

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
  days: Date[];
  timeLabelsWidth: number;
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
  editable = false,
  selectable = false,
  onEventDrop,
  onEventResize,
  onSelect,
  validateDrop,
  days,
  timeLabelsWidth,
}: TimeSlotColumnProps) {
  const { classNames } = useCalendarConfig();
  const columnRef = useRef<HTMLDivElement>(null);

  // Read drag engine state for drop indicator
  const dragPhase = useCalendarStore((s) => s.dragEngine.phase);
  const dragMode = useCalendarStore((s) => s.dragEngine.mode);
  const dragSnappedStart = useCalendarStore((s) => s.dragEngine.snappedStart);
  const dragSnappedEnd = useCalendarStore((s) => s.dragEngine.snappedEnd);
  const dragIsValid = useCalendarStore((s) => s.dragEngine.isValid);

  // Use the parent scrollable grid as the container for coordinate calculation
  // The column itself is within the grid, so we need the grid container
  const gridContainerRef = useRef<HTMLElement | null>(null);

  // Use event interactions hook
  const { handleEventPointerDown } = useEventInteractions({
    containerRef: gridContainerRef,
    days,
    slotHeight,
    slotDuration,
    slotMinTime,
    slotMaxTime,
    totalSlots: slots.length,
    timeLabelsWidth,
    editable,
    onEventClick,
    onEventDrop,
    onEventResize,
    validateDrop,
  });

  // Use slot selection hook
  const { selectionPixels, handleSlotPointerDown } = useSlotSelection({
    containerRef: columnRef,
    day,
    slotHeight,
    slotDuration,
    slotMinTime,
    slotMaxTime,
    totalSlots: slots.length,
    selectable,
    onSelect,
  });

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

  // Calculate drop indicator position when dragging over this column
  const dropIndicator = useMemo(() => {
    if (
      dragPhase !== "dragging" ||
      dragMode === "select" ||
      !dragSnappedStart ||
      !dragSnappedEnd ||
      !isSameDay(dragSnappedStart, day)
    ) {
      return null;
    }

    const gridStartMinutes = parseTimeToMinutes(slotMinTime);
    const pixelsPerMinute = slotHeight / slotDuration;
    const startMinutes = getMinutesSinceMidnight(dragSnappedStart);
    const endMinutes = getMinutesSinceMidnight(dragSnappedEnd);
    return {
      top: (startMinutes - gridStartMinutes) * pixelsPerMinute,
      height: (endMinutes - startMinutes) * pixelsPerMinute,
    };
  }, [
    dragPhase,
    dragMode,
    dragSnappedStart,
    dragSnappedEnd,
    day,
    slotMinTime,
    slotHeight,
    slotDuration,
  ]);

  // Capture the grid container ref on mount
  const setColumnRef = useCallback((node: HTMLDivElement | null) => {
    (columnRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    if (node) {
      // The grid container is the parent of the column (.pro-calendr-react-week-grid or .pro-calendr-react-day-grid)
      gridContainerRef.current = node.parentElement;
    }
  }, []);

  return (
    <div
      ref={setColumnRef}
      className="pro-calendr-react-time-slot-column"
      data-date={day.toISOString()}
      style={{
        minHeight: slots.length * slotHeight,
      }}
      onPointerDown={selectable ? handleSlotPointerDown : undefined}
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

        const canEdit = editable && event.editable !== false;
        const canResize = canEdit && event.durationEditable !== false;

        // Single non-overlapping event: use original full-width positioning
        if (totalColumns === 1) {
          return (
            <EventBlock
              key={event.id}
              event={event}
              eventContent={eventContent}
              onClick={onEventClick}
              onPointerDown={handleEventPointerDown}
              editable={canEdit}
              durationEditable={canResize}
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
            onPointerDown={handleEventPointerDown}
            editable={canEdit}
            durationEditable={canResize}
            style={{
              top: pos.top,
              height: pos.height,
              left: `${String(collisionPos.leftPercent)}%`,
              width: `calc(${String(collisionPos.widthPercent)}% - 4px)`,
            }}
          />
        );
      })}

      {/* Selection overlay */}
      <SelectionOverlay selection={selectionPixels} />

      {/* Drop indicator */}
      {dropIndicator && (
        <DropIndicator
          top={dropIndicator.top}
          height={dropIndicator.height}
          isValid={dragIsValid}
        />
      )}

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
