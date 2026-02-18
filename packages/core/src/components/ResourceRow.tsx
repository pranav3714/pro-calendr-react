import type { ResourceRowProps } from "../interfaces/shared-component-props";
import { ResourceAvatar } from "./ResourceAvatar";

export function ResourceRow({ resource, rowHeight }: ResourceRowProps) {
  return (
    <div
      className="flex items-center gap-2 border-b border-[var(--cal-border-light)] px-3 pl-8 transition-colors hover:bg-[var(--cal-hover-bg)]"
      style={{ height: rowHeight }}
    >
      <ResourceAvatar groupId={resource.groupId} resourceName={resource.title} size="md" />
      <div className="min-w-0">
        <div className="truncate text-xs font-semibold leading-tight text-[var(--cal-text)]">
          {resource.title}
        </div>
        {resource.subtitle && (
          <div className="truncate text-[10px] leading-tight text-[var(--cal-text-subtle)]">
            {resource.subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
