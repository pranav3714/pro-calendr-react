import { useMemo } from "react";
import type { Booking } from "../interfaces/booking";
import { buildWeekBookingIndex } from "../utils/build-week-booking-index";

interface UseWeekBookingIndexParams {
  readonly bookings: readonly Booking[];
  readonly weekDays: readonly Date[];
}

export function useWeekBookingIndex({
  bookings,
  weekDays,
}: UseWeekBookingIndexParams): ReadonlyMap<string, readonly Booking[]> {
  return useMemo(() => buildWeekBookingIndex({ bookings, weekDays }), [bookings, weekDays]);
}
