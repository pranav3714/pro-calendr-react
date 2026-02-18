import type {
  BuildBookingStatsParams,
  BookingStatsResult,
  TypeCountPill,
} from "../interfaces/stats-bar-props";

export function buildBookingStats({
  bookings,
  bookingTypes,
  activeTypeFilter,
}: BuildBookingStatsParams): BookingStatsResult {
  const countsByType = new Map<string, number>();

  for (const booking of bookings) {
    const current = countsByType.get(booking.type) ?? 0;
    countsByType.set(booking.type, current + 1);
  }

  const pills: TypeCountPill[] = [];

  for (const [type, config] of Object.entries(bookingTypes)) {
    const count = countsByType.get(type) ?? 0;

    if (count === 0) {
      continue;
    }

    pills.push({
      type,
      label: config.label,
      count,
      dotClass: config.dot,
      badgeClass: config.badge,
      ringClass: config.ring,
      isActive: activeTypeFilter === type,
    });
  }

  return {
    totalCount: bookings.length,
    pills,
  };
}
