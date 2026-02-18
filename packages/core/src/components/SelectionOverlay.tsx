import type { SelectionOverlayProps } from "../interfaces/ghost-props";
import { minutesToPosition } from "../utils/time-position";

export function SelectionOverlay({ slotSelection, layoutConfig, rows }: SelectionOverlayProps) {
  const config = { dayStartHour: layoutConfig.dayStartHour, hourWidth: layoutConfig.hourWidth };

  const left = minutesToPosition({ minutes: slotSelection.startMinutes, config });
  const right = minutesToPosition({ minutes: slotSelection.endMinutes, config });
  const width = Math.max(right - left, 2);

  const row = rows.find((r) => r.resource.id === slotSelection.resourceId);
  if (!row) {
    return null;
  }

  return (
    <div
      className="z-5 pointer-events-none absolute rounded border border-blue-300 bg-blue-100/40"
      style={{
        left,
        width,
        top: row.y,
        height: row.rowHeight,
      }}
    />
  );
}
