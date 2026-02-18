import type { VirtualItem } from "@tanstack/react-virtual";
import type { Booking } from "./booking";
import type { BookingTypeConfig } from "./booking-type";
import type { GridBackgroundResult } from "./grid-background-params";
import type { LaneResult } from "./lane-result";
import type { LayoutConfig } from "./layout-config";
import type { PopoverAnchor } from "./popover-state";
import type { Resource } from "./resource";
import type { VirtualItemData } from "./virtual-item-data";

export interface DayViewProps {
  readonly bookings: readonly Booking[];
  readonly resourceGroups: readonly import("./resource").ResourceGroup[];
  readonly layoutConfig: LayoutConfig;
  readonly bookingTypes: Readonly<Record<string, BookingTypeConfig>>;
  readonly onBookingClick?: (params: {
    readonly booking: Booking;
    readonly anchor: PopoverAnchor;
  }) => void;
}

export interface TimeHeaderProps {
  readonly hours: readonly number[];
  readonly timelineWidth: number;
  readonly sidebarWidth: number;
  readonly hourWidth: number;
  readonly dayStartHour: number;
}

export interface TimeGridProps {
  readonly hours: readonly number[];
  readonly timelineWidth: number;
  readonly totalSize: number;
  readonly dayStartHour: number;
  readonly hourWidth: number;
  readonly rowHeight: number;
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
}

export interface ResourceSidebarProps {
  readonly sidebarWidth: number;
  readonly totalSize: number;
  readonly virtualItems: readonly VirtualItem[];
  readonly items: readonly VirtualItemData[];
  readonly groupHeaderHeight: number;
}

export interface ResourceGroupHeaderProps {
  readonly groupId: string;
  readonly label: string;
  readonly icon?: string;
  readonly resourceCount: number;
  readonly isCollapsed: boolean;
  readonly height: number;
}

export interface ResourceRowProps {
  readonly resource: Resource;
  readonly rowHeight: number;
}
