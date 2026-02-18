import type { RefObject } from "react";
import type { VirtualItem } from "@tanstack/react-virtual";
import type { VirtualItemData } from "./virtual-item-data";

export interface UseVirtualRowsParams {
  readonly scrollContainerRef: RefObject<HTMLElement | null>;
  readonly items: readonly VirtualItemData[];
  readonly overscan?: number;
  readonly scrollMargin?: number;
}

export interface UseVirtualRowsResult {
  readonly virtualItems: readonly VirtualItem[];
  readonly totalSize: number;
  readonly scrollToIndex: (params: { readonly index: number }) => void;
  readonly items: readonly VirtualItemData[];
}
