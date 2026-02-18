import { describe, it, expect } from "vitest";
import type { RowData } from "../../interfaces/row-data";
import { resolveWeekDropTarget } from "../resolve-week-drop-target";

const WEEK_DAYS = [
  new Date(2026, 1, 16), // Mon
  new Date(2026, 1, 17),
  new Date(2026, 1, 18),
  new Date(2026, 1, 19),
  new Date(2026, 1, 20),
  new Date(2026, 1, 21),
  new Date(2026, 1, 22), // Sun
];

const ROWS: RowData[] = [
  {
    resource: { id: "ac-1", title: "CS-UMH", groupId: "aircraft" },
    groupId: "aircraft",
    y: 0,
    rowHeight: 56,
    laneCount: 1,
  },
  {
    resource: { id: "ac-2", title: "CS-UMG", groupId: "aircraft" },
    groupId: "aircraft",
    y: 56,
    rowHeight: 56,
    laneCount: 1,
  },
  {
    resource: { id: "inst-1", title: "Jose", groupId: "instructors" },
    groupId: "instructors",
    y: 112,
    rowHeight: 56,
    laneCount: 1,
  },
];

const GRID_RECT = {
  left: 0,
  top: 0,
  width: 908,
  height: 600,
  right: 908,
  bottom: 600,
  x: 0,
  y: 0,
  toJSON: () => ({}),
} as DOMRect;
const SIDEBAR_WIDTH = 208;
const HEADER_HEIGHT = 40;
const GRID_CONTENT_WIDTH = 700; // 908 - 208

describe("resolveWeekDropTarget", () => {
  it("returns correct column and resource for center of first cell", () => {
    const dayColumnWidth = GRID_CONTENT_WIDTH / 7; // 100px each
    const result = resolveWeekDropTarget({
      clientX: SIDEBAR_WIDTH + dayColumnWidth / 2, // center of first column
      clientY: HEADER_HEIGHT + 28, // center of first row
      gridRect: GRID_RECT,
      scrollLeft: 0,
      scrollTop: 0,
      sidebarWidth: SIDEBAR_WIDTH,
      headerHeight: HEADER_HEIGHT,
      gridContentWidth: GRID_CONTENT_WIDTH,
      weekDays: WEEK_DAYS,
      rows: ROWS,
    });

    expect(result).not.toBeNull();
    expect(result?.dateKey).toBe("2026-02-16");
    expect(result?.resourceId).toBe("ac-1");
  });

  it("returns correct column for third day (Wednesday)", () => {
    const dayColumnWidth = GRID_CONTENT_WIDTH / 7;
    const result = resolveWeekDropTarget({
      clientX: SIDEBAR_WIDTH + dayColumnWidth * 2.5,
      clientY: HEADER_HEIGHT + 28,
      gridRect: GRID_RECT,
      scrollLeft: 0,
      scrollTop: 0,
      sidebarWidth: SIDEBAR_WIDTH,
      headerHeight: HEADER_HEIGHT,
      gridContentWidth: GRID_CONTENT_WIDTH,
      weekDays: WEEK_DAYS,
      rows: ROWS,
    });

    expect(result).not.toBeNull();
    expect(result?.dateKey).toBe("2026-02-18");
  });

  it("returns correct resource for second row", () => {
    const dayColumnWidth = GRID_CONTENT_WIDTH / 7;
    const result = resolveWeekDropTarget({
      clientX: SIDEBAR_WIDTH + dayColumnWidth / 2,
      clientY: HEADER_HEIGHT + 80, // in second row (y: 56-112)
      gridRect: GRID_RECT,
      scrollLeft: 0,
      scrollTop: 0,
      sidebarWidth: SIDEBAR_WIDTH,
      headerHeight: HEADER_HEIGHT,
      gridContentWidth: GRID_CONTENT_WIDTH,
      weekDays: WEEK_DAYS,
      rows: ROWS,
    });

    expect(result).not.toBeNull();
    expect(result?.resourceId).toBe("ac-2");
  });

  it("returns null when cursor is left of sidebar", () => {
    const result = resolveWeekDropTarget({
      clientX: 100, // inside sidebar area
      clientY: HEADER_HEIGHT + 28,
      gridRect: GRID_RECT,
      scrollLeft: 0,
      scrollTop: 0,
      sidebarWidth: SIDEBAR_WIDTH,
      headerHeight: HEADER_HEIGHT,
      gridContentWidth: GRID_CONTENT_WIDTH,
      weekDays: WEEK_DAYS,
      rows: ROWS,
    });

    expect(result).toBeNull();
  });

  it("returns null when cursor is above first row (in header)", () => {
    const dayColumnWidth = GRID_CONTENT_WIDTH / 7;
    const result = resolveWeekDropTarget({
      clientX: SIDEBAR_WIDTH + dayColumnWidth / 2,
      clientY: 10, // above header
      gridRect: GRID_RECT,
      scrollLeft: 0,
      scrollTop: 0,
      sidebarWidth: SIDEBAR_WIDTH,
      headerHeight: HEADER_HEIGHT,
      gridContentWidth: GRID_CONTENT_WIDTH,
      weekDays: WEEK_DAYS,
      rows: ROWS,
    });

    expect(result).toBeNull();
  });

  it("returns null when cursor is below all rows", () => {
    const dayColumnWidth = GRID_CONTENT_WIDTH / 7;
    const result = resolveWeekDropTarget({
      clientX: SIDEBAR_WIDTH + dayColumnWidth / 2,
      clientY: HEADER_HEIGHT + 500, // way below all rows
      gridRect: GRID_RECT,
      scrollLeft: 0,
      scrollTop: 0,
      sidebarWidth: SIDEBAR_WIDTH,
      headerHeight: HEADER_HEIGHT,
      gridContentWidth: GRID_CONTENT_WIDTH,
      weekDays: WEEK_DAYS,
      rows: ROWS,
    });

    expect(result).toBeNull();
  });

  it("clamps to last column when at right edge", () => {
    const result = resolveWeekDropTarget({
      clientX: SIDEBAR_WIDTH + GRID_CONTENT_WIDTH - 1,
      clientY: HEADER_HEIGHT + 28,
      gridRect: GRID_RECT,
      scrollLeft: 0,
      scrollTop: 0,
      sidebarWidth: SIDEBAR_WIDTH,
      headerHeight: HEADER_HEIGHT,
      gridContentWidth: GRID_CONTENT_WIDTH,
      weekDays: WEEK_DAYS,
      rows: ROWS,
    });

    expect(result).not.toBeNull();
    expect(result?.dateKey).toBe("2026-02-22"); // Sunday (last day)
  });

  it("accounts for scroll offset", () => {
    const dayColumnWidth = GRID_CONTENT_WIDTH / 7;
    const result = resolveWeekDropTarget({
      clientX: SIDEBAR_WIDTH + dayColumnWidth / 2,
      clientY: 20, // low clientY, but scroll brings us down
      gridRect: GRID_RECT,
      scrollLeft: 0,
      scrollTop: 100, // scrolled down 100px
      sidebarWidth: SIDEBAR_WIDTH,
      headerHeight: HEADER_HEIGHT,
      gridContentWidth: GRID_CONTENT_WIDTH,
      weekDays: WEEK_DAYS,
      rows: ROWS,
    });

    // relativeY = 20 - 0 + 100 - 40 = 80, which is in second row (y: 56-112)
    expect(result).not.toBeNull();
    expect(result?.resourceId).toBe("ac-2");
  });
});
