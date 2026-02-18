import type { Booking } from "./booking";
import type { BookingTypeConfig } from "./booking-type";
import type { LayoutConfig } from "./layout-config";
import type { ResourceGroup } from "./resource";
import type { PopoverAnchor } from "./popover-state";

export interface WeekBookingDropInfo {
  readonly bookingId: string;
  readonly originalResourceId: string;
  readonly originalDate: string;
  readonly newResourceId: string;
  readonly newDate: string;
}

export interface WeekViewProps {
  readonly bookings: readonly Booking[];
  readonly resourceGroups: readonly ResourceGroup[];
  readonly layoutConfig: LayoutConfig;
  readonly bookingTypes: Readonly<Record<string, BookingTypeConfig>>;
  readonly onBookingClick?: (params: {
    readonly booking: Booking;
    readonly anchor: PopoverAnchor;
  }) => void;
  readonly onBookingDrop?: (params: { readonly info: WeekBookingDropInfo }) => void;
  readonly onBookingDelete?: (params: { readonly bookingId: string }) => void;
  readonly onBookingDuplicate?: (params: { readonly bookingId: string }) => void;
  readonly onBookingEdit?: (params: { readonly bookingId: string }) => void;
  readonly onDayClick?: (params: { readonly date: Date }) => void;
}

export interface WeekDayHeaderProps {
  readonly days: readonly Date[];
  readonly today: Date;
  readonly sidebarWidth: number;
}

export interface WeekCellProps {
  readonly bookings: readonly Booking[];
  readonly bookingTypes: Readonly<Record<string, BookingTypeConfig>>;
  readonly maxVisible: number;
  readonly resourceId: string;
  readonly dateKey: string;
  readonly isDropTarget: boolean;
  readonly onBookingClick?: (params: {
    readonly booking: Booking;
    readonly anchor: PopoverAnchor;
  }) => void;
  readonly onDragStart?: (params: {
    readonly e: React.PointerEvent;
    readonly booking: Booking;
    readonly dateKey: string;
    readonly resourceId: string;
  }) => void;
}

export interface CompactBookingBlockProps {
  readonly booking: Booking;
  readonly typeConfig: BookingTypeConfig;
  readonly onBookingClick?: (params: {
    readonly booking: Booking;
    readonly anchor: PopoverAnchor;
  }) => void;
  readonly onDragStart?: (params: {
    readonly e: React.PointerEvent;
    readonly booking: Booking;
  }) => void;
}
