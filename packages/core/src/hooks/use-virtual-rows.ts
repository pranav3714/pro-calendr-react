import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback } from "react";
import type { UseVirtualRowsParams, UseVirtualRowsResult } from "../interfaces/virtual-rows-params";

const DEFAULT_OVERSCAN = 5;

function getItemHeight({
  items,
  index,
}: {
  readonly items: readonly import("../interfaces/virtual-item-data").VirtualItemData[];
  readonly index: number;
}): number {
  const item = items[index];

  if (item.kind === "group-header") {
    return item.height;
  }

  return item.rowHeight;
}

function getItemKey({
  items,
  index,
}: {
  readonly items: readonly import("../interfaces/virtual-item-data").VirtualItemData[];
  readonly index: number;
}): string {
  const item = items[index];

  if (item.kind === "group-header") {
    return `gh-${item.groupId}`;
  }

  return `rr-${item.resource.id}`;
}

export function useVirtualRows({
  scrollContainerRef,
  items,
  overscan = DEFAULT_OVERSCAN,
  scrollMargin = 0,
}: UseVirtualRowsParams): UseVirtualRowsResult {
  const getScrollElement = useCallback(() => scrollContainerRef.current, [scrollContainerRef]);

  const estimateSize = useCallback((index: number) => getItemHeight({ items, index }), [items]);

  const extractKey = useCallback((index: number) => getItemKey({ items, index }), [items]);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement,
    estimateSize,
    overscan,
    scrollMargin,
    getItemKey: extractKey,
  });

  const scrollToIndex = useCallback(
    (params: { readonly index: number }) => {
      virtualizer.scrollToIndex(params.index, { align: "start" });
    },
    [virtualizer],
  );

  return {
    virtualItems: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
    scrollToIndex,
    items,
  };
}
