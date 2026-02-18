import { useCallback } from "react";
import type { StatsBarProps } from "../interfaces/stats-bar-props";
import { cn } from "../utils/cn";
import { useBookingStats } from "../hooks/use-booking-stats";
import { useScheduleStore } from "../hooks/use-schedule-store";

function getPillClass({
  isActive,
  badgeClass,
  ringClass,
}: {
  readonly isActive: boolean;
  readonly badgeClass: string;
  readonly ringClass: string;
}): string {
  if (isActive) {
    return cn(badgeClass, "ring-1 ring-offset-1", ringClass);
  }
  return "bg-[var(--cal-bg-muted)] text-[var(--cal-text-muted)] hover:bg-[var(--cal-hover-bg)]";
}

export function StatsBar({ bookings, bookingTypes }: StatsBarProps) {
  const stats = useBookingStats({ bookings, bookingTypes });

  const activeTypeFilter = useScheduleStore({
    selector: (s) => s.activeTypeFilter,
  });
  const setActiveTypeFilter = useScheduleStore({
    selector: (s) => s.setActiveTypeFilter,
  });

  const resolveNextFilter = useCallback(
    ({ type }: { readonly type: string }): string | null => {
      if (activeTypeFilter === type) {
        return null;
      }
      return type;
    },
    [activeTypeFilter],
  );

  const handlePillClick = useCallback(
    ({ type }: { readonly type: string }) => {
      setActiveTypeFilter({ type: resolveNextFilter({ type }) });
    },
    [resolveNextFilter, setActiveTypeFilter],
  );

  return (
    <div className="pro-calendr-react-stats-bar flex items-center gap-2 border-b border-[var(--cal-border)] bg-[var(--cal-bg-subtle)] px-4 py-1.5">
      <span className="shrink-0 text-xs font-medium text-[var(--cal-text-muted)]">
        {stats.totalCount} bookings
      </span>

      <span className="h-3 w-px shrink-0 bg-[var(--cal-border)]" />

      <div className="flex items-center gap-1.5 overflow-x-auto">
        {stats.pills.map((pill) => (
          <button
            key={pill.type}
            type="button"
            onClick={() => {
              handlePillClick({ type: pill.type });
            }}
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors",
              getPillClass({
                isActive: pill.isActive,
                badgeClass: pill.badgeClass,
                ringClass: pill.ringClass,
              }),
            )}
          >
            <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", pill.dotClass)} />
            {pill.count} {pill.label}
          </button>
        ))}
      </div>
    </div>
  );
}
