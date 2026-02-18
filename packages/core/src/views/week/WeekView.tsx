import { useMemo, useRef } from "react";
import type { WeekViewProps } from "../../interfaces/week-view-props";
import { useScheduleStore } from "../../hooks/use-schedule-store";
import { useWeekLayout } from "../../hooks/use-week-layout";
import { useVirtualRows } from "../../hooks/use-virtual-rows";
import { useWeekBookingIndex } from "../../hooks/use-week-booking-index";
import { useWeekCellDrag } from "../../hooks/use-week-cell-drag";
import { useBookingSelection } from "../../hooks/use-booking-selection";
import { useFilteredBookings } from "../../hooks/use-filtered-bookings";
import { buildVirtualItems } from "../../utils/build-virtual-items";
import { getWeekDays } from "../../utils/date-helpers";
import { formatDateKey } from "../../utils/format-date-key";
import { ResourceSidebar } from "../../components/ResourceSidebar";
import { BookingPopover } from "../../components/BookingPopover";
import { WeekCellDragGhost } from "../../components/WeekCellDragGhost";
import { WeekDayHeader } from "./WeekDayHeader";
import { WeekResourceGrid } from "./WeekResourceGrid";

export function WeekView({
  bookings,
  resourceGroups,
  layoutConfig,
  bookingTypes,
  onBookingClick,
  onBookingDrop,
  onBookingDelete,
  onBookingDuplicate,
  onBookingEdit,
}: WeekViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const currentDate = useScheduleStore({ selector: (s) => s.currentDate });
  const collapsedGroupIds = useScheduleStore({ selector: (s) => s.collapsedGroupIds });

  const filteredBookings = useFilteredBookings({ bookings });

  const today = useMemo(() => new Date(), []);
  const weekDays = useMemo(() => getWeekDays({ date: currentDate }), [currentDate]);
  const dateKeys = useMemo(() => weekDays.map((day) => formatDateKey({ date: day })), [weekDays]);

  const layout = useWeekLayout({
    resourceGroups,
    collapsedGroupIds,
    rowHeight: layoutConfig.rowHeight,
    groupHeaderHeight: layoutConfig.groupHeaderHeight,
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

  const headerHeight = 52;

  const { virtualItems, totalSize, items } = useVirtualRows({
    scrollContainerRef,
    items: virtualItemsData,
    scrollMargin: headerHeight,
  });

  const bookingIndex = useWeekBookingIndex({
    bookings: filteredBookings,
    weekDays,
  });

  const drag = useWeekCellDrag({
    rows: layout.rows,
    scrollContainerRef,
    gridRef,
    sidebarWidth: layoutConfig.sidebarWidth,
    headerHeight,
    weekDays,
    dragThreshold: layoutConfig.dragThreshold,
    onBookingDrop,
  });

  const selection = useBookingSelection({
    bookings: filteredBookings,
    bookingTypes,
    onBookingClick,
    onBookingDelete,
    onBookingDuplicate,
    onBookingEdit,
  });

  const draggedTypeConfig = useMemo(() => {
    if (!drag.draggedBooking) {
      return null;
    }
    return bookingTypes[drag.draggedBooking.type] ?? null;
  }, [drag.draggedBooking, bookingTypes]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div ref={scrollContainerRef} className="relative flex-1 overflow-auto">
        <div
          ref={gridRef}
          className="relative"
          style={{ minWidth: layoutConfig.sidebarWidth + 700 }}
        >
          <WeekDayHeader days={weekDays} today={today} sidebarWidth={layoutConfig.sidebarWidth} />

          <div className="flex" style={{ minHeight: totalSize }}>
            <ResourceSidebar
              sidebarWidth={layoutConfig.sidebarWidth}
              totalSize={totalSize}
              scrollMargin={headerHeight}
              virtualItems={virtualItems}
              items={items}
              groupHeaderHeight={layoutConfig.groupHeaderHeight}
            />

            <WeekResourceGrid
              virtualItems={virtualItems}
              items={items}
              totalSize={totalSize}
              scrollMargin={headerHeight}
              weekDays={weekDays}
              dateKeys={dateKeys}
              bookingIndex={bookingIndex}
              bookingTypes={bookingTypes}
              dropTarget={drag.dropTarget}
              draggedBookingId={drag.draggedBookingId}
              onBookingClick={selection.handleBookingClick}
              onDragStart={drag.handleBookingPointerDown}
            />
          </div>
        </div>
      </div>

      {drag.isDragging && drag.draggedBooking && drag.ghostPosition && draggedTypeConfig && (
        <WeekCellDragGhost
          booking={drag.draggedBooking}
          typeConfig={draggedTypeConfig}
          position={drag.ghostPosition}
        />
      )}

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
