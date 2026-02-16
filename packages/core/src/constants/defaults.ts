import type { CalendarViewType } from "../types";

export const DEFAULTS = {
  view: "week" as CalendarViewType,
  slotDuration: 30,
  slotMinTime: "00:00",
  slotMaxTime: "24:00",
  firstDay: 1,
  weekends: true,
  scrollTime: "08:00",
  densityBreakpoints: { micro: 60, compact: 150 },
  animationDuration: 150,
  mobileBreakpoint: 768,
  skeletonCount: 5,
  resourceAreaWidth: 180,
  dragThreshold: 4,
} as const;
