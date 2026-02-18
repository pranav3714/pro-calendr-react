import { describe, it, expect } from "vitest";
import type { RowData, GroupPosition } from "../../interfaces/row-data";
import type { ResourceGroup } from "../../interfaces/resource";
import { buildVirtualItems } from "../build-virtual-items";

const GROUPS: ResourceGroup[] = [
  {
    id: "aircraft",
    label: "Aircraft",
    icon: "plane",
    resources: [
      { id: "ac-1", title: "CS-UMH", groupId: "aircraft" },
      { id: "ac-2", title: "CS-UMG", groupId: "aircraft" },
    ],
  },
  {
    id: "instructors",
    label: "Instructors",
    resources: [{ id: "inst-1", title: "Jose Silva", groupId: "instructors" }],
  },
];

const GROUP_HEADER_HEIGHT = 36;
const ROW_HEIGHT = 56;

function makeRowsAndPositions(params: { collapsedGroupIds: Set<string> }): {
  rows: RowData[];
  groupPositions: GroupPosition[];
} {
  const rows: RowData[] = [];
  const groupPositions: GroupPosition[] = [];
  let y = 0;

  for (const group of GROUPS) {
    groupPositions.push({ groupId: group.id, label: group.label, y });
    y += GROUP_HEADER_HEIGHT;

    if (params.collapsedGroupIds.has(group.id)) {
      continue;
    }

    for (const resource of group.resources) {
      rows.push({
        resource,
        groupId: group.id,
        y,
        rowHeight: ROW_HEIGHT,
        laneCount: 1,
      });
      y += ROW_HEIGHT;
    }
  }

  return { rows, groupPositions };
}

describe("buildVirtualItems", () => {
  it("interleaves group headers and resource rows in correct order", () => {
    const { rows, groupPositions } = makeRowsAndPositions({
      collapsedGroupIds: new Set(),
    });

    const items = buildVirtualItems({
      rows,
      groupPositions,
      resourceGroups: GROUPS,
      collapsedGroupIds: new Set(),
      groupHeaderHeight: GROUP_HEADER_HEIGHT,
    });

    expect(items).toHaveLength(5);
    expect(items[0].kind).toBe("group-header");
    expect(items[1].kind).toBe("resource-row");
    expect(items[2].kind).toBe("resource-row");
    expect(items[3].kind).toBe("group-header");
    expect(items[4].kind).toBe("resource-row");
  });

  it("sets correct groupId on all items", () => {
    const { rows, groupPositions } = makeRowsAndPositions({
      collapsedGroupIds: new Set(),
    });

    const items = buildVirtualItems({
      rows,
      groupPositions,
      resourceGroups: GROUPS,
      collapsedGroupIds: new Set(),
      groupHeaderHeight: GROUP_HEADER_HEIGHT,
    });

    expect(items[0].groupId).toBe("aircraft");
    expect(items[1].groupId).toBe("aircraft");
    expect(items[2].groupId).toBe("aircraft");
    expect(items[3].groupId).toBe("instructors");
    expect(items[4].groupId).toBe("instructors");
  });

  it("skips resource rows for collapsed groups", () => {
    const collapsedGroupIds = new Set(["aircraft"]);
    const { rows, groupPositions } = makeRowsAndPositions({ collapsedGroupIds });

    const items = buildVirtualItems({
      rows,
      groupPositions,
      resourceGroups: GROUPS,
      collapsedGroupIds,
      groupHeaderHeight: GROUP_HEADER_HEIGHT,
    });

    expect(items).toHaveLength(3);
    expect(items[0].kind).toBe("group-header");
    expect(items[0].groupId).toBe("aircraft");
    expect(items[1].kind).toBe("group-header");
    expect(items[1].groupId).toBe("instructors");
    expect(items[2].kind).toBe("resource-row");
  });

  it("populates group header metadata correctly", () => {
    const { rows, groupPositions } = makeRowsAndPositions({
      collapsedGroupIds: new Set(),
    });

    const items = buildVirtualItems({
      rows,
      groupPositions,
      resourceGroups: GROUPS,
      collapsedGroupIds: new Set(),
      groupHeaderHeight: GROUP_HEADER_HEIGHT,
    });

    const header = items[0];
    if (header.kind !== "group-header") {
      throw new Error("Expected group-header");
    }
    expect(header.label).toBe("Aircraft");
    expect(header.icon).toBe("plane");
    expect(header.resourceCount).toBe(2);
    expect(header.isCollapsed).toBe(false);
    expect(header.height).toBe(GROUP_HEADER_HEIGHT);
    expect(header.y).toBe(0);
  });

  it("preserves resource row fields from RowData", () => {
    const { rows, groupPositions } = makeRowsAndPositions({
      collapsedGroupIds: new Set(),
    });

    const items = buildVirtualItems({
      rows,
      groupPositions,
      resourceGroups: GROUPS,
      collapsedGroupIds: new Set(),
      groupHeaderHeight: GROUP_HEADER_HEIGHT,
    });

    const row = items[1];
    if (row.kind !== "resource-row") {
      throw new Error("Expected resource-row");
    }
    expect(row.resource.id).toBe("ac-1");
    expect(row.resource.title).toBe("CS-UMH");
    expect(row.rowHeight).toBe(ROW_HEIGHT);
    expect(row.laneCount).toBe(1);
    expect(row.y).toBe(GROUP_HEADER_HEIGHT);
  });

  it("handles empty resource groups", () => {
    const items = buildVirtualItems({
      rows: [],
      groupPositions: [],
      resourceGroups: [],
      collapsedGroupIds: new Set(),
      groupHeaderHeight: GROUP_HEADER_HEIGHT,
    });

    expect(items).toHaveLength(0);
  });

  it("completes in under 5ms for 500 resources across 10 groups", () => {
    const largeGroups: ResourceGroup[] = [];
    const largeRows: RowData[] = [];
    const largePositions: GroupPosition[] = [];
    let y = 0;

    for (let g = 0; g < 10; g++) {
      const groupId = `group-${String(g)}`;
      const resources = [];
      largePositions.push({ groupId, label: `Group ${String(g)}`, y });
      y += GROUP_HEADER_HEIGHT;

      for (let r = 0; r < 50; r++) {
        const resource = {
          id: `res-${String(g)}-${String(r)}`,
          title: `Resource ${String(r)}`,
          groupId,
        };
        resources.push(resource);
        largeRows.push({
          resource,
          groupId,
          y,
          rowHeight: ROW_HEIGHT,
          laneCount: 1,
        });
        y += ROW_HEIGHT;
      }

      largeGroups.push({ id: groupId, label: `Group ${String(g)}`, resources });
    }

    const start = performance.now();
    const items = buildVirtualItems({
      rows: largeRows,
      groupPositions: largePositions,
      resourceGroups: largeGroups,
      collapsedGroupIds: new Set(),
      groupHeaderHeight: GROUP_HEADER_HEIGHT,
    });
    const elapsed = performance.now() - start;

    expect(items).toHaveLength(510);
    expect(elapsed).toBeLessThan(5);
  });
});
