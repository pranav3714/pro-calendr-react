import type { Booking } from "./booking";
import type { BookingTypeConfig } from "./booking-type";
import type { LayoutConfig } from "./layout-config";
import type { PopoverAnchor } from "./popover-state";
import type { RowData } from "./row-data";
import type { LaneResult } from "./lane-result";
import type { SlotSelectionState } from "./interaction-hook-params";

export interface DragGhostProps {
  readonly bookings: readonly Booking[];
  readonly bookingTypes: Readonly<Record<string, BookingTypeConfig>>;
  readonly layoutConfig: LayoutConfig;
  readonly rows: readonly RowData[];
  readonly laneDataByResource: ReadonlyMap<string, LaneResult>;
}

export interface ResizeGhostProps {
  readonly bookings: readonly Booking[];
  readonly bookingTypes: Readonly<Record<string, BookingTypeConfig>>;
  readonly layoutConfig: LayoutConfig;
  readonly rows: readonly RowData[];
  readonly laneDataByResource: ReadonlyMap<string, LaneResult>;
}

export interface TimeTooltipProps {
  readonly layoutConfig: LayoutConfig;
}

export interface BookingPopoverProps {
  readonly booking: Booking;
  readonly typeConfig: BookingTypeConfig;
  readonly anchor: PopoverAnchor;
  readonly onClose: () => void;
  readonly onEdit?: () => void;
  readonly onDuplicate?: () => void;
  readonly onDelete?: () => void;
}

export interface SelectionOverlayProps {
  readonly slotSelection: SlotSelectionState;
  readonly layoutConfig: LayoutConfig;
  readonly rows: readonly RowData[];
}
