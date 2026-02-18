import type { Booking } from "./booking";
import type { BookingTypeConfig } from "./booking-type";
import type { LaneResult } from "./lane-result";
import type { PopoverAnchor } from "./popover-state";
import type { ResizeEdge } from "./resize-state";
import type { TimeGridProps } from "./day-view-props";
import type { VirtualItemData, VirtualResourceRow } from "./virtual-item-data";

export interface ComputeBlockPositionParams {
  readonly booking: Booking;
  readonly laneIndex: number;
  readonly rowHeight: number;
  readonly timelineWidth: number;
  readonly config: { readonly dayStartHour: number; readonly hourWidth: number };
}

export interface BlockPosition {
  readonly left: number;
  readonly width: number;
  readonly top: number;
  readonly height: number;
}

export interface ResourceRowBlocksProps {
  readonly bookings: readonly Booking[];
  readonly laneData: LaneResult | undefined;
  readonly rowHeight: number;
  readonly timelineWidth: number;
  readonly config: { readonly dayStartHour: number; readonly hourWidth: number };
  readonly bookingTypes: Readonly<Record<string, BookingTypeConfig>>;
  readonly onBookingClick?: (params: {
    readonly booking: Booking;
    readonly anchor: PopoverAnchor;
  }) => void;
  readonly onDragStart?: (params: {
    readonly e: React.PointerEvent;
    readonly booking: Booking;
  }) => void;
  readonly onResizeStart?: (params: {
    readonly e: React.PointerEvent;
    readonly booking: Booking;
    readonly edge: ResizeEdge;
  }) => void;
}

export interface RenderVirtualItemParams {
  readonly itemData: VirtualItemData;
  readonly bookingsByResource: ReadonlyMap<string, readonly Booking[]>;
  readonly laneDataByResource: ReadonlyMap<string, LaneResult>;
  readonly timelineWidth: number;
  readonly rowHeight: number;
  readonly config: { readonly dayStartHour: number; readonly hourWidth: number };
  readonly bookingTypes: Readonly<Record<string, BookingTypeConfig>>;
  readonly onBookingClick?: (params: {
    readonly booking: Booking;
    readonly anchor: PopoverAnchor;
  }) => void;
  readonly onDragStart?: TimeGridProps["onDragStart"];
  readonly onResizeStart?: TimeGridProps["onResizeStart"];
}

export interface RenderResourceRowParams {
  readonly itemData: VirtualResourceRow;
  readonly bookingsByResource: ReadonlyMap<string, readonly Booking[]>;
  readonly laneDataByResource: ReadonlyMap<string, LaneResult>;
  readonly timelineWidth: number;
  readonly config: { readonly dayStartHour: number; readonly hourWidth: number };
  readonly bookingTypes: Readonly<Record<string, BookingTypeConfig>>;
  readonly onBookingClick?: (params: {
    readonly booking: Booking;
    readonly anchor: PopoverAnchor;
  }) => void;
  readonly onDragStart?: TimeGridProps["onDragStart"];
  readonly onResizeStart?: TimeGridProps["onResizeStart"];
}

export interface ResolveLaneDataParams {
  readonly laneData: LaneResult | undefined;
}
