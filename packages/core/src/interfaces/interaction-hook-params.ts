import type { RefObject } from "react";
import type { Booking } from "./booking";
import type { BookingDropInfo, BookingResizeInfo, SlotSelectInfo } from "./schedule-calendar-props";
import type { LayoutConfig } from "./layout-config";
import type { RowData } from "./row-data";
import type { PopoverAnchor } from "./popover-state";
import type { ResizeEdge } from "./resize-state";

export interface UseBookingDragParams {
  readonly layoutConfig: LayoutConfig;
  readonly rows: readonly RowData[];
  readonly scrollContainerRef: RefObject<HTMLElement | null>;
  readonly sidebarWidth: number;
  readonly timeHeaderHeight: number;
  readonly onBookingDrop?: (params: { readonly info: BookingDropInfo }) => void;
}

export interface UseBookingDragResult {
  readonly handleBookingPointerDown: (params: {
    readonly e: React.PointerEvent;
    readonly booking: Booking;
  }) => void;
  readonly isDragging: boolean;
}

export interface UseBookingResizeParams {
  readonly layoutConfig: LayoutConfig;
  readonly scrollContainerRef: RefObject<HTMLElement | null>;
  readonly sidebarWidth: number;
  readonly timeHeaderHeight: number;
  readonly onBookingResize?: (params: { readonly info: BookingResizeInfo }) => void;
}

export interface UseBookingResizeResult {
  readonly handleResizePointerDown: (params: {
    readonly e: React.PointerEvent;
    readonly booking: Booking;
    readonly edge: ResizeEdge;
  }) => void;
  readonly isResizing: boolean;
}

export interface UseBookingSelectionParams {
  readonly bookings: readonly Booking[];
  readonly bookingTypes: Readonly<Record<string, import("./booking-type").BookingTypeConfig>>;
  readonly onBookingClick?: (params: {
    readonly booking: Booking;
    readonly anchor: PopoverAnchor;
  }) => void;
  readonly onBookingDelete?: (params: { readonly bookingId: string }) => void;
  readonly onBookingDuplicate?: (params: { readonly bookingId: string }) => void;
  readonly onBookingEdit?: (params: { readonly bookingId: string }) => void;
}

export interface UseBookingSelectionResult {
  readonly handleBookingClick: (params: {
    readonly booking: Booking;
    readonly anchor: PopoverAnchor;
  }) => void;
  readonly selectedBooking: Booking | null;
  readonly selectedBookingTypeConfig: import("./booking-type").BookingTypeConfig | null;
  readonly popoverAnchor: PopoverAnchor | null;
  readonly dismissPopover: () => void;
  readonly onEdit: (() => void) | undefined;
  readonly onDuplicate: (() => void) | undefined;
  readonly onDelete: (() => void) | undefined;
}

export interface UseSlotSelectionParams {
  readonly layoutConfig: LayoutConfig;
  readonly rows: readonly RowData[];
  readonly scrollContainerRef: RefObject<HTMLElement | null>;
  readonly sidebarWidth: number;
  readonly timeHeaderHeight: number;
  readonly currentDate: Date;
  readonly onSlotSelect?: (params: { readonly info: SlotSelectInfo }) => void;
}

export interface SlotSelectionState {
  readonly startMinutes: number;
  readonly endMinutes: number;
  readonly resourceId: string;
}

export interface UseSlotSelectionResult {
  readonly handleGridPointerDown: (params: { readonly e: React.PointerEvent }) => void;
  readonly slotSelection: SlotSelectionState | null;
}
