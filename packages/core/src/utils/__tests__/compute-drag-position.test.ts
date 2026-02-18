import { describe, it, expect } from "vitest";
import { computeDragPosition } from "../compute-drag-position";
import type { RowData } from "../../interfaces/row-data";
import type { LayoutConfig } from "../../interfaces/layout-config";

function assertDefined<T>(value: T | null | undefined): asserts value is T {
  expect(value).toBeDefined();
  expect(value).not.toBeNull();
}

const LAYOUT: LayoutConfig = {
  hourWidth: 128,
  rowHeight: 56,
  sidebarWidth: 208,
  groupHeaderHeight: 36,
  timeHeaderHeight: 40,
  snapInterval: 15,
  dayStartHour: 6,
  dayEndHour: 22,
  dragThreshold: 5,
  resizeThreshold: 3,
  minDuration: 15,
};

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
  makeRow({ id: "r3", y: 112, rowHeight: 56 }),
];

describe("computeDragPosition", () => {
  it("computes a snapped position for a basic drag", () => {
    // clientX = 208 (sidebar) + 256 (2 hours into timeline) = 464
    // That maps to 6*60 + 2*60 = 480 minutes (8:00 AM)
    // grabOffset = 0, duration = 60
    const result = computeDragPosition({
      clientX: 464,
      clientY: 60,
      scrollLeft: 0,
      scrollTop: 0,
      containerTop: 0,
      sidebarWidth: 208,
      timeHeaderHeight: LAYOUT.timeHeaderHeight,
      grabOffsetMinutes: 0,
      duration: 60,
      rows: ROWS,
      layoutConfig: LAYOUT,
    });

    assertDefined(result);
    expect(result.snappedStart).toBe(480);
    expect(result.snappedEnd).toBe(540);
    expect(result.targetResourceId).toBe("r1");
  });

  it("applies grab offset to preserve cursor position within the block", () => {
    // clientX maps to 480 min, grabOffset = 30 → start should be 450
    const result = computeDragPosition({
      clientX: 464,
      clientY: 60,
      scrollLeft: 0,
      scrollTop: 0,
      containerTop: 0,
      sidebarWidth: 208,
      timeHeaderHeight: LAYOUT.timeHeaderHeight,
      grabOffsetMinutes: 30,
      duration: 60,
      rows: ROWS,
      layoutConfig: LAYOUT,
    });

    assertDefined(result);
    expect(result.snappedStart).toBe(450);
    expect(result.snappedEnd).toBe(510);
  });

  it("snaps to the nearest 15-minute interval", () => {
    // 208 + 140px = 348 clientX → 140px / 128px/hr = 1.09375 hours → 65.625 min + 360 = 425.625 min
    // Snap to nearest 15: 420 or 435 → rounds to 420 (7:00)
    const result = computeDragPosition({
      clientX: 348,
      clientY: 60,
      scrollLeft: 0,
      scrollTop: 0,
      containerTop: 0,
      sidebarWidth: 208,
      timeHeaderHeight: LAYOUT.timeHeaderHeight,
      grabOffsetMinutes: 0,
      duration: 60,
      rows: ROWS,
      layoutConfig: LAYOUT,
    });

    assertDefined(result);
    expect(result.snappedStart % 15).toBe(0);
  });

  it("clamps to day start boundary", () => {
    // clientX very small → would map to before dayStart (6:00 = 360 min)
    const result = computeDragPosition({
      clientX: 208,
      clientY: 60,
      scrollLeft: 0,
      scrollTop: 0,
      containerTop: 0,
      sidebarWidth: 208,
      timeHeaderHeight: LAYOUT.timeHeaderHeight,
      grabOffsetMinutes: 120,
      duration: 60,
      rows: ROWS,
      layoutConfig: LAYOUT,
    });

    assertDefined(result);
    expect(result.snappedStart).toBeGreaterThanOrEqual(360);
  });

  it("clamps to day end boundary", () => {
    // clientX very large → would map to past dayEnd (22:00 = 1320 min)
    const result = computeDragPosition({
      clientX: 3000,
      clientY: 60,
      scrollLeft: 0,
      scrollTop: 0,
      containerTop: 0,
      sidebarWidth: 208,
      timeHeaderHeight: LAYOUT.timeHeaderHeight,
      grabOffsetMinutes: 0,
      duration: 60,
      rows: ROWS,
      layoutConfig: LAYOUT,
    });

    assertDefined(result);
    expect(result.snappedEnd).toBeLessThanOrEqual(1320);
    expect(result.snappedEnd - result.snappedStart).toBe(60);
  });

  it("resolves the correct target resource from clientY", () => {
    // Row r2 is at y=56, height=56 → relativeY of 76 (within r2)
    // relativeY = clientY - containerTop + scrollTop - timeHeaderHeight
    // 116 - 0 + 0 - 40 = 76
    const result = computeDragPosition({
      clientX: 464,
      clientY: 116,
      scrollLeft: 0,
      scrollTop: 0,
      containerTop: 0,
      sidebarWidth: 208,
      timeHeaderHeight: LAYOUT.timeHeaderHeight,
      grabOffsetMinutes: 0,
      duration: 60,
      rows: ROWS,
      layoutConfig: LAYOUT,
    });

    assertDefined(result);
    expect(result.targetResourceId).toBe("r2");
  });

  it("returns null when cursor is not over any resource row", () => {
    const result = computeDragPosition({
      clientX: 464,
      clientY: -100,
      scrollLeft: 0,
      scrollTop: 0,
      containerTop: 0,
      sidebarWidth: 208,
      timeHeaderHeight: LAYOUT.timeHeaderHeight,
      grabOffsetMinutes: 0,
      duration: 60,
      rows: ROWS,
      layoutConfig: LAYOUT,
    });

    expect(result).toBeNull();
  });

  it("accounts for scroll offset", () => {
    // With scrollLeft=128 (1 hour), same clientX should map 1 hour later
    const withoutScroll = computeDragPosition({
      clientX: 464,
      clientY: 60,
      scrollLeft: 0,
      scrollTop: 0,
      containerTop: 0,
      sidebarWidth: 208,
      timeHeaderHeight: LAYOUT.timeHeaderHeight,
      grabOffsetMinutes: 0,
      duration: 60,
      rows: ROWS,
      layoutConfig: LAYOUT,
    });

    const withScroll = computeDragPosition({
      clientX: 464,
      clientY: 60,
      scrollLeft: 128,
      scrollTop: 0,
      containerTop: 0,
      sidebarWidth: 208,
      timeHeaderHeight: LAYOUT.timeHeaderHeight,
      grabOffsetMinutes: 0,
      duration: 60,
      rows: ROWS,
      layoutConfig: LAYOUT,
    });

    assertDefined(withoutScroll);
    assertDefined(withScroll);
    expect(withScroll.snappedStart).toBe(withoutScroll.snappedStart + 60);
  });

  it("preserves duration even at day boundaries", () => {
    const result = computeDragPosition({
      clientX: 3000,
      clientY: 60,
      scrollLeft: 0,
      scrollTop: 0,
      containerTop: 0,
      sidebarWidth: 208,
      timeHeaderHeight: LAYOUT.timeHeaderHeight,
      grabOffsetMinutes: 0,
      duration: 120,
      rows: ROWS,
      layoutConfig: LAYOUT,
    });

    assertDefined(result);
    expect(result.snappedEnd - result.snappedStart).toBe(120);
  });

  it("accounts for containerTop offset", () => {
    // containerTop = 100 shifts the relativeY calculation
    const result = computeDragPosition({
      clientX: 464,
      clientY: 160,
      scrollLeft: 0,
      scrollTop: 0,
      containerTop: 100,
      sidebarWidth: 208,
      timeHeaderHeight: LAYOUT.timeHeaderHeight,
      grabOffsetMinutes: 0,
      duration: 60,
      rows: ROWS,
      layoutConfig: LAYOUT,
    });

    // relativeY = 160 - 100 + 0 - 40 = 20 → within r1
    assertDefined(result);
    expect(result.targetResourceId).toBe("r1");
  });
});
