import { useMemo, useRef } from "react";
import type { DayViewProps } from "../../interfaces/day-view-props";
import { useScheduleStore } from "../../hooks/use-schedule-store";
import { useTimelineLayout } from "../../hooks/use-timeline-layout";
import { useCurrentTime } from "../../hooks/use-current-time";
import { useVirtualRows } from "../../hooks/use-virtual-rows";
import { buildVirtualItems } from "../../utils/build-virtual-items";
import { buildGridBackground } from "../../utils/grid-background";
import { TimeHeader } from "./TimeHeader";
import { ResourceSidebar } from "./ResourceSidebar";
import { TimeGrid } from "./TimeGrid";

const TIME_HEADER_HEIGHT = 40;

export function DayView({
  bookings,
  resourceGroups,
  layoutConfig,
  bookingTypes,
  onBookingClick,
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
    scrollMargin: TIME_HEADER_HEIGHT,
  });

  const gridBackground = useMemo(
    () => buildGridBackground({ hourWidth: layoutConfig.hourWidth }),
    [layoutConfig.hourWidth],
  );

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
          />

          <div className="flex" style={{ minHeight: totalSize }}>
            <ResourceSidebar
              sidebarWidth={layoutConfig.sidebarWidth}
              totalSize={totalSize}
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
              bookingsByResource={layout.bookingsByResource}
              laneDataByResource={layout.laneDataByResource}
              virtualItems={virtualItems}
              items={items}
              bookingTypes={bookingTypes}
              currentTimeMinutes={currentTimeMinutes}
              gridBackground={gridBackground}
              onBookingClick={onBookingClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
