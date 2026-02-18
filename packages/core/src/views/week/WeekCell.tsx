import type { WeekCellProps } from "../../interfaces/week-view-props";
import type { BookingTypeConfig } from "../../interfaces/booking-type";
import type { Booking } from "../../interfaces/booking";
import type { PopoverAnchor } from "../../interfaces/popover-state";
import { CompactBookingBlock } from "../../components/CompactBookingBlock";
import { cn } from "../../utils/cn";

function getTypeConfig({
  booking,
  bookingTypes,
}: {
  readonly booking: Booking;
  readonly bookingTypes: Readonly<Record<string, BookingTypeConfig>>;
}): BookingTypeConfig {
  return bookingTypes[booking.type] ?? bookingTypes.flight;
}

export function WeekCell({
  bookings,
  bookingTypes,
  maxVisible,
  resourceId,
  dateKey,
  isDropTarget,
  onBookingClick,
  onDragStart,
}: WeekCellProps) {
  const visibleBookings = bookings.slice(0, maxVisible);
  const overflowCount = bookings.length - maxVisible;

  function handleDragStart({
    e,
    booking,
  }: {
    readonly e: React.PointerEvent;
    readonly booking: Booking;
  }): void {
    if (!onDragStart) {
      return;
    }
    onDragStart({ e, booking, dateKey, resourceId });
  }

  function handleBookingClick({
    booking,
    anchor,
  }: {
    readonly booking: Booking;
    readonly anchor: PopoverAnchor;
  }): void {
    if (!onBookingClick) {
      return;
    }
    onBookingClick({ booking, anchor });
  }

  return (
    <div
      className={cn(
        "relative flex flex-col gap-0.5 overflow-hidden border-r border-gray-100 p-0.5",
        isDropTarget && "bg-blue-50 ring-2 ring-inset ring-blue-400",
      )}
    >
      {visibleBookings.map((booking) => (
        <CompactBookingBlock
          key={booking.id}
          booking={booking}
          typeConfig={getTypeConfig({ booking, bookingTypes })}
          onBookingClick={handleBookingClick}
          onDragStart={handleDragStart}
        />
      ))}
      {overflowCount > 0 && (
        <span className="mt-auto px-1 text-[9px] font-medium text-gray-400">
          +{overflowCount} more
        </span>
      )}
    </div>
  );
}
