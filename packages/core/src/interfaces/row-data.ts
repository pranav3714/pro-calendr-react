import type { Resource } from "./resource";

export interface RowData {
  readonly resource: Resource;
  readonly groupId: string;
  readonly y: number;
  readonly rowHeight: number;
  readonly laneCount: number;
}

export interface GroupPosition {
  readonly groupId: string;
  readonly label: string;
  readonly y: number;
}
