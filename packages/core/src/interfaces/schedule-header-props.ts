import type { BookingTypeConfig } from "./booking-type";
import type { ViewMode } from "./view-mode";

export interface DateNavigationProps {
  readonly viewMode: ViewMode;
  readonly currentDate: Date;
  readonly dateLabel: string;
  readonly onPrev: () => void;
  readonly onNext: () => void;
  readonly onToday: () => void;
}

export interface ViewModeToggleProps {
  readonly onViewModeChange: (params: { readonly mode: ViewMode }) => void;
}

export interface FilterDropdownProps {
  readonly bookingTypes: Readonly<Record<string, BookingTypeConfig>>;
}

export interface ScheduleHeaderProps {
  readonly bookingTypes: Readonly<Record<string, BookingTypeConfig>>;
  readonly viewMode: ViewMode;
  readonly currentDate: Date;
  readonly dateLabel: string;
  readonly onPrev: () => void;
  readonly onNext: () => void;
  readonly onToday: () => void;
  readonly onViewModeChange: (params: { readonly mode: ViewMode }) => void;
  readonly onClose?: () => void;
  readonly title?: string;
}

export interface GetFilterButtonIndicatorParams {
  readonly hasActiveFilter: boolean;
}

export interface ResolveTypeItemStyleParams {
  readonly isActive: boolean;
}
