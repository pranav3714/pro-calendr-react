import type { Resource } from "./resource";

export interface VirtualGroupHeader {
  readonly kind: "group-header";
  readonly groupId: string;
  readonly label: string;
  readonly icon?: string;
  readonly resourceCount: number;
  readonly isCollapsed: boolean;
  readonly height: number;
  readonly y: number;
}

export interface VirtualResourceRow {
  readonly kind: "resource-row";
  readonly resource: Resource;
  readonly groupId: string;
  readonly rowHeight: number;
  readonly laneCount: number;
  readonly y: number;
}

export type VirtualItemData = VirtualGroupHeader | VirtualResourceRow;
