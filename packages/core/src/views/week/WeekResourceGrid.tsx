import type { VirtualItem } from "@tanstack/react-virtual";
import type { Booking } from "../../interfaces/booking";
import type { BookingTypeConfig } from "../../interfaces/booking-type";
import type { VirtualItemData } from "../../interfaces/virtual-item-data";
import type { PopoverAnchor } from "../../interfaces/popover-state";
import type { WeekDragTarget } from "../../interfaces/week-cell-drag-params";
import { WeekCell } from "./WeekCell";

interface WeekResourceGridProps {
  readonly virtualItems: readonly VirtualItem[];
  readonly items: readonly VirtualItemData[];
  readonly totalSize: number;
  readonly scrollMargin: number;
  readonly weekDays: readonly Date[];
  readonly dateKeys: readonly string[];
  readonly bookingIndex: ReadonlyMap<string, readonly Booking[]>;
  readonly bookingTypes: Readonly<Record<string, BookingTypeConfig>>;
  readonly dropTarget: WeekDragTarget | null;
  readonly draggedBookingId: string | null;
  readonly onBookingClick?: (params: {
    readonly booking: Booking;
    readonly anchor: PopoverAnchor;
  }) => void;
  readonly onDragStart?: (params: {
    readonly e: React.PointerEvent;
    readonly booking: Booking;
    readonly dateKey: string;
    readonly resourceId: string;
  }) => void;
}

interface RenderGroupHeaderParams {
  readonly virtualItem: VirtualItem;
  readonly scrollMargin: number;
  readonly itemData: import("../../interfaces/virtual-item-data").VirtualGroupHeader;
}

function renderGroupHeader({ virtualItem, scrollMargin, itemData }: RenderGroupHeaderParams) {
  return (
    <div
      key={virtualItem.key}
      className="absolute left-0 w-full"
      style={{
        top: virtualItem.start - scrollMargin,
        height: virtualItem.size,
      }}
    >
      <div
        className="flex items-center border-b border-gray-200 bg-gray-50/60 px-3"
        style={{ height: itemData.height }}
      />
    </div>
  );
}

interface RenderResourceRowParams {
  readonly virtualItem: VirtualItem;
  readonly scrollMargin: number;
  readonly itemData: import("../../interfaces/virtual-item-data").VirtualResourceRow;
  readonly dateKeys: readonly string[];
  readonly bookingIndex: ReadonlyMap<string, readonly Booking[]>;
  readonly bookingTypes: Readonly<Record<string, BookingTypeConfig>>;
  readonly dropTarget: WeekDragTarget | null;
  readonly draggedBookingId: string | null;
  readonly onBookingClick?: (params: {
    readonly booking: Booking;
    readonly anchor: PopoverAnchor;
  }) => void;
  readonly onDragStart?: (params: {
    readonly e: React.PointerEvent;
    readonly booking: Booking;
    readonly dateKey: string;
    readonly resourceId: string;
  }) => void;
}

function isDropTargetCell({
  dropTarget,
  dateKey,
  resourceId,
}: {
  readonly dropTarget: WeekDragTarget | null;
  readonly dateKey: string;
  readonly resourceId: string;
}): boolean {
  if (!dropTarget) {
    return false;
  }
  return dropTarget.dateKey === dateKey && dropTarget.resourceId === resourceId;
}

function getCellBookings({
  bookingIndex,
  dateKey,
  resourceId,
  draggedBookingId,
}: {
  readonly bookingIndex: ReadonlyMap<string, readonly Booking[]>;
  readonly dateKey: string;
  readonly resourceId: string;
  readonly draggedBookingId: string | null;
}): readonly Booking[] {
  const cellKey = `${dateKey}:${resourceId}`;
  const bookings = bookingIndex.get(cellKey) ?? [];
  if (!draggedBookingId) {
    return bookings;
  }
  return bookings.filter((b) => b.id !== draggedBookingId);
}

function renderResourceRow({
  virtualItem,
  scrollMargin,
  itemData,
  dateKeys,
  bookingIndex,
  bookingTypes,
  dropTarget,
  draggedBookingId,
  onBookingClick,
  onDragStart,
}: RenderResourceRowParams) {
  const resourceId = itemData.resource.id;

  return (
    <div
      key={virtualItem.key}
      className="absolute left-0 w-full border-b border-gray-100"
      style={{
        top: virtualItem.start - scrollMargin,
        height: virtualItem.size,
      }}
    >
      <div className="grid h-full grid-cols-7">
        {dateKeys.map((dateKey) => (
          <WeekCell
            key={dateKey}
            bookings={getCellBookings({ bookingIndex, dateKey, resourceId, draggedBookingId })}
            bookingTypes={bookingTypes}
            maxVisible={2}
            resourceId={resourceId}
            dateKey={dateKey}
            isDropTarget={isDropTargetCell({ dropTarget, dateKey, resourceId })}
            onBookingClick={onBookingClick}
            onDragStart={onDragStart}
          />
        ))}
      </div>
    </div>
  );
}

export function WeekResourceGrid({
  virtualItems,
  items,
  totalSize,
  scrollMargin,
  weekDays: _weekDays,
  dateKeys,
  bookingIndex,
  bookingTypes,
  dropTarget,
  draggedBookingId,
  onBookingClick,
  onDragStart,
}: WeekResourceGridProps) {
  return (
    <div className="relative flex-1" style={{ height: totalSize }}>
      {virtualItems.map((virtualItem) => {
        const itemData = items[virtualItem.index];

        if (itemData.kind === "group-header") {
          return renderGroupHeader({ virtualItem, scrollMargin, itemData });
        }

        return renderResourceRow({
          virtualItem,
          scrollMargin,
          itemData,
          dateKeys,
          bookingIndex,
          bookingTypes,
          dropTarget,
          draggedBookingId,
          onBookingClick,
          onDragStart,
        });
      })}
    </div>
  );
}
