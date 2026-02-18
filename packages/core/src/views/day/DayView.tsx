import { useMemo, useRef } from "react";
import type { DayViewProps } from "../../interfaces/day-view-props";
import { useScheduleStore } from "../../hooks/use-schedule-store";
import { useTimelineLayout } from "../../hooks/use-timeline-layout";
import { useCurrentTime } from "../../hooks/use-current-time";
import { useVirtualRows } from "../../hooks/use-virtual-rows";
import { useBookingSelection } from "../../hooks/use-booking-selection";
import { useBookingDrag } from "../../hooks/use-booking-drag";
import { useBookingResize } from "../../hooks/use-booking-resize";
import { useSlotSelection } from "../../hooks/use-slot-selection";
import { buildVirtualItems } from "../../utils/build-virtual-items";
import { buildGridBackground } from "../../utils/grid-background";
import { TimeHeader } from "./TimeHeader";
import { ResourceSidebar } from "../../components/ResourceSidebar";
import { TimeGrid } from "./TimeGrid";
import { BookingPopover } from "../../components/BookingPopover";

export function DayView({
  bookings,
  resourceGroups,
  layoutConfig,
  bookingTypes,
  onBookingClick,
  onBookingDrop,
  onBookingResize,
  onBookingDelete,
  onBookingDuplicate,
  onBookingEdit,
  onSlotSelect,
}: DayViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const collapsedGroupIds = useScheduleStore({
    selector: (s) => s.collapsedGroupIds,
  });

  const layout = useTimelineLayout({
    bookings,
    resourceGroups,
    collapsedGroupIds,
    layoutConfig,
  });

  const currentTimeMinutes = useCurrentTime({
    config: {
      dayStartHour: layoutConfig.dayStartHour,
      dayEndHour: layoutConfig.dayEndHour,
    },
  });

  const virtualItemsData = useMemo(
    () =>
      buildVirtualItems({
        rows: layout.rows,
        groupPositions: layout.groupPositions,
        resourceGroups,
        collapsedGroupIds,
        groupHeaderHeight: layoutConfig.groupHeaderHeight,
      }),
    [
      layout.rows,
      layout.groupPositions,
      resourceGroups,
      collapsedGroupIds,
      layoutConfig.groupHeaderHeight,
    ],
  );

  const { virtualItems, totalSize, items } = useVirtualRows({
    scrollContainerRef,
    items: virtualItemsData,
    scrollMargin: layoutConfig.timeHeaderHeight,
  });

  const gridBackground = useMemo(
    () => buildGridBackground({ hourWidth: layoutConfig.hourWidth }),
    [layoutConfig.hourWidth],
  );

  const selection = useBookingSelection({
    bookings,
    bookingTypes,
    onBookingClick,
    onBookingDelete,
    onBookingDuplicate,
    onBookingEdit,
  });

  const drag = useBookingDrag({
    layoutConfig,
    rows: layout.rows,
    scrollContainerRef,
    sidebarWidth: layoutConfig.sidebarWidth,
    timeHeaderHeight: layoutConfig.timeHeaderHeight,
    onBookingDrop,
  });

  const resize = useBookingResize({
    layoutConfig,
    scrollContainerRef,
    sidebarWidth: layoutConfig.sidebarWidth,
    timeHeaderHeight: layoutConfig.timeHeaderHeight,
    onBookingResize,
  });

  const slotSelect = useSlotSelection({
    layoutConfig,
    rows: layout.rows,
    scrollContainerRef,
    sidebarWidth: layoutConfig.sidebarWidth,
    timeHeaderHeight: layoutConfig.timeHeaderHeight,
    currentDate: new Date(),
    onSlotSelect,
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div ref={scrollContainerRef} className="relative flex-1 overflow-auto">
        <div
          className="relative"
          style={{
            minWidth: layoutConfig.sidebarWidth + layout.timelineWidth + 1,
          }}
        >
          <TimeHeader
            hours={layout.hours}
            timelineWidth={layout.timelineWidth}
            sidebarWidth={layoutConfig.sidebarWidth}
            hourWidth={layoutConfig.hourWidth}
            dayStartHour={layoutConfig.dayStartHour}
            timeHeaderHeight={layoutConfig.timeHeaderHeight}
          />

          <div className="flex" style={{ minHeight: totalSize }}>
            <ResourceSidebar
              sidebarWidth={layoutConfig.sidebarWidth}
              totalSize={totalSize}
              scrollMargin={layoutConfig.timeHeaderHeight}
              virtualItems={virtualItems}
              items={items}
              groupHeaderHeight={layoutConfig.groupHeaderHeight}
            />

            <TimeGrid
              hours={layout.hours}
              timelineWidth={layout.timelineWidth}
              totalSize={totalSize}
              dayStartHour={layoutConfig.dayStartHour}
              hourWidth={layoutConfig.hourWidth}
              rowHeight={layoutConfig.rowHeight}
              scrollMargin={layoutConfig.timeHeaderHeight}
              bookingsByResource={layout.bookingsByResource}
              laneDataByResource={layout.laneDataByResource}
              virtualItems={virtualItems}
              items={items}
              bookingTypes={bookingTypes}
              currentTimeMinutes={currentTimeMinutes}
              gridBackground={gridBackground}
              onBookingClick={selection.handleBookingClick}
              rows={layout.rows}
              layoutConfig={layoutConfig}
              slotSelection={slotSelect.slotSelection}
              onDragStart={drag.handleBookingPointerDown}
              onResizeStart={resize.handleResizePointerDown}
              onGridPointerDown={slotSelect.handleGridPointerDown}
            />
          </div>
        </div>
      </div>

      {selection.selectedBooking &&
        selection.popoverAnchor &&
        selection.selectedBookingTypeConfig && (
          <BookingPopover
            booking={selection.selectedBooking}
            typeConfig={selection.selectedBookingTypeConfig}
            anchor={selection.popoverAnchor}
            onClose={selection.dismissPopover}
            onEdit={selection.onEdit}
            onDuplicate={selection.onDuplicate}
            onDelete={selection.onDelete}
          />
        )}
    </div>
  );
}
