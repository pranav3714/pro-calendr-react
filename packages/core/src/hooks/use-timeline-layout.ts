import { useMemo } from "react";
import type { UseTimelineLayoutParams } from "../interfaces/timeline-hook-params";
import type { TimelineLayoutResult } from "../interfaces/timeline-layout-result";
import type { RowData, GroupPosition } from "../interfaces/row-data";
import type { Booking } from "../interfaces/booking";
import type { LaneResult } from "../interfaces/lane-result";
import type { ResourceGroup } from "../interfaces/resource";
import type { LayoutConfig } from "../interfaces/layout-config";
import { groupBookingsByResource } from "../utils/group-bookings-by-resource";
import { assignLanes } from "../utils/lane-allocation";

interface BuildHoursParams {
  readonly dayStartHour: number;
  readonly dayEndHour: number;
}

function buildHoursArray({ dayStartHour, dayEndHour }: BuildHoursParams): number[] {
  const count = dayEndHour - dayStartHour + 1;
  return Array.from({ length: count }, (_, i) => dayStartHour + i);
}

interface BuildLaneDataParams {
  readonly bookingsByResource: Map<string, Booking[]>;
}

function buildLaneData({ bookingsByResource }: BuildLaneDataParams): Map<string, LaneResult> {
  const laneDataByResource = new Map<string, LaneResult>();

  for (const [resourceId, bookings] of bookingsByResource) {
    laneDataByResource.set(resourceId, assignLanes({ bookings }));
  }

  return laneDataByResource;
}

interface BuildRowsParams {
  readonly resourceGroups: readonly ResourceGroup[];
  readonly collapsedGroupIds: Set<string>;
  readonly laneDataByResource: Map<string, LaneResult>;
  readonly layoutConfig: LayoutConfig;
}

interface RowsResult {
  readonly rows: RowData[];
  readonly groupPositions: GroupPosition[];
  readonly totalHeight: number;
}

function buildRows({
  resourceGroups,
  collapsedGroupIds,
  laneDataByResource,
  layoutConfig,
}: BuildRowsParams): RowsResult {
  const rows: RowData[] = [];
  const groupPositions: GroupPosition[] = [];
  let currentY = 0;

  for (const group of resourceGroups) {
    groupPositions.push({
      groupId: group.id,
      label: group.label,
      y: currentY,
    });
    currentY += layoutConfig.groupHeaderHeight;

    if (collapsedGroupIds.has(group.id)) {
      continue;
    }

    for (const resource of group.resources) {
      const laneData = laneDataByResource.get(resource.id);
      const laneCount = Math.max(1, laneData?.laneCount ?? 0);
      const rowHeight = layoutConfig.rowHeight * laneCount;

      rows.push({
        resource,
        groupId: group.id,
        y: currentY,
        rowHeight,
        laneCount,
      });

      currentY += rowHeight;
    }
  }

  return { rows, groupPositions, totalHeight: currentY };
}

export function useTimelineLayout({
  bookings,
  resourceGroups,
  collapsedGroupIds,
  layoutConfig,
}: UseTimelineLayoutParams): TimelineLayoutResult {
  return useMemo(() => {
    const timelineWidth =
      (layoutConfig.dayEndHour - layoutConfig.dayStartHour) * layoutConfig.hourWidth;

    const hours = buildHoursArray({
      dayStartHour: layoutConfig.dayStartHour,
      dayEndHour: layoutConfig.dayEndHour,
    });

    const bookingsByResource = groupBookingsByResource({ bookings });

    const laneDataByResource = buildLaneData({ bookingsByResource });

    const { rows, groupPositions, totalHeight } = buildRows({
      resourceGroups,
      collapsedGroupIds,
      laneDataByResource,
      layoutConfig,
    });

    return {
      timelineWidth,
      hours,
      rows,
      groupPositions,
      totalHeight,
      laneDataByResource,
      bookingsByResource,
    };
  }, [bookings, resourceGroups, collapsedGroupIds, layoutConfig]);
}
