import { describe, it, expect } from "vitest";
import { resolveTargetResource } from "../resolve-target-resource";
import type { RowData } from "../../interfaces/row-data";

function assertDefined<T>(value: T | null | undefined): asserts value is T {
  expect(value).toBeDefined();
  expect(value).not.toBeNull();
}

function makeRow(params: {
  readonly id: string;
  readonly y: number;
  readonly rowHeight: number;
}): RowData {
  return {
    resource: { id: params.id, title: params.id, groupId: "g1" },
    groupId: "g1",
    y: params.y,
    rowHeight: params.rowHeight,
    laneCount: 1,
  };
}

const ROWS: readonly RowData[] = [
  makeRow({ id: "r1", y: 0, rowHeight: 56 }),
  makeRow({ id: "r2", y: 56, rowHeight: 56 }),
  makeRow({ id: "r3", y: 112, rowHeight: 112 }),
  makeRow({ id: "r4", y: 224, rowHeight: 56 }),
];

describe("resolveTargetResource", () => {
  it("returns null for empty rows array", () => {
    const result = resolveTargetResource({ relativeY: 30, rows: [] });
    expect(result).toBeNull();
  });

  it("resolves the first row when relativeY is at the top", () => {
    const result = resolveTargetResource({ relativeY: 0, rows: ROWS });
    assertDefined(result);
    expect(result.resourceId).toBe("r1");
  });

  it("resolves the correct row for a position in the middle of a row", () => {
    const result = resolveTargetResource({ relativeY: 28, rows: ROWS });
    assertDefined(result);
    expect(result.resourceId).toBe("r1");
  });

  it("resolves the next row at the exact boundary", () => {
    const result = resolveTargetResource({ relativeY: 56, rows: ROWS });
    assertDefined(result);
    expect(result.resourceId).toBe("r2");
  });

  it("resolves a tall row (multi-lane) correctly", () => {
    const result = resolveTargetResource({ relativeY: 150, rows: ROWS });
    assertDefined(result);
    expect(result.resourceId).toBe("r3");
    expect(result.rowHeight).toBe(112);
  });

  it("resolves the last row", () => {
    const result = resolveTargetResource({ relativeY: 250, rows: ROWS });
    assertDefined(result);
    expect(result.resourceId).toBe("r4");
  });

  it("returns null when relativeY is above all rows", () => {
    const result = resolveTargetResource({ relativeY: -10, rows: ROWS });
    expect(result).toBeNull();
  });

  it("returns null when relativeY is below all rows", () => {
    const result = resolveTargetResource({ relativeY: 300, rows: ROWS });
    expect(result).toBeNull();
  });

  it("returns row y position and height in the result", () => {
    const result = resolveTargetResource({ relativeY: 70, rows: ROWS });
    assertDefined(result);
    expect(result.rowY).toBe(56);
    expect(result.rowHeight).toBe(56);
  });

  it("handles a single row correctly", () => {
    const singleRow = [makeRow({ id: "only", y: 0, rowHeight: 100 })];
    const result = resolveTargetResource({ relativeY: 50, rows: singleRow });
    assertDefined(result);
    expect(result.resourceId).toBe("only");
  });
});
