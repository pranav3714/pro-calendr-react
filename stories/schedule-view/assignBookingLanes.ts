import type { Booking } from "./scheduleData";

interface LaneResult {
  laneAssignments: Map<string, number>;
  laneCount: number;
}

const overlaps = (a: Booking, b: Booking): boolean =>
  a.startMinutes < b.endMinutes && a.endMinutes > b.startMinutes;

const findAvailableLane = (booking: Booking, lanes: Booking[][]): number =>
  lanes.findIndex((lane) => lane.every((existing) => !overlaps(booking, existing)));

/**
 * Assigns each booking to a vertical lane so overlapping bookings
 * stack vertically instead of rendering on top of each other.
 *
 * Uses greedy interval coloring: sort by start time, assign each
 * booking to the first lane with no time overlap.
 */
const assignBookingLanes = (bookings: Booking[]): LaneResult => {
  if (bookings.length === 0) {
    return { laneAssignments: new Map(), laneCount: 1 };
  }

  const sorted = [...bookings].sort((a, b) =>
    a.startMinutes !== b.startMinutes
      ? a.startMinutes - b.startMinutes
      : a.endMinutes - b.endMinutes,
  );

  const lanes: Booking[][] = [];
  const laneAssignments = new Map<string, number>();

  for (const booking of sorted) {
    const lane = findAvailableLane(booking, lanes);
    if (lane >= 0) {
      lanes[lane].push(booking);
      laneAssignments.set(booking.id, lane);
    } else {
      lanes.push([booking]);
      laneAssignments.set(booking.id, lanes.length - 1);
    }
  }

  return { laneAssignments, laneCount: Math.max(1, lanes.length) };
};

export default assignBookingLanes;
