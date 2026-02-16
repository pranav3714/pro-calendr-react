import React, { useRef } from "react";
import {
  type Booking,
  type AnchorRect,
  DAY_START_HOUR,
  DAY_END_HOUR,
  SIDEBAR_WIDTH,
} from "./scheduleData";
import useDayViewResourceLayout from "./useDayViewResourceLayout";
import useDayViewCurrentTime from "./useDayViewCurrentTime";
import useDayViewDragAndResize from "./useDayViewDragAndResize";
import DayViewTimeHeader from "./DayViewTimeHeader";
import DayViewResourceSidebar from "./DayViewResourceSidebar";
import DayViewTimelineGrid from "./DayViewTimelineGrid";

// ── Props ────────────────────────────────────────────────────────────────────

interface DayViewProps {
  bookings: Booking[];
  onBookingClick: (booking: Booking, rect: AnchorRect) => void;
  onBookingsChange: (bookings: Booking[]) => void;
  collapsedGroups: Set<string>;
  onToggleGroup: (groupId: string) => void;
  dayStartHour?: number;
  dayEndHour?: number;
}

// ── Component ────────────────────────────────────────────────────────────────

const DayView: React.FC<DayViewProps> = ({
  bookings,
  onBookingClick,
  onBookingsChange,
  collapsedGroups,
  onToggleGroup,
  dayStartHour = DAY_START_HOUR,
  dayEndHour = DAY_END_HOUR,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const {
    timelineWidth,
    hours,
    helperConfig,
    bookingsByResource,
    laneDataByResource,
    rows,
    totalHeight,
    rowDataByResource,
  } = useDayViewResourceLayout({
    bookings,
    collapsedGroups,
    dayStartHour,
    dayEndHour,
  });

  const { currentTimeX } = useDayViewCurrentTime({
    containerRef,
    helperConfig,
    dayStartHour,
    dayEndHour,
  });

  const {
    dragState,
    resizeState,
    hoveredRow,
    handleDragStart,
    handleResizeStart,
    handlePointerMove,
    handlePointerUp,
  } = useDayViewDragAndResize({
    timelineRef,
    rows,
    helperConfig,
    bookings,
    dayStartHour,
    dayEndHour,
    onBookingClick,
    onBookingsChange,
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-white">
      <div ref={containerRef} className="relative flex-1 overflow-auto">
        <div
          style={{ minWidth: SIDEBAR_WIDTH + timelineWidth + 1 }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <DayViewTimeHeader
            hours={hours}
            timelineWidth={timelineWidth}
            dayStartHour={dayStartHour}
            dayEndHour={dayEndHour}
          />

          <div className="flex" style={{ minHeight: totalHeight }}>
            <DayViewResourceSidebar
              collapsedGroups={collapsedGroups}
              onToggleGroup={onToggleGroup}
              rowDataByResource={rowDataByResource}
              hoveredRow={hoveredRow}
            />

            <DayViewTimelineGrid
              timelineRef={timelineRef}
              timelineWidth={timelineWidth}
              hours={hours}
              helperConfig={helperConfig}
              collapsedGroups={collapsedGroups}
              bookingsByResource={bookingsByResource}
              laneDataByResource={laneDataByResource}
              rowDataByResource={rowDataByResource}
              rows={rows}
              currentTimeX={currentTimeX}
              dragState={dragState}
              resizeState={resizeState}
              hoveredRow={hoveredRow}
              dayStartHour={dayStartHour}
              dayEndHour={dayEndHour}
              handleDragStart={handleDragStart}
              handleResizeStart={handleResizeStart}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayView;
