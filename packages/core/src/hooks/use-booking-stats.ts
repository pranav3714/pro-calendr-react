import { useMemo } from "react";
import type { StatsBarProps } from "../interfaces/stats-bar-props";
import type { BookingStatsResult } from "../interfaces/stats-bar-props";
import { buildBookingStats } from "../utils/build-booking-stats";
import { useScheduleStore } from "./use-schedule-store";

export function useBookingStats({ bookings, bookingTypes }: StatsBarProps): BookingStatsResult {
  const activeTypeFilter = useScheduleStore({
    selector: (s) => s.activeTypeFilter,
  });

  return useMemo(
    () =>
      buildBookingStats({
        bookings,
        bookingTypes,
        activeTypeFilter,
      }),
    [bookings, bookingTypes, activeTypeFilter],
  );
}
