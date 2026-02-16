import React from "react";
import {
  BOOKING_TYPES,
  ROW_HEIGHT,
  formatTime,
  positionToMinutes,
  minutesToPosition,
  snapToGrid,
  clampMinutes,
} from "./scheduleData";
import type { ResizeState } from "./useDayViewDragAndResize";
import type { RowData } from "./useDayViewResourceLayout";

// ── Props ────────────────────────────────────────────────────────────────────

interface ResizeGhostProps {
  resizeState: ResizeState;
  timelineRef: React.RefObject<HTMLDivElement>;
  rowDataByResource: Map<string, RowData>;
  laneDataByResource: Map<string, { laneAssignments: Map<string, number>; laneCount: number }>;
  dayStartHour: number;
  dayEndHour: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

const MIN_DURATION = 15;

// ── Component ────────────────────────────────────────────────────────────────

const ResizeGhost: React.FC<ResizeGhostProps> = React.memo(function ResizeGhost({
  resizeState,
  timelineRef,
  rowDataByResource,
  laneDataByResource,
  dayStartHour,
  dayEndHour,
}) {
  if (!timelineRef.current) return null;

  const rect = timelineRef.current.getBoundingClientRect();
  const config = { dayStartHour, hourWidth: rect.width / (dayEndHour - dayStartHour) };

  const deltaX = resizeState.currentX - resizeState.startClientX;
  const deltaMinutes = positionToMinutes(deltaX, { dayStartHour: 0, hourWidth: config.hourWidth });

  let newStart = resizeState.originalStart;
  let newEnd = resizeState.originalEnd;

  if (resizeState.edge === "left") {
    newStart = snapToGrid(resizeState.originalStart + deltaMinutes);
    newStart = clampMinutes(newStart, { dayStartHour, dayEndHour });
    if (newEnd - newStart < MIN_DURATION) {
      newStart = newEnd - MIN_DURATION;
    }
  } else {
    newEnd = snapToGrid(resizeState.originalEnd + deltaMinutes);
    newEnd = clampMinutes(newEnd, { dayStartHour, dayEndHour });
    if (newEnd - newStart < MIN_DURATION) {
      newEnd = newStart + MIN_DURATION;
    }
  }

  const left = minutesToPosition(newStart, config);
  const width = minutesToPosition(newEnd, config) - left;

  // Position based on row and lane
  const rowData = rowDataByResource.get(resizeState.booking.resourceId);
  const laneData = laneDataByResource.get(resizeState.booking.resourceId);
  const laneIndex = laneData?.laneAssignments.get(resizeState.booking.id) ?? 0;
  const top = (rowData?.y ?? 0) + laneIndex * ROW_HEIGHT + 4;
  const height = ROW_HEIGHT - 8;

  const type = BOOKING_TYPES[resizeState.booking.type] ?? BOOKING_TYPES.flight;

  return (
    <div
      className={`pointer-events-none absolute z-40 rounded-md border-l-[3px] ${type.border} ${type.bg} shadow-xl`}
      style={{
        left,
        top,
        width: Math.max(width, 30),
        height,
        opacity: 0.8,
      }}
    >
      <div className="flex h-full flex-col justify-center px-2 py-1">
        <div className={`truncate text-[11px] font-semibold ${type.text}`}>
          {resizeState.booking.title}
        </div>
        <div className={`text-[10px] ${type.sub}`}>
          {formatTime(newStart)} - {formatTime(newEnd)}
        </div>
      </div>
    </div>
  );
});

export default ResizeGhost;
