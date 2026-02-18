import type { Booking } from "../../interfaces/booking";
import type {
  WeekResourceGridProps,
  WeekRenderGroupHeaderParams,
  WeekRenderResourceRowParams,
} from "../../interfaces/week-view-props";
import type { WeekDragTarget } from "../../interfaces/week-cell-drag-params";
import { WeekCell } from "./WeekCell";

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

function renderGroupHeader({ virtualItem, scrollMargin, itemData }: WeekRenderGroupHeaderParams) {
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
        className="flex items-center border-b border-[var(--cal-border)] bg-[var(--cal-bg-subtle)] px-3"
        style={{ height: itemData.height }}
      />
    </div>
  );
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
}: WeekRenderResourceRowParams) {
  const resourceId = itemData.resource.id;

  return (
    <div
      key={virtualItem.key}
      className="absolute left-0 w-full border-b border-[var(--cal-border-light)]"
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
