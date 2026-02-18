import type { DateNavigationProps } from "../interfaces/schedule-header-props";
import { isSameDay } from "../utils/date-helpers";
import { cn } from "../utils/cn";
import { ChevronLeftIcon } from "./icons/ChevronLeftIcon";
import { ChevronRightIcon } from "./icons/ChevronRightIcon";

function getTodayButtonClass({ isToday }: { readonly isToday: boolean }): string {
  if (isToday) {
    return "bg-[var(--cal-accent)] text-white";
  }
  return "bg-[var(--cal-bg-muted)] text-[var(--cal-text-muted)] hover:bg-[var(--cal-hover-bg)]";
}

export function DateNavigation({
  currentDate,
  dateLabel,
  onPrev,
  onNext,
  onToday,
}: DateNavigationProps) {
  const isToday = isSameDay({ dateA: currentDate, dateB: new Date() });

  return (
    <div className="pro-calendr-react-date-nav flex items-center gap-2">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onPrev}
          className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--cal-bg-muted)] text-[var(--cal-text-muted)] transition-colors hover:bg-[var(--cal-hover-bg)]"
          aria-label="Previous"
        >
          <ChevronLeftIcon />
        </button>

        <button
          type="button"
          onClick={onToday}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            getTodayButtonClass({ isToday }),
          )}
        >
          Today
        </button>

        <button
          type="button"
          onClick={onNext}
          className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--cal-bg-muted)] text-[var(--cal-text-muted)] transition-colors hover:bg-[var(--cal-hover-bg)]"
          aria-label="Next"
        >
          <ChevronRightIcon />
        </button>
      </div>

      <span
        className="min-w-[180px] text-sm font-medium text-[var(--cal-text)]"
        aria-live="polite"
        aria-atomic="true"
      >
        {dateLabel}
      </span>
    </div>
  );
}
