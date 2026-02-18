import type {
  VirtualItemData,
  VirtualGroupHeader,
  VirtualResourceRow,
} from "../interfaces/virtual-item-data";
import type { RowData, GroupPosition } from "../interfaces/row-data";
import type { ResourceGroup } from "../interfaces/resource";

interface BuildVirtualItemsParams {
  readonly rows: readonly RowData[];
  readonly groupPositions: readonly GroupPosition[];
  readonly resourceGroups: readonly ResourceGroup[];
  readonly collapsedGroupIds: Set<string>;
  readonly groupHeaderHeight: number;
}

export function buildVirtualItems({
  rows,
  groupPositions,
  resourceGroups,
  collapsedGroupIds,
  groupHeaderHeight,
}: BuildVirtualItemsParams): VirtualItemData[] {
  const items: VirtualItemData[] = [];
  const groupMap = new Map<string, ResourceGroup>();

  for (const group of resourceGroups) {
    groupMap.set(group.id, group);
  }

  let rowIdx = 0;

  for (const gp of groupPositions) {
    const group = groupMap.get(gp.groupId);
    const isCollapsed = collapsedGroupIds.has(gp.groupId);

    const header: VirtualGroupHeader = {
      kind: "group-header",
      groupId: gp.groupId,
      label: gp.label,
      icon: group?.icon,
      resourceCount: group?.resources.length ?? 0,
      isCollapsed,
      height: groupHeaderHeight,
      y: gp.y,
    };
    items.push(header);

    while (rowIdx < rows.length && rows[rowIdx].groupId === gp.groupId) {
      const row = rows[rowIdx];
      const resourceRow: VirtualResourceRow = {
        kind: "resource-row",
        resource: row.resource,
        groupId: row.groupId,
        rowHeight: row.rowHeight,
        laneCount: row.laneCount,
        y: row.y,
      };
      items.push(resourceRow);
      rowIdx++;
    }
  }

  return items;
}
