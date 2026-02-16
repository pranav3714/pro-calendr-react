import { describe, it, expect } from "vitest";
import { buildResourceTree } from "../resource-utils";
import type { CalendarResource, CalendarResourceGroup } from "../../types";

function makeResource(overrides: Partial<CalendarResource> & { id: string }): CalendarResource {
  return { title: overrides.id, ...overrides };
}

function makeGroup(
  overrides: Partial<CalendarResourceGroup> & { id: string },
): CalendarResourceGroup {
  return { title: overrides.id, ...overrides };
}

describe("buildResourceTree", () => {
  it("returns empty tree for empty inputs", () => {
    const tree = buildResourceTree([], [], [], []);
    expect(tree.groups).toEqual([]);
    expect(tree.ungrouped).toEqual([]);
  });

  it("places ungrouped resources sorted by order", () => {
    const resources = [
      makeResource({ id: "r3", order: 3 }),
      makeResource({ id: "r1", order: 1 }),
      makeResource({ id: "r2", order: 2 }),
    ];
    const tree = buildResourceTree(resources, [], [], []);
    expect(tree.ungrouped.map((r) => r.id)).toEqual(["r1", "r2", "r3"]);
    expect(tree.groups).toEqual([]);
  });

  it("groups resources by groupId with correct group assignment", () => {
    const groups = [makeGroup({ id: "g1" })];
    const resources = [
      makeResource({ id: "r1", groupId: "g1" }),
      makeResource({ id: "r2", groupId: "g1" }),
      makeResource({ id: "r3" }),
    ];
    const tree = buildResourceTree(resources, groups, [], []);
    expect(tree.groups).toHaveLength(1);
    expect(tree.groups[0].group.id).toBe("g1");
    expect(tree.groups[0].resources.map((r) => r.id)).toEqual(["r1", "r2"]);
    expect(tree.ungrouped.map((r) => r.id)).toEqual(["r3"]);
  });

  it("sorts groups by group order", () => {
    const groups = [
      makeGroup({ id: "g2", order: 2 }),
      makeGroup({ id: "g1", order: 1 }),
      makeGroup({ id: "g3", order: 3 }),
    ];
    const resources = [
      makeResource({ id: "r1", groupId: "g1" }),
      makeResource({ id: "r2", groupId: "g2" }),
      makeResource({ id: "r3", groupId: "g3" }),
    ];
    const tree = buildResourceTree(resources, groups, [], []);
    expect(tree.groups.map((g) => g.group.id)).toEqual(["g1", "g2", "g3"]);
  });

  it("sorts resources within groups by resource order", () => {
    const groups = [makeGroup({ id: "g1" })];
    const resources = [
      makeResource({ id: "r3", groupId: "g1", order: 3 }),
      makeResource({ id: "r1", groupId: "g1", order: 1 }),
      makeResource({ id: "r2", groupId: "g1", order: 2 }),
    ];
    const tree = buildResourceTree(resources, groups, [], []);
    expect(tree.groups[0].resources.map((r) => r.id)).toEqual(["r1", "r2", "r3"]);
  });

  it("filters to only matching resources when filteredIds is non-empty", () => {
    const groups = [makeGroup({ id: "g1" })];
    const resources = [
      makeResource({ id: "r1", groupId: "g1" }),
      makeResource({ id: "r2", groupId: "g1" }),
      makeResource({ id: "r3" }),
    ];
    const tree = buildResourceTree(resources, groups, ["r1", "r3"], []);
    expect(tree.groups[0].resources.map((r) => r.id)).toEqual(["r1"]);
    expect(tree.ungrouped.map((r) => r.id)).toEqual(["r3"]);
  });

  it("shows all resources when filteredIds is empty", () => {
    const resources = [makeResource({ id: "r1" }), makeResource({ id: "r2" })];
    const tree = buildResourceTree(resources, [], [], []);
    expect(tree.ungrouped).toHaveLength(2);
  });

  it("sets isCollapsed=true on matching groups from collapsedGroupIds", () => {
    const groups = [makeGroup({ id: "g1" }), makeGroup({ id: "g2" })];
    const resources = [
      makeResource({ id: "r1", groupId: "g1" }),
      makeResource({ id: "r2", groupId: "g2" }),
    ];
    const tree = buildResourceTree(resources, groups, [], ["g1"]);
    expect(tree.groups[0].isCollapsed).toBe(true);
    expect(tree.groups[1].isCollapsed).toBe(false);
  });

  it("puts resources with groupId not matching any group into ungrouped", () => {
    const groups = [makeGroup({ id: "g1" })];
    const resources = [
      makeResource({ id: "r1", groupId: "g1" }),
      makeResource({ id: "r2", groupId: "nonexistent" }),
    ];
    const tree = buildResourceTree(resources, groups, [], []);
    expect(tree.groups[0].resources.map((r) => r.id)).toEqual(["r1"]);
    expect(tree.ungrouped.map((r) => r.id)).toEqual(["r2"]);
  });

  it("uses order=0 as default when order is undefined", () => {
    const resources = [
      makeResource({ id: "r2", order: 1 }),
      makeResource({ id: "r1" }), // order undefined, defaults to 0
    ];
    const tree = buildResourceTree(resources, [], [], []);
    expect(tree.ungrouped.map((r) => r.id)).toEqual(["r1", "r2"]);
  });
});
