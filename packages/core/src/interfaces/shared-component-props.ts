import type { Booking } from "./booking";
import type { BookingTypeConfig } from "./booking-type";
import type { PopoverAnchor } from "./popover-state";

export interface BookingBlockProps {
  readonly booking: Booking;
  readonly left: number;
  readonly width: number;
  readonly top: number;
  readonly height: number;
  readonly typeConfig: BookingTypeConfig;
  readonly onClick?: (params: {
    readonly booking: Booking;
    readonly anchor: PopoverAnchor;
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
