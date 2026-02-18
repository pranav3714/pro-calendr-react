import type { LayoutConfig } from "../interfaces/layout-config";

export const LAYOUT_DEFAULTS: LayoutConfig = {
  hourWidth: 128,
  rowHeight: 56,
  sidebarWidth: 208,
  groupHeaderHeight: 36,
  snapInterval: 15,
  dayStartHour: 0,
  dayEndHour: 24,
  dragThreshold: 5,
  resizeThreshold: 3,
  minDuration: 15,
} as const;
