import type { RowData } from "../interfaces/row-data";
import type { WeekDragTarget } from "../interfaces/week-cell-drag-params";
import { formatDateKey } from "./format-date-key";
import { resolveTargetResource } from "./resolve-target-resource";

interface ResolveWeekDropTargetParams {
  readonly clientX: number;
  readonly clientY: number;
  readonly gridRect: DOMRect;
  readonly scrollLeft: number;
  readonly scrollTop: number;
  readonly sidebarWidth: number;
  readonly headerHeight: number;
  readonly gridContentWidth: number;
  readonly weekDays: readonly Date[];
  readonly rows: readonly RowData[];
}

export function resolveWeekDropTarget({
  clientX,
  clientY,
  gridRect,
  scrollLeft,
  scrollTop,
  sidebarWidth,
  headerHeight,
  gridContentWidth,
  weekDays,
  rows,
}: ResolveWeekDropTargetParams): WeekDragTarget | null {
  const relativeX = clientX - gridRect.left + scrollLeft - sidebarWidth;
  if (relativeX < 0 || relativeX >= gridContentWidth) {
    return null;
  }

  const dayColumnWidth = gridContentWidth / 7;
  const columnIndex = Math.min(6, Math.floor(relativeX / dayColumnWidth));

  const relativeY = clientY - gridRect.top + scrollTop - headerHeight;
  const resource = resolveTargetResource({ relativeY, rows });
  if (!resource) {
    return null;
  }

  return {
    resourceId: resource.resourceId,
    dateKey: formatDateKey({ date: weekDays[columnIndex] }),
  };
}
