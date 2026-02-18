import type { Booking } from "../interfaces/booking";
import type { LaneResult } from "../interfaces/lane-result";

interface AssignLanesParams {
  readonly bookings: readonly Booking[];
}

export function assignLanes({ bookings }: AssignLanesParams): LaneResult {
  if (bookings.length === 0) {
    return { laneAssignments: new Map(), laneCount: 0 };
  }

  const sorted = [...bookings].sort(comparByStartThenEnd);
  const lanes: Booking[][] = [];
  const laneAssignments = new Map<string, number>();

  for (const booking of sorted) {
    const laneIndex = findAvailableLane({ lanes, booking });
    assignToLane({ lanes, laneIndex, booking, laneAssignments });
  }

  return { laneAssignments, laneCount: lanes.length };
}

function comparByStartThenEnd(a: Booking, b: Booking): number {
  if (a.startMinutes !== b.startMinutes) {
    return a.startMinutes - b.startMinutes;
  }
  return a.endMinutes - b.endMinutes;
}

interface FindAvailableLaneParams {
  readonly lanes: Booking[][];
  readonly booking: Booking;
}

function findAvailableLane({ lanes, booking }: FindAvailableLaneParams): number {
  for (let i = 0; i < lanes.length; i++) {
    const lastInLane = lanes[i][lanes[i].length - 1];
    if (lastInLane.endMinutes <= booking.startMinutes) {
      return i;
    }
  }
  return lanes.length;
}

interface AssignToLaneParams {
  readonly lanes: Booking[][];
  readonly laneIndex: number;
  readonly booking: Booking;
  readonly laneAssignments: Map<string, number>;
}

function assignToLane({ lanes, laneIndex, booking, laneAssignments }: AssignToLaneParams): void {
  if (laneIndex === lanes.length) {
    lanes.push([]);
  }
  lanes[laneIndex].push(booking);
  laneAssignments.set(booking.id, laneIndex);
}
