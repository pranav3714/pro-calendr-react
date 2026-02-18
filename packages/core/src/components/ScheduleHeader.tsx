import type { ScheduleHeaderProps } from "../interfaces/schedule-header-props";
import { DateNavigation } from "./DateNavigation";
import { ViewModeToggle } from "./ViewModeToggle";
import { FilterDropdown } from "./FilterDropdown";
import { CloseIcon } from "./icons/CloseIcon";

export function ScheduleHeader({
  bookingTypes,
  viewMode,
  currentDate,
  dateLabel,
  onPrev,
  onNext,
  onToday,
  onViewModeChange,
  onClose,
  title,
}: ScheduleHeaderProps) {
  return (
    <div className="pro-calendr-react-header flex items-center gap-3 border-b border-[var(--cal-border)] bg-[var(--cal-bg)] px-4 py-2">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--cal-text-muted)] transition-colors hover:bg-[var(--cal-hover-bg)] hover:text-[var(--cal-text)]"
          aria-label="Close"
        >
          <CloseIcon />
        </button>
      )}

      {title && <h1 className="shrink-0 text-sm font-semibold text-[var(--cal-text)]">{title}</h1>}

      <DateNavigation
        viewMode={viewMode}
        currentDate={currentDate}
        dateLabel={dateLabel}
        onPrev={onPrev}
        onNext={onNext}
        onToday={onToday}
      />

      <div className="flex-1" />

      <ViewModeToggle onViewModeChange={onViewModeChange} />

      <FilterDropdown bookingTypes={bookingTypes} />
    </div>
  );
}
