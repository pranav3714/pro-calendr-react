import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTimelineLayout } from "../use-timeline-layout";
import type { Booking } from "../../interfaces/booking";
import type { ResourceGroup } from "../../interfaces/resource";
import type { LayoutConfig } from "../../interfaces/layout-config";
import { LAYOUT_DEFAULTS } from "../../constants/layout-defaults";

function makeBooking(overrides: Partial<Booking> & { id: string; resourceId: string }): Booking {
  return {
    type: "flight",
    title: "Test",
    startMinutes: 480,
    endMinutes: 540,
    status: "confirmed",
    ...overrides,
  };
}

const TEST_GROUPS: ResourceGroup[] = [
  {
    id: "aircraft",
    label: "Aircraft",
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

const DEFAULT_CONFIG: LayoutConfig = LAYOUT_DEFAULTS;

describe("useTimelineLayout", () => {
  it("returns correct timelineWidth for default config", () => {
    const { result } = renderHook(() =>
      useTimelineLayout({
        bookings: [],
        resourceGroups: TEST_GROUPS,
        collapsedGroupIds: new Set(),
        layoutConfig: DEFAULT_CONFIG,
      }),
    );

    const expected =
      (DEFAULT_CONFIG.dayEndHour - DEFAULT_CONFIG.dayStartHour) * DEFAULT_CONFIG.hourWidth;
    expect(result.current.timelineWidth).toBe(expected);
  });

  it("returns hours array from start to end inclusive", () => {
    const { result } = renderHook(() =>
      useTimelineLayout({
        bookings: [],
        resourceGroups: TEST_GROUPS,
        collapsedGroupIds: new Set(),
        layoutConfig: DEFAULT_CONFIG,
      }),
    );

    expect(result.current.hours[0]).toBe(DEFAULT_CONFIG.dayStartHour);
    expect(result.current.hours[result.current.hours.length - 1]).toBe(DEFAULT_CONFIG.dayEndHour);
    expect(result.current.hours.length).toBe(
      DEFAULT_CONFIG.dayEndHour - DEFAULT_CONFIG.dayStartHour + 1,
    );
  });

  it("returns hours array for custom range", () => {
    const customConfig = { ...DEFAULT_CONFIG, dayStartHour: 6, dayEndHour: 20 };
    const { result } = renderHook(() =>
      useTimelineLayout({
        bookings: [],
        resourceGroups: TEST_GROUPS,
        collapsedGroupIds: new Set(),
        layoutConfig: customConfig,
      }),
    );

    expect(result.current.hours[0]).toBe(6);
    expect(result.current.hours[result.current.hours.length - 1]).toBe(20);
    expect(result.current.hours.length).toBe(15);
  });

  it("creates rows for all resources when nothing collapsed", () => {
    const { result } = renderHook(() =>
      useTimelineLayout({
        bookings: [],
        resourceGroups: TEST_GROUPS,
        collapsedGroupIds: new Set(),
        layoutConfig: DEFAULT_CONFIG,
      }),
    );

    expect(result.current.rows.length).toBe(3); // 2 aircraft + 1 instructor
  });

  it("assigns laneCount 1 to resources with no bookings", () => {
    const { result } = renderHook(() =>
      useTimelineLayout({
        bookings: [],
        resourceGroups: TEST_GROUPS,
        collapsedGroupIds: new Set(),
        layoutConfig: DEFAULT_CONFIG,
      }),
    );

    for (const row of result.current.rows) {
      expect(row.laneCount).toBe(1);
    }
  });

  it("assigns correct laneCount for overlapping bookings", () => {
    const bookings = [
      makeBooking({ id: "a", resourceId: "ac-1", startMinutes: 480, endMinutes: 600 }),
      makeBooking({ id: "b", resourceId: "ac-1", startMinutes: 500, endMinutes: 580 }),
      makeBooking({ id: "c", resourceId: "ac-1", startMinutes: 510, endMinutes: 570 }),
    ];

    const { result } = renderHook(() =>
      useTimelineLayout({
        bookings,
        resourceGroups: TEST_GROUPS,
        collapsedGroupIds: new Set(),
        layoutConfig: DEFAULT_CONFIG,
      }),
    );

    const ac1Row = result.current.rows.find((r) => r.resource.id === "ac-1");
    expect(ac1Row).toBeDefined();
    expect(ac1Row?.laneCount).toBe(3);
  });

  it("omits rows for collapsed group resources", () => {
    const { result } = renderHook(() =>
      useTimelineLayout({
        bookings: [],
        resourceGroups: TEST_GROUPS,
        collapsedGroupIds: new Set(["aircraft"]),
        layoutConfig: DEFAULT_CONFIG,
      }),
    );

    // Only instructor resource should remain
    expect(result.current.rows.length).toBe(1);
    expect(result.current.rows[0].resource.id).toBe("inst-1");
  });

  it("computes correct y positions for rows", () => {
    const { result } = renderHook(() =>
      useTimelineLayout({
        bookings: [],
        resourceGroups: TEST_GROUPS,
        collapsedGroupIds: new Set(),
        layoutConfig: DEFAULT_CONFIG,
      }),
    );

    const groupHeaderHeight = DEFAULT_CONFIG.groupHeaderHeight;
    const rowHeight = DEFAULT_CONFIG.rowHeight;

    // First group header at y=0, first resource at y=groupHeaderHeight
    expect(result.current.rows[0].y).toBe(groupHeaderHeight);
    // Second resource at y=groupHeaderHeight + rowHeight
    expect(result.current.rows[1].y).toBe(groupHeaderHeight + rowHeight);
    // Third resource after second group header
    expect(result.current.rows[2].y).toBe(groupHeaderHeight + rowHeight * 2 + groupHeaderHeight);
  });

  it("creates group positions for each group", () => {
    const { result } = renderHook(() =>
      useTimelineLayout({
        bookings: [],
        resourceGroups: TEST_GROUPS,
        collapsedGroupIds: new Set(),
        layoutConfig: DEFAULT_CONFIG,
      }),
    );

    expect(result.current.groupPositions.length).toBe(2);
    expect(result.current.groupPositions[0].groupId).toBe("aircraft");
    expect(result.current.groupPositions[0].y).toBe(0);
    expect(result.current.groupPositions[1].groupId).toBe("instructors");
  });

  it("computes totalHeight as sum of all headers and rows", () => {
    const { result } = renderHook(() =>
      useTimelineLayout({
        bookings: [],
        resourceGroups: TEST_GROUPS,
        collapsedGroupIds: new Set(),
        layoutConfig: DEFAULT_CONFIG,
      }),
    );

    const expected =
      DEFAULT_CONFIG.groupHeaderHeight + // aircraft header
      DEFAULT_CONFIG.rowHeight * 2 + // 2 aircraft resources
      DEFAULT_CONFIG.groupHeaderHeight + // instructors header
      DEFAULT_CONFIG.rowHeight; // 1 instructor resource
    expect(result.current.totalHeight).toBe(expected);
  });

  it("groups bookings by resource correctly", () => {
    const bookings = [
      makeBooking({ id: "a", resourceId: "ac-1" }),
      makeBooking({ id: "b", resourceId: "ac-2" }),
      makeBooking({ id: "c", resourceId: "ac-1" }),
    ];

    const { result } = renderHook(() =>
      useTimelineLayout({
        bookings,
        resourceGroups: TEST_GROUPS,
        collapsedGroupIds: new Set(),
        layoutConfig: DEFAULT_CONFIG,
      }),
    );

    expect(result.current.bookingsByResource.get("ac-1")?.length).toBe(2);
    expect(result.current.bookingsByResource.get("ac-2")?.length).toBe(1);
  });

  it("returns stable reference when inputs are unchanged", () => {
    const bookings: Booking[] = [];
    const groups = TEST_GROUPS;
    const collapsed = new Set<string>();
    const config = DEFAULT_CONFIG;

    const { result, rerender } = renderHook(() =>
      useTimelineLayout({
        bookings,
        resourceGroups: groups,
        collapsedGroupIds: collapsed,
        layoutConfig: config,
      }),
    );

    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it("adjusts row height for multi-lane resources", () => {
    const bookings = [
      makeBooking({ id: "a", resourceId: "ac-1", startMinutes: 480, endMinutes: 600 }),
      makeBooking({ id: "b", resourceId: "ac-1", startMinutes: 500, endMinutes: 580 }),
    ];

    const { result } = renderHook(() =>
      useTimelineLayout({
        bookings,
        resourceGroups: TEST_GROUPS,
        collapsedGroupIds: new Set(),
        layoutConfig: DEFAULT_CONFIG,
      }),
    );

    const ac1Row = result.current.rows.find((r) => r.resource.id === "ac-1");
    expect(ac1Row?.rowHeight).toBe(DEFAULT_CONFIG.rowHeight * 2);
  });
});
