import type { Booking } from "./booking";
import type { GroupPosition, RowData } from "./row-data";
import type { LaneResult } from "./lane-result";

export interface TimelineLayoutResult {
  readonly timelineWidth: number;
  readonly hours: readonly number[];
  readonly rows: readonly RowData[];
  readonly groupPositions: readonly GroupPosition[];
  readonly totalHeight: number;
  readonly laneDataByResource: ReadonlyMap<string, LaneResult>;
  readonly bookingsByResource: ReadonlyMap<string, readonly Booking[]>;
}
