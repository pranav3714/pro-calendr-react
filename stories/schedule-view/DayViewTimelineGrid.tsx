import React, { type RefObject } from "react";
import {
  type Booking,
  type HelperConfig,
  RESOURCE_GROUPS,
  HOUR_WIDTH,
  ROW_HEIGHT,
  GROUP_HEADER_HEIGHT,
  minutesToPosition,
} from "./scheduleData";
import type { RowData } from "./useDayViewResourceLayout";
import type { DragState, ResizeState } from "./useDayViewDragAndResize";
import BookingBlock from "./BookingBlock";
import DragGhost from "./DragGhost";
import ResizeGhost from "./ResizeGhost";

// ── Props ────────────────────────────────────────────────────────────────────

interface DayViewTimelineGridProps {
  timelineRef: RefObject<HTMLDivElement>;
  timelineWidth: number;
  hours: number[];
  helperConfig: HelperConfig;
  collapsedGroups: Set<string>;
  bookingsByResource: Map<string, Booking[]>;
  laneDataByResource: Map<string, { laneAssignments: Map<string, number>; laneCount: number }>;
  rowDataByResource: Map<string, RowData>;
  rows: RowData[];
  currentTimeX: number | null;
  dragState: DragState | null;
  resizeState: ResizeState | null;
  hoveredRow: string | null;
  dayStartHour: number;
  dayEndHour: number;
  handleDragStart: (e: React.PointerEvent, booking: Booking) => void;
  handleResizeStart: (e: React.PointerEvent, booking: Booking, edge: "left" | "right") => void;
}

// ── Component ────────────────────────────────────────────────────────────────

const DayViewTimelineGrid: React.FC<DayViewTimelineGridProps> = ({
  timelineRef,
  timelineWidth,
  hours,
  helperConfig,
  collapsedGroups,
  bookingsByResource,
  laneDataByResource,
  rowDataByResource,
  rows: _rows,
  currentTimeX,
  dragState,
  resizeState,
  hoveredRow,
  dayStartHour,
  dayEndHour,
  handleDragStart,
  handleResizeStart,
}) => {
  return (
    <div ref={timelineRef} className="relative flex-1" style={{ width: timelineWidth }}>
      {/* Vertical grid lines */}
      {hours.map((h) => {
        const x = (h - dayStartHour) * HOUR_WIDTH;
        const isLast = h === dayEndHour - 1;

        return (
          <React.Fragment key={`grid-${String(h)}`}>
            {/* Hour line */}
            <div
              className="pointer-events-none absolute bottom-0 top-0 border-l border-gray-100"
              style={{ left: x }}
            />
            {/* Half-hour line */}
            {!isLast && (
              <div
                className="pointer-events-none absolute bottom-0 top-0 border-l border-gray-50"
                style={{ left: x + HOUR_WIDTH / 2 }}
              />
            )}
          </React.Fragment>
        );
      })}

      {/* Resource groups and rows */}
      {RESOURCE_GROUPS.map((group) => {
        const isCollapsed = collapsedGroups.has(group.id);

        return (
          <React.Fragment key={group.id}>
            {/* Group header spacer */}
            <div
              className="border-b border-gray-200 bg-gray-50/40"
              style={{ height: GROUP_HEADER_HEIGHT }}
            />

            {/* Resource rows */}
            {!isCollapsed &&
              group.resources.map((resource) => {
                const rowData = rowDataByResource.get(resource.id);
                const rowHeight = rowData?.rowHeight ?? ROW_HEIGHT;
                const resourceBookings = bookingsByResource.get(resource.id) ?? [];
                const laneData = laneDataByResource.get(resource.id);
                const isHovered = hoveredRow === resource.id;

                return (
                  <div
                    key={resource.id}
                    className={`relative border-b border-gray-100 transition-colors duration-100 ${
                      isHovered ? "bg-blue-50/30" : ""
                    }`}
                    style={{ height: rowHeight }}
                  >
                    {resourceBookings.map((booking) => {
                      const laneIndex = laneData?.laneAssignments.get(booking.id) ?? 0;
                      const left = minutesToPosition(booking.startMinutes, helperConfig);
                      const width = minutesToPosition(booking.endMinutes, helperConfig) - left;
                      const top = laneIndex * ROW_HEIGHT + 4;
                      const height = ROW_HEIGHT - 8;

                      const isBeingDragged =
                        dragState?.isDragging && dragState.booking.id === booking.id;
                      const isBeingResized =
                        resizeState?.isResizing && resizeState.booking.id === booking.id;

                      return (
                        <BookingBlock
                          key={booking.id}
                          booking={booking}
                          style={{
                            left,
                            width: Math.max(width, 30),
                            top,
                            height,
                            opacity: isBeingDragged || isBeingResized ? 0.3 : undefined,
                          }}
                          onDragStart={handleDragStart}
                          onResizeStart={handleResizeStart}
                        />
                      );
                    })}
                  </div>
                );
              })}
          </React.Fragment>
        );
      })}

      {/* Current time indicator */}
      {currentTimeX !== null && (
        <>
          {/* Vertical line */}
          <div
            className="pointer-events-none absolute bottom-0 top-0 z-10 bg-red-500/70"
            style={{ left: currentTimeX, width: 2 }}
          />
          {/* Circle dot at top */}
          <div
            className="pointer-events-none absolute z-10"
            style={{ left: currentTimeX - 5, top: -5 }}
          >
            <div className="relative h-[11px] w-[11px]">
              <div className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-75" />
              <div className="relative h-full w-full rounded-full bg-red-500" />
            </div>
          </div>
        </>
      )}

      {/* Drag ghost overlay */}
      {dragState?.isDragging && (
        <DragGhost
          dragState={dragState}
          timelineRef={timelineRef}
          dayStartHour={dayStartHour}
          dayEndHour={dayEndHour}
        />
      )}

      {/* Resize ghost overlay */}
      {resizeState?.isResizing && (
        <ResizeGhost
          resizeState={resizeState}
          timelineRef={timelineRef}
          rowDataByResource={rowDataByResource}
          laneDataByResource={laneDataByResource}
          dayStartHour={dayStartHour}
          dayEndHour={dayEndHour}
        />
      )}
    </div>
  );
};

export default DayViewTimelineGrid;
