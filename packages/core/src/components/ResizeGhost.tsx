import type { ResizeGhostProps } from "../interfaces/ghost-props";
import { useScheduleStore } from "../hooks/use-schedule-store";
import { minutesToPosition } from "../utils/time-position";
import { formatTime } from "../utils/time-format";
import { cn } from "../utils/cn";

const LANE_PADDING_TOP = 4;
const LANE_PADDING_TOTAL = 8;

export function ResizeGhost({
  bookings,
  bookingTypes,
  layoutConfig,
  rows,
  laneDataByResource,
}: ResizeGhostProps) {
  const resizePhase = useScheduleStore({ selector: (s) => s.resizePhase });
  const resizePosition = useScheduleStore({ selector: (s) => s.resizePosition });
  const resizedBookingId = useScheduleStore({ selector: (s) => s.resizedBookingId });

  if (resizePhase !== "resizing") {
    return null;
  }

  if (!resizePosition || !resizedBookingId) {
    return null;
  }

  const booking = bookings.find((b) => b.id === resizedBookingId);
  if (!booking) {
    return null;
  }

  const typeConfig = bookingTypes[booking.type] ?? bookingTypes.flight;
  const config = { dayStartHour: layoutConfig.dayStartHour, hourWidth: layoutConfig.hourWidth };

  const left = minutesToPosition({ minutes: resizePosition.snappedStart, config });
  const right = minutesToPosition({ minutes: resizePosition.snappedEnd, config });
  const width = Math.max(right - left, 24);

  const row = rows.find((r) => r.resource.id === booking.resourceId);
  if (!row) {
    return null;
  }

  const laneData = laneDataByResource.get(booking.resourceId);
  const laneIndex = laneData?.laneAssignments.get(booking.id) ?? 0;
  const laneCount = laneData ? Math.max(1, laneData.laneCount) : 1;
  const singleLaneHeight = row.rowHeight / laneCount;

  const top = row.y + laneIndex * singleLaneHeight + LANE_PADDING_TOP;
  const height = singleLaneHeight - LANE_PADDING_TOTAL;

  const timeLabel = `${formatTime({ minutes: resizePosition.snappedStart })} \u2013 ${formatTime({ minutes: resizePosition.snappedEnd })}`;

  return (
    <div
      className={cn(
        "pro-calendr-react-resize-ghost absolute rounded-md border-2 border-dashed",
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
