import type { Booking } from "../interfaces/booking";
import type { MonthDayCounts } from "../interfaces/month-view-props";
import { formatDateKey } from "./format-date-key";

interface BuildMonthCountsParams {
  readonly bookings: readonly Booking[];
  readonly monthDays: readonly Date[];
}

function createEmptyCounts(): MonthDayCounts {
  return { total: 0, byType: {} };
}

export function buildMonthCounts({
  bookings,
  monthDays,
}: BuildMonthCountsParams): Map<string, MonthDayCounts> {
  const counts = new Map<string, MonthDayCounts>();

  for (const day of monthDays) {
    counts.set(formatDateKey({ date: day }), createEmptyCounts());
  }

  for (const booking of bookings) {
    if (!booking.date) {
      continue;
    }

    const existing = counts.get(booking.date);
    if (!existing) {
      continue;
    }

    const currentTypeCount = existing.byType[booking.type] ?? 0;
    counts.set(booking.date, {
      total: existing.total + 1,
      byType: { ...existing.byType, [booking.type]: currentTypeCount + 1 },
    });
  }

  return counts;
}
