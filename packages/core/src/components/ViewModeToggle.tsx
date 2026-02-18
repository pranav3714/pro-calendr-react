import type { ViewModeToggleProps } from "../interfaces/schedule-header-props";
import type { ViewMode } from "../interfaces/view-mode";
import { cn } from "../utils/cn";
import { useScheduleStore } from "../hooks/use-schedule-store";

const VIEW_MODES: readonly { readonly mode: ViewMode; readonly label: string }[] = [
  { mode: "day", label: "Day" },
  { mode: "week", label: "Week" },
  { mode: "month", label: "Month" },
];

function getButtonClass({ isActive }: { readonly isActive: boolean }): string {
  if (isActive) {
    return "pro-calendr-react-view-toggle-btn--active bg-[var(--cal-accent)] text-white";
  }
  return "bg-[var(--cal-bg)] text-[var(--cal-text-muted)] hover:text-[var(--cal-text)]";
}

export function ViewModeToggle({ onViewModeChange }: ViewModeToggleProps) {
  const viewMode = useScheduleStore({ selector: (s) => s.viewMode });

  return (
    <div
      className="pro-calendr-react-view-toggle inline-flex overflow-hidden rounded-md border border-[var(--cal-border)]"
      role="group"
      aria-label="View mode"
    >
      {VIEW_MODES.map((item) => (
        <button
          key={item.mode}
          type="button"
          onClick={() => {
            onViewModeChange({ mode: item.mode });
          }}
          aria-pressed={viewMode === item.mode}
          className={cn(
            "px-3 py-1 text-xs font-medium transition-colors",
            "border-r border-[var(--cal-border)] last:border-r-0",
            getButtonClass({ isActive: viewMode === item.mode }),
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
