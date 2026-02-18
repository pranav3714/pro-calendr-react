import type { ResourceSidebarProps } from "../interfaces/shared-component-props";
import type { VirtualItemData } from "../interfaces/virtual-item-data";
import { ResourceGroupHeader } from "./ResourceGroupHeader";
import { ResourceRow } from "./ResourceRow";

interface RenderSidebarItemParams {
  readonly itemData: VirtualItemData;
  readonly groupHeaderHeight: number;
}

function renderSidebarItem({ itemData, groupHeaderHeight }: RenderSidebarItemParams) {
  if (itemData.kind === "group-header") {
    return (
      <ResourceGroupHeader
        groupId={itemData.groupId}
        label={itemData.label}
        icon={itemData.icon}
        resourceCount={itemData.resourceCount}
        isCollapsed={itemData.isCollapsed}
        height={groupHeaderHeight}
      />
    );
  }

  return <ResourceRow resource={itemData.resource} rowHeight={itemData.rowHeight} />;
}

export function ResourceSidebar({
  sidebarWidth,
  totalSize,
  scrollMargin,
  virtualItems,
  items,
  groupHeaderHeight,
}: ResourceSidebarProps) {
  return (
    <div
      className="sticky left-0 z-10 border-r border-gray-200 bg-gray-50/80 backdrop-blur-sm"
      style={{ width: sidebarWidth, minWidth: sidebarWidth, height: totalSize }}
    >
      {virtualItems.map((virtualItem) => {
        const itemData = items[virtualItem.index];
        return (
          <div
            key={virtualItem.key}
            className="absolute left-0 w-full"
            style={{
              top: virtualItem.start - scrollMargin,
              height: virtualItem.size,
            }}
          >
            {renderSidebarItem({ itemData, groupHeaderHeight })}
          </div>
        );
      })}
    </div>
  );
}
