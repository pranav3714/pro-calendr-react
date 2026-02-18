import type { VirtualItem } from "@tanstack/react-virtual";
import type { Booking } from "./booking";
import type { BookingTypeConfig } from "./booking-type";
import type { GridBackgroundResult } from "./grid-background-params";
import type { LaneResult } from "./lane-result";
import type { LayoutConfig } from "./layout-config";
import type { PopoverAnchor } from "./popover-state";
import type { RowData } from "./row-data";
import type { ResizeEdge } from "./resize-state";
import type { VirtualItemData } from "./virtual-item-data";
import type { BookingDropInfo, BookingResizeInfo, SlotSelectInfo } from "./schedule-calendar-props";
import type { SlotSelectionState } from "./interaction-hook-params";

export interface DayViewProps {
  readonly bookings: readonly Booking[];
  readonly resourceGroups: readonly import("./resource").ResourceGroup[];
  readonly layoutConfig: LayoutConfig;
  readonly bookingTypes: Readonly<Record<string, BookingTypeConfig>>;
  readonly onBookingClick?: (params: {
    readonly booking: Booking;
    readonly anchor: PopoverAnchor;
  }) => void;
  readonly onBookingDrop?: (params: { readonly info: BookingDropInfo }) => void;
  readonly onBookingResize?: (params: { readonly info: BookingResizeInfo }) => void;
  readonly onBookingDelete?: (params: { readonly bookingId: string }) => void;
  readonly onBookingDuplicate?: (params: { readonly bookingId: string }) => void;
  readonly onBookingEdit?: (params: { readonly bookingId: string }) => void;
  readonly onSlotSelect?: (params: { readonly info: SlotSelectInfo }) => void;
}

export interface TimeHeaderProps {
  readonly hours: readonly number[];
  readonly timelineWidth: number;
  readonly sidebarWidth: number;
  readonly hourWidth: number;
  readonly dayStartHour: number;
  readonly timeHeaderHeight: number;
}

export interface TimeGridProps {
  readonly hours: readonly number[];
  readonly timelineWidth: number;
  readonly totalSize: number;
  readonly dayStartHour: number;
  readonly hourWidth: number;
  readonly rowHeight: number;
  readonly scrollMargin: number;
  readonly bookingsByResource: ReadonlyMap<string, readonly Booking[]>;
  readonly laneDataByResource: ReadonlyMap<string, LaneResult>;
  readonly virtualItems: readonly VirtualItem[];
  readonly items: readonly VirtualItemData[];
  readonly bookingTypes: Readonly<Record<string, BookingTypeConfig>>;
  readonly currentTimeMinutes: number | null;
  readonly gridBackground: GridBackgroundResult;
  readonly onBookingClick?: (params: {
    readonly booking: Booking;
    readonly anchor: PopoverAnchor;
  }) => void;
  readonly rows?: readonly RowData[];
  readonly layoutConfig?: LayoutConfig;
  readonly slotSelection?: SlotSelectionState | null;
  readonly onDragStart?: (params: {
    readonly e: React.PointerEvent;
    readonly booking: Booking;
  }) => void;
  readonly onResizeStart?: (params: {
    readonly e: React.PointerEvent;
    readonly booking: Booking;
    readonly edge: ResizeEdge;
  }) => void;
  readonly onGridPointerDown?: (params: { readonly e: React.PointerEvent }) => void;
}
