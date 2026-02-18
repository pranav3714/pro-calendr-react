import type { ResourceRowProps } from "../../interfaces/day-view-props";
import { ResourceAvatar } from "../../components/ResourceAvatar";

export function ResourceRow({ resource, rowHeight }: ResourceRowProps) {
  return (
    <div
      className="flex items-center gap-2 border-b border-gray-100 px-3 pl-8 transition-colors hover:bg-gray-50"
      style={{ height: rowHeight }}
    >
      <ResourceAvatar groupId={resource.groupId} resourceName={resource.title} size="md" />
      <div className="min-w-0">
        <div className="truncate text-xs font-semibold leading-tight text-gray-800">
          {resource.title}
        </div>
        {resource.subtitle && (
          <div className="truncate text-[10px] leading-tight text-gray-400">
            {resource.subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
