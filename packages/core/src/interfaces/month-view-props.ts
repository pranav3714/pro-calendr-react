import type { Booking } from "./booking";
import type { BookingTypeConfig } from "./booking-type";

export interface MonthDayCounts {
  readonly total: number;
  readonly byType: Readonly<Record<string, number>>;
}

export interface MonthTypeIndicator {
  readonly type: string;
  readonly label: string;
  readonly count: number;
  readonly dotClass: string;
}

export interface MonthViewProps {
  readonly bookings: readonly Booking[];
  readonly bookingTypes: Readonly<Record<string, BookingTypeConfig>>;
  readonly currentDate: Date;
  readonly onDayClick?: (params: { readonly date: Date }) => void;
}

export interface MonthDayCellProps {
  readonly date: Date;
  readonly isCurrentMonth: boolean;
  readonly isToday: boolean;
  readonly totalCount: number;
  readonly typeBreakdown: readonly MonthTypeIndicator[];
  readonly overflowCount: number;
  readonly onDayClick?: (params: { readonly date: Date }) => void;
}

export interface MonthCalendarGridProps {
  readonly monthDays: readonly Date[];
  readonly currentDate: Date;
  readonly today: Date;
  readonly counts: ReadonlyMap<string, MonthDayCounts>;
  readonly bookingTypes: Readonly<Record<string, BookingTypeConfig>>;
  readonly onDayClick?: (params: { readonly date: Date }) => void;
}
