import type { Booking } from "./booking";
import type { RowData } from "./row-data";
import type { WeekBookingDropInfo } from "./week-view-props";

export interface WeekDragTarget {
  readonly resourceId: string;
  readonly dateKey: string;
}

export interface UseWeekCellDragParams {
  readonly rows: readonly RowData[];
  readonly scrollContainerRef: React.RefObject<HTMLElement | null>;
  readonly gridRef: React.RefObject<HTMLElement | null>;
  readonly sidebarWidth: number;
  readonly headerHeight: number;
  readonly weekDays: readonly Date[];
  readonly dragThreshold: number;
  readonly onBookingDrop?: (params: { readonly info: WeekBookingDropInfo }) => void;
}

export interface UseWeekCellDragResult {
  readonly handleBookingPointerDown: (params: {
    readonly e: React.PointerEvent;
    readonly booking: Booking;
    readonly dateKey: string;
    readonly resourceId: string;
  }) => void;
  readonly isDragging: boolean;
  readonly draggedBookingId: string | null;
  readonly dropTarget: WeekDragTarget | null;
  readonly ghostPosition: { readonly x: number; readonly y: number } | null;
  readonly draggedBooking: Booking | null;
}
