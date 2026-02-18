import type { RefObject } from "react";
import type { Booking } from "./booking";
import type { LayoutConfig } from "./layout-config";
import type { ResourceGroup } from "./resource";

export interface UseTimelineLayoutParams {
  readonly bookings: readonly Booking[];
  readonly resourceGroups: readonly ResourceGroup[];
  readonly collapsedGroupIds: Set<string>;
  readonly layoutConfig: LayoutConfig;
}

export interface UseCurrentTimeParams {
  readonly config: Pick<LayoutConfig, "dayStartHour" | "dayEndHour">;
}

export interface UseSyncScrollParams {
  readonly sourceRef: RefObject<HTMLElement | null>;
  readonly targetRef: RefObject<HTMLElement | null>;
}
