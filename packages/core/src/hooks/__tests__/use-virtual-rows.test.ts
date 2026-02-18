import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { renderHook } from "@testing-library/react";
import type { VirtualItemData } from "../../interfaces/virtual-item-data";
import { useVirtualRows } from "../use-virtual-rows";

let getBoundingClientRectSpy: ReturnType<typeof vi.spyOn>;

beforeAll(() => {
  getBoundingClientRectSpy = vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    width: 1200,
    height: 800,
    top: 0,
    left: 0,
    bottom: 800,
    right: 1200,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
});

afterAll(() => {
  getBoundingClientRectSpy.mockRestore();
});

function makeGroupHeader(params: { groupId: string; y: number; height?: number }): VirtualItemData {
  return {
    kind: "group-header",
    groupId: params.groupId,
    label: `Group ${params.groupId}`,
    resourceCount: 5,
    isCollapsed: false,
    height: params.height ?? 36,
    y: params.y,
  };
}

function makeResourceRow(params: {
  resourceId: string;
  groupId: string;
  y: number;
  rowHeight?: number;
}): VirtualItemData {
  return {
    kind: "resource-row",
    resource: { id: params.resourceId, title: `Res ${params.resourceId}`, groupId: params.groupId },
    groupId: params.groupId,
    rowHeight: params.rowHeight ?? 56,
    laneCount: 1,
    y: params.y,
  };
}

function createScrollRef(): { current: HTMLDivElement } {
  const el = document.createElement("div");
  document.body.appendChild(el);
  return { current: el };
}

describe("useVirtualRows", () => {
  it("returns empty virtualItems for empty items array", () => {
    const scrollRef = createScrollRef();

    const { result } = renderHook(() =>
      useVirtualRows({
        scrollContainerRef: scrollRef,
        items: [],
      }),
    );

    expect(result.current.virtualItems).toHaveLength(0);
    expect(result.current.totalSize).toBe(0);
  });

  it("returns totalSize matching sum of all item heights", () => {
    const scrollRef = createScrollRef();
    const items: VirtualItemData[] = [
      makeGroupHeader({ groupId: "g1", y: 0, height: 36 }),
      makeResourceRow({ resourceId: "r1", groupId: "g1", y: 36, rowHeight: 56 }),
      makeResourceRow({ resourceId: "r2", groupId: "g1", y: 92, rowHeight: 112 }),
    ];

    const { result } = renderHook(() =>
      useVirtualRows({
        scrollContainerRef: scrollRef,
        items,
      }),
    );

    expect(result.current.totalSize).toBe(36 + 56 + 112);
  });

  it("returns virtualItems array (may be empty in JSDOM without layout)", () => {
    const scrollRef = createScrollRef();
    const items: VirtualItemData[] = [
      makeGroupHeader({ groupId: "g1", y: 0 }),
      makeResourceRow({ resourceId: "r1", groupId: "g1", y: 36 }),
      makeResourceRow({ resourceId: "r2", groupId: "g1", y: 92 }),
    ];

    const { result } = renderHook(() =>
      useVirtualRows({
        scrollContainerRef: scrollRef,
        items,
        overscan: 0,
      }),
    );

    expect(Array.isArray(result.current.virtualItems)).toBe(true);
    expect(result.current.virtualItems.length).toBeLessThanOrEqual(items.length);
  });

  it("passes items through in the result", () => {
    const scrollRef = createScrollRef();
    const items: VirtualItemData[] = [makeGroupHeader({ groupId: "g1", y: 0 })];

    const { result } = renderHook(() =>
      useVirtualRows({
        scrollContainerRef: scrollRef,
        items,
      }),
    );

    expect(result.current.items).toBe(items);
  });

  it("handles mixed group-header and resource-row items", () => {
    const scrollRef = createScrollRef();
    const items: VirtualItemData[] = [
      makeGroupHeader({ groupId: "g1", y: 0, height: 36 }),
      makeResourceRow({ resourceId: "r1", groupId: "g1", y: 36, rowHeight: 56 }),
      makeGroupHeader({ groupId: "g2", y: 92, height: 36 }),
      makeResourceRow({ resourceId: "r2", groupId: "g2", y: 128, rowHeight: 56 }),
    ];

    const { result } = renderHook(() =>
      useVirtualRows({
        scrollContainerRef: scrollRef,
        items,
      }),
    );

    expect(result.current.totalSize).toBe(36 + 56 + 36 + 56);
  });

  it("provides a scrollToIndex function", () => {
    const scrollRef = createScrollRef();
    const items: VirtualItemData[] = [makeGroupHeader({ groupId: "g1", y: 0 })];

    const { result } = renderHook(() =>
      useVirtualRows({
        scrollContainerRef: scrollRef,
        items,
      }),
    );

    expect(typeof result.current.scrollToIndex).toBe("function");
  });

  it("handles variable row heights for multi-lane resources", () => {
    const scrollRef = createScrollRef();
    const items: VirtualItemData[] = [
      makeGroupHeader({ groupId: "g1", y: 0, height: 36 }),
      makeResourceRow({ resourceId: "r1", groupId: "g1", y: 36, rowHeight: 56 }),
      makeResourceRow({ resourceId: "r2", groupId: "g1", y: 92, rowHeight: 168 }),
    ];

    const { result } = renderHook(() =>
      useVirtualRows({
        scrollContainerRef: scrollRef,
        items,
      }),
    );

    expect(result.current.totalSize).toBe(36 + 56 + 168);
  });

  it("accepts scrollMargin without error", () => {
    const scrollRef = createScrollRef();
    const items: VirtualItemData[] = [
      makeGroupHeader({ groupId: "g1", y: 0 }),
      makeResourceRow({ resourceId: "r1", groupId: "g1", y: 36 }),
    ];

    const { result } = renderHook(() =>
      useVirtualRows({
        scrollContainerRef: scrollRef,
        items,
        scrollMargin: 40,
      }),
    );

    expect(result.current.totalSize).toBe(36 + 56);
  });
});
