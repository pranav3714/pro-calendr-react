import React from "react";
import {
  BOOKING_TYPES,
  formatTime,
  positionToMinutes,
  minutesToPosition,
  snapToGrid,
  clampMinutes,
  type HelperConfig,
} from "./scheduleData";
import type { DragState } from "./useDayViewDragAndResize";

// ── Props ────────────────────────────────────────────────────────────────────

interface DragGhostProps {
  dragState: DragState;
  timelineRef: React.RefObject<HTMLDivElement>;
  dayStartHour: number;
  dayEndHour: number;
}

// ── Component ────────────────────────────────────────────────────────────────

const DragGhost: React.FC<DragGhostProps> = React.memo(function DragGhost({
  dragState,
  timelineRef,
  dayStartHour,
  dayEndHour,
}) {
  if (!timelineRef.current) return null;

  const rect = timelineRef.current.getBoundingClientRect();
  const helperConfig: HelperConfig = {
    dayStartHour,
    dayEndHour,
    hourWidth:
      rect.width / (dayEndHour - dayStartHour) > 0 ? rect.width / (dayEndHour - dayStartHour) : 128,
  };

  // Use the actual helperConfig from the timeline width
  const config = { dayStartHour, hourWidth: helperConfig.hourWidth };

  const deltaX = dragState.currentX - dragState.startClientX;
  const duration = dragState.originalEnd - dragState.originalStart;

  // Calculate new start from original position + delta
  const originalPx = minutesToPosition(dragState.originalStart, config);
  const newPx = originalPx + deltaX;
  const rawMinutes = positionToMinutes(newPx, config);
  let newStart = snapToGrid(rawMinutes);
  newStart = clampMinutes(newStart, { dayStartHour, dayEndHour });
  let newEnd = newStart + duration;

  if (newEnd > dayEndHour * 60) {
    newEnd = dayEndHour * 60;
    newStart = newEnd - duration;
  }

  const left = minutesToPosition(newStart, config);
  const width = minutesToPosition(newEnd, config) - left;

  // Vertical position relative to pointer
  const relativeY = dragState.currentY - rect.top;

  const type = BOOKING_TYPES[dragState.booking.type] ?? BOOKING_TYPES.flight;

  return (
    <div
      className={`pointer-events-none absolute z-40 rounded-md border-l-[3px] ${type.border} ${type.bg} shadow-xl`}
      style={{
        left,
        top: relativeY - 20,
        width: Math.max(width, 30),
        height: 48,
        opacity: 0.8,
      }}
    >
      <div className="flex h-full flex-col justify-center px-2 py-1">
        <div className={`truncate text-[11px] font-semibold ${type.text}`}>
          {dragState.booking.title}
        </div>
        <div className={`text-[10px] ${type.sub}`}>
          {formatTime(newStart)} - {formatTime(newEnd)}
        </div>
      </div>
    </div>
  );
});

export default DragGhost;
