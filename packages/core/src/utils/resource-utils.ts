import type { CalendarResource, CalendarResourceGroup } from "../types";

export interface ResourceGroupNode {
  group: CalendarResourceGroup;
  resources: CalendarResource[];
  isCollapsed: boolean;
}

export interface ResourceTree {
  groups: ResourceGroupNode[];
  ungrouped: CalendarResource[];
}

function sortByOrder<T extends { order?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/**
 * Build a grouped, filtered, sorted resource tree from flat arrays.
 *
 * - If filteredIds is non-empty, only resources whose id is in filteredIds are included.
 * - Resources with a groupId matching a group are placed under that group node.
 * - Resources with no groupId, or a groupId not matching any group, go to ungrouped.
 * - Groups and resources within groups are sorted by `order` (defaulting to 0).
 * - collapsedGroupIds determines which group nodes have isCollapsed=true.
 */
export function buildResourceTree(
  resources: CalendarResource[],
  groups: CalendarResourceGroup[],
  filteredIds: string[],
  collapsedGroupIds: string[],
): ResourceTree {
  const filteredSet = new Set(filteredIds);
  const collapsedSet = new Set(collapsedGroupIds);
  const groupMap = new Map(groups.map((g) => [g.id, g]));

  // Apply filtering
  const activeResources =
    filteredSet.size > 0 ? resources.filter((r) => filteredSet.has(r.id)) : resources;

  // Partition into grouped and ungrouped
  const groupBuckets = new Map<string, CalendarResource[]>();
  const ungrouped: CalendarResource[] = [];

  for (const resource of activeResources) {
    if (resource.groupId && groupMap.has(resource.groupId)) {
      const bucket = groupBuckets.get(resource.groupId);
      if (bucket) {
        bucket.push(resource);
      } else {
        groupBuckets.set(resource.groupId, [resource]);
      }
    } else {
      ungrouped.push(resource);
    }
  }

  // Build group nodes — iterate sorted groups so output respects group order
  const sortedGroups = sortByOrder(groups);
  const groupNodes: ResourceGroupNode[] = [];
  for (const group of sortedGroups) {
    const bucket = groupBuckets.get(group.id);
    if (bucket) {
      groupNodes.push({
        group,
        resources: sortByOrder(bucket),
        isCollapsed: collapsedSet.has(group.id),
      });
    }
  }

  return {
    groups: groupNodes,
    ungrouped: sortByOrder(ungrouped),
  };
}
