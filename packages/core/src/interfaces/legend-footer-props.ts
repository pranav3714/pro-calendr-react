import type { BookingTypeConfig } from "./booking-type";

export interface LegendFooterProps {
  readonly bookingTypes: Readonly<Record<string, BookingTypeConfig>>;
}
