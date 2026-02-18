import { useMemo } from "react";
import type { Booking } from "../interfaces/booking";
import type { UseBookingIndexParams } from "../interfaces/booking-index-params";
import { groupBookingsByResource } from "../utils/group-bookings-by-resource";

export function useBookingIndex({
  bookings,
}: UseBookingIndexParams): ReadonlyMap<string, readonly Booking[]> {
  return useMemo(() => groupBookingsByResource({ bookings }), [bookings]);
}
