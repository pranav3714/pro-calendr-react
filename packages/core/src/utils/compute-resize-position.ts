import type { ResizePosition, ResizeEdge } from "../interfaces/resize-state";
import type { LayoutConfig } from "../interfaces/layout-config";
import { positionToMinutes, snapToGrid, clampMinutes } from "./time-position";

interface ComputeResizePositionParams {
  readonly clientX: number;
  readonly scrollLeft: number;
  readonly sidebarWidth: number;
  readonly edge: ResizeEdge;
  readonly originalStart: number;
  readonly originalEnd: number;
  readonly layoutConfig: LayoutConfig;
}

export function computeResizePosition({
  clientX,
  scrollLeft,
  sidebarWidth,
  edge,
  originalStart,
  originalEnd,
  layoutConfig,
}: ComputeResizePositionParams): ResizePosition {
  const timelinePx = clientX + scrollLeft - sidebarWidth;
  const rawMinutes = positionToMinutes({ px: timelinePx, config: layoutConfig });
  const snappedMinutes = snapToGrid({ minutes: rawMinutes, interval: layoutConfig.snapInterval });
  const clampedMinutes = clampMinutes({ minutes: snappedMinutes, config: layoutConfig });

  if (edge === "start") {
    const maxStart = originalEnd - layoutConfig.minDuration;
    const newStart = Math.min(clampedMinutes, maxStart);
    return { snappedStart: newStart, snappedEnd: originalEnd };
  }

  const minEnd = originalStart + layoutConfig.minDuration;
  const newEnd = Math.max(clampedMinutes, minEnd);
  return { snappedStart: originalStart, snappedEnd: newEnd };
}
