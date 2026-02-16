import { useMemo } from "react";
import { useCalendarConfig, useCalendarStore } from "../components/CalendarContext";
import {
  buildResourceTree,
  type ResourceTree,
  type ResourceGroupNode,
} from "../utils/resource-utils";

export type { ResourceTree, ResourceGroupNode };

/**
 * Computes the resource tree from CalendarConfig and store state.
 *
 * Combines config.resources / config.resourceGroups with store-level
 * filteredResourceIds and collapsedGroupIds via buildResourceTree.
 *
 * Returns a stable ResourceTree (re-computed only when inputs change).
 */
export function useResources(): ResourceTree {
  const config = useCalendarConfig();
  const filteredResourceIds = useCalendarStore((s) => s.filteredResourceIds);
  const collapsedGroupIds = useCalendarStore((s) => s.collapsedGroupIds);

  return useMemo(
    () =>
      buildResourceTree(
        config.resources ?? [],
        config.resourceGroups ?? [],
        filteredResourceIds,
        collapsedGroupIds,
      ),
    [config.resources, config.resourceGroups, filteredResourceIds, collapsedGroupIds],
  );
}
