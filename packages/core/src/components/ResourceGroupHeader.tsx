import type { ResourceGroupHeaderProps } from "../interfaces/shared-component-props";
import { ChevronIcon } from "./icons/ChevronIcon";
import { GroupIcon } from "./icons/GroupIcon";
import { useScheduleStore } from "../hooks/use-schedule-store";

export function ResourceGroupHeader({
  groupId,
  label,
  resourceCount,
  isCollapsed,
  height,
}: ResourceGroupHeaderProps) {
  const toggleGroupCollapse = useScheduleStore({
    selector: (s) => s.toggleGroupCollapse,
  });

  function handleClick(): void {
    toggleGroupCollapse({ groupId });
  }

  return (
    <button
      onClick={handleClick}
      aria-expanded={!isCollapsed}
      className="flex w-full items-center gap-2 px-3 text-left transition-colors hover:bg-[var(--cal-hover-bg)]"
      style={{ height }}
    >
      <ChevronIcon isOpen={!isCollapsed} />
      <span className="text-[var(--cal-text-muted)]">
        <GroupIcon groupId={groupId} />
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cal-text-muted)]">
        {label}
      </span>
      <span className="ml-auto text-[10px] tabular-nums text-[var(--cal-text-subtle)]">
        {resourceCount}
      </span>
    </button>
  );
}
