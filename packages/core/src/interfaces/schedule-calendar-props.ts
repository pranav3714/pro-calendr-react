import type { ReactNode } from "react";
import type { Booking } from "./booking";
import type { BookingTypeConfig } from "./booking-type";
import type { ResourceGroup } from "./resource";
import type { LayoutConfig } from "./layout-config";
import type { ViewMode } from "./view-mode";
import type { PopoverAnchor } from "./popover-state";

export interface BookingClickInfo {
  readonly booking: Booking;
  readonly anchor: PopoverAnchor;
}

export interface BookingDropInfo {
  readonly bookingId: string;
  readonly originalResourceId: string;
  readonly originalStartMinutes: number;
  readonly originalEndMinutes: number;
  readonly newResourceId: string;
  readonly newStartMinutes: number;
  readonly newEndMinutes: number;
  readonly revert: () => void;
}

export interface BookingResizeInfo {
  readonly bookingId: string;
  readonly edge: "start" | "end";
  readonly originalStartMinutes: number;
  readonly originalEndMinutes: number;
  readonly newStartMinutes: number;
  readonly newEndMinutes: number;
  readonly revert: () => void;
}

export interface SlotSelectInfo {
  readonly startMinutes: number;
  readonly endMinutes: number;
  readonly resourceId: string;
  readonly date: Date;
}

export interface ScheduleCalendarProps {
  readonly bookings: readonly Booking[];
  readonly resourceGroups: readonly ResourceGroup[];
  readonly bookingTypes?: Readonly<Record<string, BookingTypeConfig>>;

  readonly defaultViewMode?: ViewMode;
  readonly defaultDate?: Date;
  readonly layoutConfig?: Partial<LayoutConfig>;

  readonly onBookingClick?: (params: { readonly info: BookingClickInfo }) => void;
  readonly onBookingDrop?: (params: { readonly info: BookingDropInfo }) => void;
  readonly onBookingResize?: (params: { readonly info: BookingResizeInfo }) => void;
  readonly onSlotSelect?: (params: { readonly info: SlotSelectInfo }) => void;
  readonly onDateChange?: (params: { readonly date: Date }) => void;
  readonly onViewModeChange?: (params: { readonly mode: ViewMode }) => void;
  readonly onBookingDelete?: (params: { readonly bookingId: string }) => void;
  readonly onBookingDuplicate?: (params: { readonly bookingId: string }) => void;
  readonly onBookingEdit?: (params: { readonly bookingId: string }) => void;

  readonly renderBookingContent?: (params: { readonly booking: Booking }) => ReactNode;
  readonly renderResourceLabel?: (params: {
    readonly resource: ResourceGroup["resources"][number];
  }) => ReactNode;
  readonly renderPopoverContent?: (params: { readonly booking: Booking }) => ReactNode;

  readonly className?: string;
  readonly darkMode?: boolean;
}
