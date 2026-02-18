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

export interface DayColumnHeaderProps {
  readonly day: Date;
  readonly isToday: boolean;
}

export interface WeekResourceGridProps {
  readonly virtualItems: readonly import("@tanstack/react-virtual").VirtualItem[];
  readonly items: readonly import("./virtual-item-data").VirtualItemData[];
  readonly totalSize: number;
  readonly scrollMargin: number;
  readonly weekDays: readonly Date[];
  readonly dateKeys: readonly string[];
  readonly bookingIndex: ReadonlyMap<string, readonly Booking[]>;
  readonly bookingTypes: Readonly<Record<string, BookingTypeConfig>>;
  readonly dropTarget: import("./week-cell-drag-params").WeekDragTarget | null;
  readonly draggedBookingId: string | null;
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

export interface WeekRenderGroupHeaderParams {
  readonly virtualItem: import("@tanstack/react-virtual").VirtualItem;
  readonly scrollMargin: number;
  readonly itemData: import("./virtual-item-data").VirtualGroupHeader;
}

export interface WeekRenderResourceRowParams {
  readonly virtualItem: import("@tanstack/react-virtual").VirtualItem;
  readonly scrollMargin: number;
  readonly itemData: import("./virtual-item-data").VirtualResourceRow;
  readonly dateKeys: readonly string[];
  readonly bookingIndex: ReadonlyMap<string, readonly Booking[]>;
  readonly bookingTypes: Readonly<Record<string, BookingTypeConfig>>;
  readonly dropTarget: import("./week-cell-drag-params").WeekDragTarget | null;
  readonly draggedBookingId: string | null;
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

export interface ResolveTodayStyleParams {
  readonly isToday: boolean;
}
