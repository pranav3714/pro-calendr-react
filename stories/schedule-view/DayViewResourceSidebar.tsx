import React from "react";
import { RESOURCE_GROUPS, SIDEBAR_WIDTH, GROUP_HEADER_HEIGHT, ROW_HEIGHT } from "./scheduleData";
import { ChevronIcon, GroupIcons, ResourceAvatar } from "./scheduleIcons";
import type { RowData } from "./useDayViewResourceLayout";

// ── Props ────────────────────────────────────────────────────────────────────

interface DayViewResourceSidebarProps {
  collapsedGroups: Set<string>;
  onToggleGroup: (groupId: string) => void;
  rowDataByResource: Map<string, RowData>;
  hoveredRow: string | null;
}

// ── Component ────────────────────────────────────────────────────────────────

const DayViewResourceSidebar: React.FC<DayViewResourceSidebarProps> = React.memo(
  function DayViewResourceSidebar({
    collapsedGroups,
    onToggleGroup,
    rowDataByResource,
    hoveredRow,
  }) {
    return (
      <div
        className="sticky left-0 z-10 shrink-0 border-r border-gray-200 bg-gray-50/80 backdrop-blur-sm"
        style={{ width: SIDEBAR_WIDTH }}
      >
        {RESOURCE_GROUPS.map((group) => {
          const isCollapsed = collapsedGroups.has(group.id);

          return (
            <div key={group.id}>
              {/* Group header */}
              <button
                type="button"
                className="flex w-full items-center gap-2 border-b border-gray-200 bg-gray-100/80 px-3 text-left hover:bg-gray-100"
                style={{ height: GROUP_HEADER_HEIGHT }}
                onClick={() => {
                  onToggleGroup(group.id);
                }}
              >
                <ChevronIcon className="h-3.5 w-3.5 text-gray-400" open={!isCollapsed} />
                <span className="flex items-center gap-1.5 text-gray-500">
                  {GroupIcons[group.id]}
                </span>
                <span className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
                  {group.label}
                </span>
                <span className="ml-auto text-[10px] tabular-nums text-gray-400">
                  {group.resources.length}
                </span>
              </button>

              {/* Resource rows */}
              {!isCollapsed &&
                group.resources.map((resource) => {
                  const rowData = rowDataByResource.get(resource.id);
                  const rowHeight = rowData?.rowHeight ?? ROW_HEIGHT;
                  const isHovered = hoveredRow === resource.id;

                  return (
                    <div
                      key={resource.id}
                      className={`flex items-center gap-2.5 border-b border-gray-100 px-3 transition-colors duration-100 ${
                        isHovered ? "bg-blue-50/60" : ""
                      }`}
                      style={{ height: rowHeight }}
                    >
                      <ResourceAvatar groupId={group.id} resourceName={resource.name} />
                      <div className="min-w-0">
                        <div className="truncate text-[12px] font-semibold text-gray-700">
                          {resource.name}
                        </div>
                        <div className="truncate text-[10px] text-gray-400">
                          {resource.subLabel}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>
    );
  },
);

export default DayViewResourceSidebar;
