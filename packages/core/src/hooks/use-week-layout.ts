import { useMemo } from "react";
import type { ResourceGroup } from "../interfaces/resource";
import type { RowData, GroupPosition } from "../interfaces/row-data";

interface UseWeekLayoutParams {
  readonly resourceGroups: readonly ResourceGroup[];
  readonly collapsedGroupIds: Set<string>;
  readonly rowHeight: number;
  readonly groupHeaderHeight: number;
}

interface WeekLayoutResult {
  readonly rows: RowData[];
  readonly groupPositions: GroupPosition[];
  readonly totalHeight: number;
}

export function useWeekLayout({
  resourceGroups,
  collapsedGroupIds,
  rowHeight,
  groupHeaderHeight,
}: UseWeekLayoutParams): WeekLayoutResult {
  return useMemo(() => {
    const rows: RowData[] = [];
    const groupPositions: GroupPosition[] = [];
    let currentY = 0;

    for (const group of resourceGroups) {
      groupPositions.push({
        groupId: group.id,
        label: group.label,
        y: currentY,
      });
      currentY += groupHeaderHeight;

      if (collapsedGroupIds.has(group.id)) {
        continue;
      }

      for (const resource of group.resources) {
        rows.push({
          resource,
          groupId: group.id,
          y: currentY,
          rowHeight,
          laneCount: 1,
        });
        currentY += rowHeight;
      }
    }

    return { rows, groupPositions, totalHeight: currentY };
  }, [resourceGroups, collapsedGroupIds, rowHeight, groupHeaderHeight]);
}
