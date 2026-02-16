import { useMemo } from "react";
import {
  type Booking,
  type HelperConfig,
  type Resource,
  RESOURCE_GROUPS,
  HOUR_WIDTH,
  ROW_HEIGHT,
  GROUP_HEADER_HEIGHT,
} from "./scheduleData";
import assignBookingLanes from "./assignBookingLanes";

// ── Types ────────────────────────────────────────────────────────────────────

export interface RowData {
  resource: Resource;
  groupId: string;
  y: number;
  rowHeight: number;
  laneCount: number;
}

export interface ResourceLayoutResult {
  timelineWidth: number;
  hours: number[];
  helperConfig: HelperConfig;
  bookingsByResource: Map<string, Booking[]>;
  laneDataByResource: Map<string, { laneAssignments: Map<string, number>; laneCount: number }>;
  rows: RowData[];
  totalHeight: number;
  rowDataByResource: Map<string, RowData>;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

interface UseDayViewResourceLayoutInput {
  bookings: Booking[];
  collapsedGroups: Set<string>;
  dayStartHour: number;
  dayEndHour: number;
}

const useDayViewResourceLayout = ({
  bookings,
  collapsedGroups,
  dayStartHour,
  dayEndHour,
}: UseDayViewResourceLayoutInput): ResourceLayoutResult => {
  const timelineWidth = useMemo(
    () => (dayEndHour - dayStartHour) * HOUR_WIDTH,
    [dayStartHour, dayEndHour],
  );

  const hours = useMemo(() => {
    const result: number[] = [];
    for (let h = dayStartHour; h < dayEndHour; h++) {
      result.push(h);
    }
    return result;
  }, [dayStartHour, dayEndHour]);

  const helperConfig = useMemo<HelperConfig>(
    () => ({ dayStartHour, dayEndHour, hourWidth: HOUR_WIDTH }),
    [dayStartHour, dayEndHour],
  );

  const bookingsByResource = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const booking of bookings) {
      const list = map.get(booking.resourceId);
      if (list) {
        list.push(booking);
      } else {
        map.set(booking.resourceId, [booking]);
      }
    }
    return map;
  }, [bookings]);

  const laneDataByResource = useMemo(() => {
    const map = new Map<string, { laneAssignments: Map<string, number>; laneCount: number }>();
    for (const group of RESOURCE_GROUPS) {
      for (const resource of group.resources) {
        const resourceBookings = bookingsByResource.get(resource.id) ?? [];
        map.set(resource.id, assignBookingLanes(resourceBookings));
      }
    }
    return map;
  }, [bookingsByResource]);

  const { rows, totalHeight, rowDataByResource } = useMemo(() => {
    const rowList: RowData[] = [];
    const rowMap = new Map<string, RowData>();
    let y = 0;

    for (const group of RESOURCE_GROUPS) {
      y += GROUP_HEADER_HEIGHT;

      if (collapsedGroups.has(group.id)) {
        continue;
      }

      for (const resource of group.resources) {
        const laneData = laneDataByResource.get(resource.id);
        const laneCount = laneData?.laneCount ?? 1;
        const rowHeight = laneCount * ROW_HEIGHT;

        const row: RowData = {
          resource,
          groupId: group.id,
          y,
          rowHeight,
          laneCount,
        };
        rowList.push(row);
        rowMap.set(resource.id, row);
        y += rowHeight;
      }
    }

    return { rows: rowList, totalHeight: y, rowDataByResource: rowMap };
  }, [collapsedGroups, laneDataByResource]);

  return {
    timelineWidth,
    hours,
    helperConfig,
    bookingsByResource,
    laneDataByResource,
    rows,
    totalHeight,
    rowDataByResource,
  };
};

export default useDayViewResourceLayout;
