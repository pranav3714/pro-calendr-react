import type { Booking } from "./booking";
import type { BookingTypeConfig } from "./booking-type";

export interface TypeCountPill {
  readonly type: string;
  readonly label: string;
  readonly count: number;
  readonly dotClass: string;
  readonly badgeClass: string;
  readonly ringClass: string;
  readonly isActive: boolean;
}

export interface BookingStatsResult {
  readonly totalCount: number;
  readonly pills: readonly TypeCountPill[];
}

export interface StatsBarProps {
  readonly bookings: readonly Booking[];
  readonly bookingTypes: Readonly<Record<string, BookingTypeConfig>>;
}

export interface BuildBookingStatsParams {
  readonly bookings: readonly Booking[];
  readonly bookingTypes: Readonly<Record<string, BookingTypeConfig>>;
  readonly activeTypeFilter: string | null;
}
