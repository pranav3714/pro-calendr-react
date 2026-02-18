import type { ReactNode } from "react";
import type { ViewMode } from "./view-mode";
import type { Booking } from "./booking";

export interface CreateScheduleStoreConfig {
  readonly defaultViewMode?: ViewMode;
  readonly defaultDate?: Date;
}

export interface ScheduleProviderProps {
  readonly children: ReactNode;
  readonly defaultViewMode?: ViewMode;
  readonly defaultDate?: Date;
}

export interface UseFilteredBookingsParams {
  readonly bookings: readonly Booking[];
}
