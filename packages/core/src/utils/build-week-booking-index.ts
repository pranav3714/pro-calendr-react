import type { Booking } from "../interfaces/booking";
import { formatDateKey } from "./format-date-key";

interface BuildWeekBookingIndexParams {
  readonly bookings: readonly Booking[];
  readonly weekDays: readonly Date[];
}

function buildCellKey({
  dateKey,
  resourceId,
}: {
  readonly dateKey: string;
  readonly resourceId: string;
}): string {
  return `${dateKey}:${resourceId}`;
}

function addToIndex({
  index,
  dateKey,
  resourceId,
  booking,
}: {
  readonly index: Map<string, Booking[]>;
  readonly dateKey: string;
  readonly resourceId: string;
  readonly booking: Booking;
}): void {
  const key = buildCellKey({ dateKey, resourceId });
  const existing = index.get(key);
  if (existing) {
    existing.push(booking);
    return;
  }
  index.set(key, [booking]);
}

export function buildWeekBookingIndex({
  bookings,
  weekDays,
}: BuildWeekBookingIndexParams): Map<string, Booking[]> {
  const validDateKeys = new Set(weekDays.map((day) => formatDateKey({ date: day })));
  const index = new Map<string, Booking[]>();

  for (const booking of bookings) {
    if (!booking.date) {
      continue;
    }

    if (!validDateKeys.has(booking.date)) {
      continue;
    }

    addToIndex({ index, dateKey: booking.date, resourceId: booking.resourceId, booking });

    if (!booking.linkedResourceIds) {
      continue;
    }

    for (const linkedId of booking.linkedResourceIds) {
      addToIndex({ index, dateKey: booking.date, resourceId: linkedId, booking });
    }
  }

  return index;
}
