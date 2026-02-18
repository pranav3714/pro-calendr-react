import type { DragGhostProps } from "../interfaces/ghost-props";
import { useScheduleStore } from "../hooks/use-schedule-store";
import { minutesToPosition } from "../utils/time-position";
import { formatTime } from "../utils/time-format";
import { cn } from "../utils/cn";

const LANE_PADDING_TOP = 4;
const LANE_PADDING_TOTAL = 8;

export function DragGhost({
  bookings,
  bookingTypes,
  layoutConfig,
  rows,
  laneDataByResource,
}: DragGhostProps) {
  const dragPhase = useScheduleStore({ selector: (s) => s.dragPhase });
  const dragPosition = useScheduleStore({ selector: (s) => s.dragPosition });
  const draggedBookingId = useScheduleStore({ selector: (s) => s.draggedBookingId });

  if (dragPhase !== "dragging") {
    return null;
  }

  if (!dragPosition || !draggedBookingId) {
    return null;
  }

  const booking = bookings.find((b) => b.id === draggedBookingId);
  if (!booking) {
    return null;
  }

  const typeConfig = bookingTypes[booking.type] ?? bookingTypes.flight;
  const config = { dayStartHour: layoutConfig.dayStartHour, hourWidth: layoutConfig.hourWidth };

  const left = minutesToPosition({ minutes: dragPosition.snappedStart, config });
  const right = minutesToPosition({ minutes: dragPosition.snappedEnd, config });
  const width = Math.max(right - left, 24);

  const targetRow = rows.find((r) => r.resource.id === dragPosition.targetResourceId);
  if (!targetRow) {
    return null;
  }

  const laneData = laneDataByResource.get(dragPosition.targetResourceId);
  const laneCount = laneData ? Math.max(1, laneData.laneCount) : 1;
  const singleLaneHeight = targetRow.rowHeight / laneCount;

  const top = targetRow.y + LANE_PADDING_TOP;
  const height = singleLaneHeight - LANE_PADDING_TOTAL;

  const timeLabel = `${formatTime({ minutes: dragPosition.snappedStart })} \u2013 ${formatTime({ minutes: dragPosition.snappedEnd })}`;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pro-calendr-react-drag-ghost absolute rounded-md border-2 border-dashed",
        "pointer-events-none z-30 opacity-70 shadow-lg",
        typeConfig.border,
        typeConfig.bg,
      )}
      style={{ left, width, top, height }}
    >
      <div className="flex h-full min-w-0 flex-col justify-center px-2 py-1">
        <span className={cn("truncate text-[11px] font-semibold leading-tight", typeConfig.text)}>
          {booking.title}
        </span>
        <span className={cn("text-[10px]", typeConfig.sub)}>{timeLabel}</span>
      </div>
    </div>
  );
}
