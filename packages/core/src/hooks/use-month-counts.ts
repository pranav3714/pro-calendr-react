import { useMemo } from "react";
import type { Booking } from "../interfaces/booking";
import type { MonthDayCounts } from "../interfaces/month-view-props";
import { buildMonthCounts } from "../utils/build-month-counts";

interface UseMonthCountsParams {
  readonly bookings: readonly Booking[];
  readonly monthDays: readonly Date[];
}

export function useMonthCounts({
  bookings,
  monthDays,
}: UseMonthCountsParams): ReadonlyMap<string, MonthDayCounts> {
  return useMemo(() => buildMonthCounts({ bookings, monthDays }), [bookings, monthDays]);
}
