import type { TimeGridProps } from "../../interfaces/day-view-props";
import type {
  RenderVirtualItemParams,
  RenderResourceRowParams,
} from "../../interfaces/time-grid-internals";
import { NowIndicator } from "../../components/NowIndicator";
import { DragGhost } from "../../components/DragGhost";
import { ResizeGhost } from "../../components/ResizeGhost";
import { TimeTooltip } from "../../components/TimeTooltip";
import { SelectionOverlay } from "../../components/SelectionOverlay";
import { minutesToPosition } from "../../utils/time-position";
import { ResourceRowBlocks } from "./ResourceRowBlocks";

function renderGroupHeaderPlaceholder({ height }: { readonly height: number }) {
  return (
    <div
      className="border-b border-[var(--cal-border-light)] bg-[var(--cal-bg-subtle)]"
      style={{ height }}
    />
  );
}

function renderResourceRow({
  itemData,
  bookingsByResource,
  laneDataByResource,
  timelineWidth,
  config,
  bookingTypes,
  onBookingClick,
  onDragStart,
  onResizeStart,
}: RenderResourceRowParams) {
  const resourceBookings = bookingsByResource.get(itemData.resource.id) ?? [];
  const laneData = laneDataByResource.get(itemData.resource.id);

  return (
    <div
      className="relative border-b border-[var(--cal-border-light)]"
      style={{ height: itemData.rowHeight }}
    >
      <ResourceRowBlocks
        bookings={resourceBookings}
        laneData={laneData}
        rowHeight={itemData.rowHeight}
        timelineWidth={timelineWidth}
        config={config}
        bookingTypes={bookingTypes}
        onBookingClick={onBookingClick}
        onDragStart={onDragStart}
        onResizeStart={onResizeStart}
      />
    </div>
  );
}

function renderVirtualItem(params: RenderVirtualItemParams) {
  if (params.itemData.kind === "group-header") {
    return renderGroupHeaderPlaceholder({ height: params.itemData.height });
  }

  return renderResourceRow({
    itemData: params.itemData,
    bookingsByResource: params.bookingsByResource,
    laneDataByResource: params.laneDataByResource,
    timelineWidth: params.timelineWidth,
    config: params.config,
    bookingTypes: params.bookingTypes,
    onBookingClick: params.onBookingClick,
    onDragStart: params.onDragStart,
    onResizeStart: params.onResizeStart,
  });
}

export function TimeGrid({
  timelineWidth,
  totalSize,
  dayStartHour,
  hourWidth,
  rowHeight,
  scrollMargin,
  bookingsByResource,
  laneDataByResource,
  virtualItems,
  items,
  bookingTypes,
  currentTimeMinutes,
  gridBackground,
  onBookingClick,
  rows,
  layoutConfig,
  slotSelection,
  onDragStart,
  onResizeStart,
  onGridPointerDown,
}: TimeGridProps) {
  const config = { dayStartHour, hourWidth };

  function handleGridPointerDown(e: React.PointerEvent): void {
    if (!onGridPointerDown) {
      return;
    }
    onGridPointerDown({ e });
  }

  return (
    <div
      className="relative flex-1"
      style={{
        width: timelineWidth,
        height: totalSize,
        backgroundImage: gridBackground.backgroundImage,
        backgroundSize: gridBackground.backgroundSize,
      }}
      onPointerDown={handleGridPointerDown}
    >
      {virtualItems.map((virtualItem) => {
        const itemData = items[virtualItem.index];
        return (
          <div
            key={virtualItem.key}
            className="absolute left-0 w-full"
            style={{
              top: virtualItem.start - scrollMargin,
              height: virtualItem.size,
            }}
          >
            {renderVirtualItem({
              itemData,
              bookingsByResource,
              laneDataByResource,
              timelineWidth,
              rowHeight,
              config,
              bookingTypes,
              onBookingClick,
              onDragStart,
              onResizeStart,
            })}
          </div>
        );
      })}

      {currentTimeMinutes !== null && (
        <NowIndicator positionX={minutesToPosition({ minutes: currentTimeMinutes, config })} />
      )}

      {rows && layoutConfig && (
        <>
          <DragGhost
            bookings={[...bookingsByResource.values()].flat()}
            bookingTypes={bookingTypes}
            layoutConfig={layoutConfig}
            rows={rows}
            laneDataByResource={laneDataByResource}
          />
          <ResizeGhost
            bookings={[...bookingsByResource.values()].flat()}
            bookingTypes={bookingTypes}
            layoutConfig={layoutConfig}
            rows={rows}
            laneDataByResource={laneDataByResource}
          />
          <TimeTooltip layoutConfig={layoutConfig} />
        </>
      )}

      {slotSelection && rows && layoutConfig && (
        <SelectionOverlay slotSelection={slotSelection} layoutConfig={layoutConfig} rows={rows} />
      )}
    </div>
  );
}
