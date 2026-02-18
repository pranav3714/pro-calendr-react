import type { VirtualItem } from "@tanstack/react-virtual";
import type { Booking } from "./booking";
import type { BookingTypeConfig } from "./booking-type";
import type { PopoverAnchor } from "./popover-state";
import type { Resource } from "./resource";
import type { ResizeEdge } from "./resize-state";
import type { VirtualItemData } from "./virtual-item-data";

export interface BookingBlockProps {
  readonly booking: Booking;
  readonly left: number;
  readonly width: number;
  readonly top: number;
  readonly height: number;
  readonly typeConfig: BookingTypeConfig;
  readonly isDragTarget?: boolean;
  readonly isResizeTarget?: boolean;
  readonly onClick?: (params: {
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

export interface ResourceAvatarProps {
  readonly groupId: string;
  readonly resourceName: string;
  readonly size?: "sm" | "md";
}

export interface ChevronIconProps {
  readonly isOpen: boolean;
}

export interface NowIndicatorProps {
  readonly positionX: number;
}

export interface GroupIconProps {
  readonly groupId: string;
}

export interface ResourceSidebarProps {
  readonly sidebarWidth: number;
  readonly totalSize: number;
  readonly scrollMargin: number;
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
