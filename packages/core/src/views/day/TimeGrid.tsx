import type { TimeGridProps } from "../../interfaces/day-view-props";
import type { Booking } from "../../interfaces/booking";
import type { BookingTypeConfig } from "../../interfaces/booking-type";
import type { LaneResult } from "../../interfaces/lane-result";
import type { PopoverAnchor } from "../../interfaces/popover-state";
import type { ResizeEdge } from "../../interfaces/resize-state";
import type { VirtualItemData } from "../../interfaces/virtual-item-data";
import { BookingBlock } from "../../components/BookingBlock";
import { NowIndicator } from "../../components/NowIndicator";
import { DragGhost } from "../../components/DragGhost";
import { ResizeGhost } from "../../components/ResizeGhost";
import { TimeTooltip } from "../../components/TimeTooltip";
import { SelectionOverlay } from "../../components/SelectionOverlay";
import { useScheduleStore } from "../../hooks/use-schedule-store";
import { minutesToPosition } from "../../utils/time-position";

const MIN_BLOCK_WIDTH = 24;
const LANE_PADDING_TOP = 4;
const LANE_PADDING_TOTAL = 8;

interface ComputeBlockPositionParams {
  readonly booking: Booking;
  readonly laneIndex: number;
  readonly rowHeight: number;
  readonly timelineWidth: number;
  readonly config: { readonly dayStartHour: number; readonly hourWidth: number };
}

interface BlockPosition {
  readonly left: number;
  readonly width: number;
  readonly top: number;
  readonly height: number;
}

function computeBlockPosition({
  booking,
  laneIndex,
  rowHeight,
  timelineWidth,
  config,
}: ComputeBlockPositionParams): BlockPosition {
  const rawLeft = minutesToPosition({ minutes: booking.startMinutes, config });
  const rawRight = minutesToPosition({ minutes: booking.endMinutes, config });
  const clampedLeft = Math.max(0, rawLeft);
  const clampedRight = Math.min(timelineWidth, rawRight);
  const clampedWidth = Math.max(clampedRight - clampedLeft, MIN_BLOCK_WIDTH);

  return {
    left: clampedLeft,
    width: clampedWidth,
    top: laneIndex * rowHeight + LANE_PADDING_TOP,
    height: rowHeight - LANE_PADDING_TOTAL,
  };
}

interface ResourceRowBlocksProps {
  readonly bookings: readonly Booking[];
  readonly laneData: LaneResult | undefined;
  readonly rowHeight: number;
  readonly timelineWidth: number;
  readonly config: { readonly dayStartHour: number; readonly hourWidth: number };
  readonly bookingTypes: Readonly<Record<string, BookingTypeConfig>>;
  readonly onBookingClick?: (params: {
    readonly booking: Booking;
    readonly anchor: PopoverAnchor;
  }) => void;
  readonly onDragStart?: (params: {
    readonly e: React.PointerEvent;
    readonly booking: Booking;
  }) => void;
  readonly onResizeStart?: (params: {
    readonly e: React.PointerEvent;
    readonly booking: Booking;
    readonly edge: ResizeEdge;
  }) => void;
}

function ResourceRowBlocks({
  bookings,
  laneData,
  rowHeight,
  timelineWidth,
  config,
  bookingTypes,
  onBookingClick,
  onDragStart,
  onResizeStart,
}: ResourceRowBlocksProps) {
  const draggedBookingId = useScheduleStore({ selector: (s) => s.draggedBookingId });
  const resizedBookingId = useScheduleStore({ selector: (s) => s.resizedBookingId });
  const laneAssignments = laneData ? laneData.laneAssignments : new Map<string, number>();
  const laneCount = laneData ? Math.max(1, laneData.laneCount) : 1;
  const singleLaneHeight = rowHeight / laneCount;

  return (
    <>
      {bookings.map((booking) => {
        const laneIndex = laneAssignments.get(booking.id) ?? 0;
        const typeConfig = bookingTypes[booking.type] ?? bookingTypes.flight;
        const position = computeBlockPosition({
          booking,
          laneIndex,
          rowHeight: singleLaneHeight,
          timelineWidth,
          config,
        });

        return (
          <BookingBlock
            key={booking.id}
            booking={booking}
            left={position.left}
            width={position.width}
            top={position.top}
            height={position.height}
            typeConfig={typeConfig}
            isDragTarget={draggedBookingId === booking.id}
            isResizeTarget={resizedBookingId === booking.id}
            onClick={onBookingClick}
            onDragStart={onDragStart}
            onResizeStart={onResizeStart}
          />
        );
      })}
    </>
  );
}

interface RenderVirtualItemParams {
  readonly itemData: VirtualItemData;
  readonly bookingsByResource: ReadonlyMap<string, readonly Booking[]>;
  readonly laneDataByResource: ReadonlyMap<string, LaneResult>;
  readonly timelineWidth: number;
  readonly rowHeight: number;
  readonly config: { readonly dayStartHour: number; readonly hourWidth: number };
  readonly bookingTypes: Readonly<Record<string, BookingTypeConfig>>;
  readonly onBookingClick?: (params: {
    readonly booking: Booking;
    readonly anchor: PopoverAnchor;
  }) => void;
  readonly onDragStart?: TimeGridProps["onDragStart"];
  readonly onResizeStart?: TimeGridProps["onResizeStart"];
}

function renderGroupHeaderPlaceholder({ height }: { readonly height: number }) {
  return <div className="border-b border-gray-100 bg-gray-50/40" style={{ height }} />;
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
}: Omit<RenderVirtualItemParams, "rowHeight" | "itemData"> & {
  readonly itemData: import("../../interfaces/virtual-item-data").VirtualResourceRow;
}) {
  const resourceBookings = bookingsByResource.get(itemData.resource.id) ?? [];
  const laneData = laneDataByResource.get(itemData.resource.id);

  return (
    <div className="relative border-b border-gray-100" style={{ height: itemData.rowHeight }}>
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
