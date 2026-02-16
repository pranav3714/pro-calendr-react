import { getSlotAtPosition } from "./slot";
import { parseTimeToMinutes, minutesToDate } from "./date-utils";

export function snapToGrid(position: number, gridSize: number): number {
  return Math.round(position / gridSize) * gridSize;
}

/**
 * Convert a pointer clientY position to a snapped time on a reference day.
 *
 * Pipeline: clientY -> containerRelativeY -> slotIndex -> minutes -> snappedDate
 */
export function pointerToSnappedTime(
  clientY: number,
  containerRect: DOMRect,
  scrollTop: number,
  slotHeight: number,
  slotDuration: number,
  slotMinTime: string,
  totalSlots: number,
  referenceDay: Date,
): Date {
  const relativeY = clientY - containerRect.top + scrollTop;
  const slotIndex = getSlotAtPosition(relativeY, slotHeight, totalSlots);
  const gridStartMinutes = parseTimeToMinutes(slotMinTime);
  const minutes = gridStartMinutes + slotIndex * slotDuration;
  return minutesToDate(minutes, referenceDay);
}

/**
 * Convert a pointer clientX position to a column index (day index).
 */
export function pointerToColumnIndex(
  clientX: number,
  containerRect: DOMRect,
  columnCount: number,
  timeLabelsWidth: number,
): number {
  const relativeX = clientX - containerRect.left - timeLabelsWidth;
  const columnWidth = (containerRect.width - timeLabelsWidth) / columnCount;
  const index = Math.floor(relativeX / columnWidth);
  return Math.max(0, Math.min(index, columnCount - 1));
}

/**
 * Check if pointer movement exceeds the drag threshold (distinguishes click from drag).
 */
export function exceedsThreshold(
  current: { x: number; y: number },
  initial: { x: number; y: number },
  threshold: number,
): boolean {
  const dx = current.x - initial.x;
  const dy = current.y - initial.y;
  return Math.sqrt(dx * dx + dy * dy) >= threshold;
}
