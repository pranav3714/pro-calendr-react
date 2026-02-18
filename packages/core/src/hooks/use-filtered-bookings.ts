import { useMemo } from "react";
import type { Booking } from "../interfaces/booking";
import type { UseFilteredBookingsParams } from "../interfaces/store-config";
import { useScheduleStore } from "./use-schedule-store";

export function useFilteredBookings({ bookings }: UseFilteredBookingsParams): readonly Booking[] {
  const activeTypeFilter = useScheduleStore({
    selector: (s) => s.activeTypeFilter,
  });

  return useMemo(() => {
    if (activeTypeFilter === null) {
      return bookings;
    }
    return bookings.filter((booking) => booking.type === activeTypeFilter);
  }, [bookings, activeTypeFilter]);
}
