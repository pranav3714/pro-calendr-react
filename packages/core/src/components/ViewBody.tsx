import { useCallback } from "react";
import type { Booking } from "../interfaces/booking";
import type { BookingTypeConfig } from "../interfaces/booking-type";
import type { LayoutConfig } from "../interfaces/layout-config";
import type { PopoverAnchor } from "../interfaces/popover-state";
import type { ResourceGroup } from "../interfaces/resource";
import type {
  BookingClickInfo,
  BookingDropInfo,
  BookingResizeInfo,
  SlotSelectInfo,
} from "../interfaces/schedule-calendar-props";
import type { WeekBookingDropInfo } from "../interfaces/week-view-props";
import { useScheduleStore } from "../hooks/use-schedule-store";
import { DayView } from "../views/day/DayView";
import { WeekView } from "../views/week/WeekView";
import { MonthView } from "../views/month/MonthView";

interface ViewBodyProps {
  readonly bookings: readonly Booking[];
  readonly resourceGroups: readonly ResourceGroup[];
  readonly layoutConfig: LayoutConfig;
  readonly bookingTypes: Readonly<Record<string, BookingTypeConfig>>;
  readonly onBookingClick?: (params: { readonly info: BookingClickInfo }) => void;
  readonly onBookingDrop?: (params: { readonly info: BookingDropInfo }) => void;
  readonly onBookingResize?: (params: { readonly info: BookingResizeInfo }) => void;
  readonly onSlotSelect?: (params: { readonly info: SlotSelectInfo }) => void;
  readonly onBookingDelete?: (params: { readonly bookingId: string }) => void;
  readonly onBookingDuplicate?: (params: { readonly bookingId: string }) => void;
  readonly onBookingEdit?: (params: { readonly bookingId: string }) => void;
  readonly onWeekBookingDrop?: (params: { readonly info: WeekBookingDropInfo }) => void;
  readonly onDayClick?: (params: { readonly date: Date }) => void;
}

function useBookingClickAdapter({
  onBookingClick,
}: {
  readonly onBookingClick?: (params: { readonly info: BookingClickInfo }) => void;
}) {
  return useCallback(
    ({ booking, anchor }: { readonly booking: Booking; readonly anchor: PopoverAnchor }) => {
      onBookingClick?.({ info: { booking, anchor } });
    },
    [onBookingClick],
  );
}

export function ViewBody({
  bookings,
  resourceGroups,
  layoutConfig,
  bookingTypes,
  onBookingClick,
  onBookingDrop,
  onBookingResize,
  onSlotSelect,
  onBookingDelete,
  onBookingDuplicate,
  onBookingEdit,
  onWeekBookingDrop,
  onDayClick,
}: ViewBodyProps) {
  const viewMode = useScheduleStore({ selector: (s) => s.viewMode });
  const currentDate = useScheduleStore({ selector: (s) => s.currentDate });

  const handleBookingClick = useBookingClickAdapter({ onBookingClick });

  if (viewMode === "day") {
    return (
      <DayView
        bookings={bookings}
        resourceGroups={resourceGroups}
        layoutConfig={layoutConfig}
        bookingTypes={bookingTypes}
        onBookingClick={handleBookingClick}
        onBookingDrop={onBookingDrop}
        onBookingResize={onBookingResize}
        onSlotSelect={onSlotSelect}
        onBookingDelete={onBookingDelete}
        onBookingDuplicate={onBookingDuplicate}
        onBookingEdit={onBookingEdit}
      />
    );
  }

  if (viewMode === "week") {
    return (
      <WeekView
        bookings={bookings}
        resourceGroups={resourceGroups}
        layoutConfig={layoutConfig}
        bookingTypes={bookingTypes}
        onBookingClick={handleBookingClick}
        onBookingDrop={onWeekBookingDrop}
        onBookingDelete={onBookingDelete}
        onBookingDuplicate={onBookingDuplicate}
        onBookingEdit={onBookingEdit}
        onDayClick={onDayClick}
      />
    );
  }

  return (
    <MonthView
      bookings={bookings}
      bookingTypes={bookingTypes}
      currentDate={currentDate}
      onDayClick={onDayClick}
    />
  );
}
