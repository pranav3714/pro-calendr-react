import type { DragPosition } from "../interfaces/drag-state";
import type { LayoutConfig } from "../interfaces/layout-config";
import type { RowData } from "../interfaces/row-data";
import { positionToMinutes, snapToGrid, clampMinutes } from "./time-position";
import { resolveTargetResource } from "./resolve-target-resource";

interface ComputeDragPositionParams {
  readonly clientX: number;
  readonly clientY: number;
  readonly scrollLeft: number;
  readonly scrollTop: number;
  readonly containerTop: number;
  readonly sidebarWidth: number;
  readonly timeHeaderHeight: number;
  readonly grabOffsetMinutes: number;
  readonly duration: number;
  readonly rows: readonly RowData[];
  readonly layoutConfig: LayoutConfig;
}

export function computeDragPosition({
  clientX,
  clientY,
  scrollLeft,
  scrollTop,
  containerTop,
  sidebarWidth,
  timeHeaderHeight,
  grabOffsetMinutes,
  duration,
  rows,
  layoutConfig,
}: ComputeDragPositionParams): DragPosition | null {
  const timelinePx = clientX + scrollLeft - sidebarWidth;
  const cursorMinutes = positionToMinutes({ px: timelinePx, config: layoutConfig });
  const rawStart = cursorMinutes - grabOffsetMinutes;
  const snappedStart = snapToGrid({ minutes: rawStart, interval: layoutConfig.snapInterval });

  const dayStartMinutes = layoutConfig.dayStartHour * 60;
  const dayEndMinutes = layoutConfig.dayEndHour * 60;

  const clampedStart = clampMinutes({ minutes: snappedStart, config: layoutConfig });
  const clampedEnd = clampMinutes({ minutes: clampedStart + duration, config: layoutConfig });
  const shiftedStart = clampedEnd === dayEndMinutes ? dayEndMinutes - duration : clampedStart;

  const adjustedFinalStart = Math.max(dayStartMinutes, shiftedStart);
  const adjustedFinalEnd = Math.min(dayEndMinutes, adjustedFinalStart + duration);

  const relativeY = clientY - containerTop + scrollTop - timeHeaderHeight;
  const target = resolveTargetResource({ relativeY, rows });

  if (!target) {
    return null;
  }

  return {
    clientX,
    clientY,
    snappedStart: adjustedFinalStart,
    snappedEnd: adjustedFinalEnd,
    targetResourceId: target.resourceId,
  };
}
