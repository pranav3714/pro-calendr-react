import type {
  ComputeBlockPositionParams,
  BlockPosition,
  ResourceRowBlocksProps,
  ResolveLaneDataParams,
} from "../../interfaces/time-grid-internals";
import { BookingBlock } from "../../components/BookingBlock";
import { useScheduleStore } from "../../hooks/use-schedule-store";
import { minutesToPosition } from "../../utils/time-position";

const MIN_BLOCK_WIDTH = 24;
const LANE_PADDING_TOP = 4;
const LANE_PADDING_TOTAL = 8;

function resolveLaneAssignments({ laneData }: ResolveLaneDataParams): ReadonlyMap<string, number> {
  if (!laneData) {
    return new Map<string, number>();
  }
  return laneData.laneAssignments;
}

function resolveLaneCount({ laneData }: ResolveLaneDataParams): number {
  if (!laneData) {
    return 1;
  }
  return Math.max(1, laneData.laneCount);
}

function computeBlockPosition({
  booking,
  laneIndex,
  rowHeight,
  timelineWidth,
  config,
}: ComputeBlockPositionParams): BlockPosition {
  const rawLeft = minutesToPosition({ minutes: booking.startMinutes, config });
  const rawRight = minutesToPosition({ minutes: booking.endMinutes, config });
  const clampedLeft = Math.max(0, rawLeft);
  const clampedRight = Math.min(timelineWidth, rawRight);
  const clampedWidth = Math.max(clampedRight - clampedLeft, MIN_BLOCK_WIDTH);

  return {
    left: clampedLeft,
    width: clampedWidth,
    top: laneIndex * rowHeight + LANE_PADDING_TOP,
    height: rowHeight - LANE_PADDING_TOTAL,
  };
}

export function ResourceRowBlocks({
  bookings,
  laneData,
  rowHeight,
  timelineWidth,
  config,
  bookingTypes,
  onBookingClick,
  onDragStart,
  onResizeStart,
}: ResourceRowBlocksProps) {
  const draggedBookingId = useScheduleStore({ selector: (s) => s.draggedBookingId });
  const resizedBookingId = useScheduleStore({ selector: (s) => s.resizedBookingId });
  const laneAssignments = resolveLaneAssignments({ laneData });
  const laneCount = resolveLaneCount({ laneData });
  const singleLaneHeight = rowHeight / laneCount;

  return (
    <>
      {bookings.map((booking) => {
        const laneIndex = laneAssignments.get(booking.id) ?? 0;
        const typeConfig = bookingTypes[booking.type] ?? bookingTypes.flight;
        const position = computeBlockPosition({
          booking,
          laneIndex,
          rowHeight: singleLaneHeight,
          timelineWidth,
          config,
        });

        return (
          <BookingBlock
            key={booking.id}
            booking={booking}
            left={position.left}
            width={position.width}
            top={position.top}
            height={position.height}
            typeConfig={typeConfig}
            isDragTarget={draggedBookingId === booking.id}
            isResizeTarget={resizedBookingId === booking.id}
            onClick={onBookingClick}
            onDragStart={onDragStart}
            onResizeStart={onResizeStart}
          />
        );
      })}
    </>
  );
}
