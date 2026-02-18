import { format } from "date-fns";
import type {
  MonthDayCellProps,
  BuildCountSuffixParams,
  ResolveAriaCurrentParams,
} from "../../interfaces/month-view-props";
import { cn } from "../../utils/cn";

const MAX_VISIBLE_TYPES = 3;

function DateBadge({ date, isToday }: { readonly date: Date; readonly isToday: boolean }) {
  const dateNumber = date.getDate();

  if (isToday) {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--cal-accent)] text-xs font-bold text-white">
        {dateNumber}
      </span>
    );
  }

  return <span className="text-sm font-medium text-[var(--cal-text)]">{dateNumber}</span>;
}

function TotalCountBadge({ count }: { readonly count: number }) {
  if (count === 0) {
    return null;
  }

  return (
    <span className="rounded-full bg-[var(--cal-bg-muted)] px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-[var(--cal-text-muted)]">
      {count}
    </span>
  );
}

function buildCountSuffix({ totalCount }: BuildCountSuffixParams): string {
  if (totalCount <= 0) {
    return "";
  }
  return `, ${String(totalCount)} bookings`;
}

function resolveAriaCurrent({ isToday }: ResolveAriaCurrentParams): "date" | undefined {
  if (isToday) {
    return "date";
  }
  return undefined;
}

export function MonthDayCell({
  date,
  isCurrentMonth,
  isToday,
  totalCount,
  typeBreakdown,
  overflowCount,
  onDayClick,
}: MonthDayCellProps) {
  const visibleTypes = typeBreakdown.slice(0, MAX_VISIBLE_TYPES);

  function handleClick(): void {
    if (!onDayClick) {
      return;
    }
    onDayClick({ date });
  }

  const dateLabel = format(date, "EEEE, MMMM d, yyyy");
  const countSuffix = buildCountSuffix({ totalCount });

  return (
    <button
      onClick={handleClick}
      aria-label={`${dateLabel}${countSuffix}`}
      aria-current={resolveAriaCurrent({ isToday })}
      className={cn(
        "flex flex-col gap-0.5 border-b border-r border-[var(--cal-border-light)] p-1.5 text-left transition-colors hover:bg-[var(--cal-hover-bg)]",
        !isCurrentMonth && "opacity-40",
        isToday && "bg-[var(--cal-today-bg)]",
      )}
      style={{ minHeight: 100 }}
    >
      <div className="flex items-start justify-between">
        <DateBadge date={date} isToday={isToday} />
        <TotalCountBadge count={totalCount} />
      </div>

      <div className="mt-1 flex flex-col gap-0.5">
        {visibleTypes.map((indicator) => (
          <div key={indicator.type} className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 shrink-0 rounded-full", indicator.dotClass)} />
            <span className="truncate text-[10px] text-[var(--cal-text-muted)]">
              {indicator.count} {indicator.label}
            </span>
          </div>
        ))}
        {overflowCount > 0 && (
          <span className="text-[10px] text-[var(--cal-text-subtle)]">+{overflowCount} more</span>
        )}
      </div>
    </button>
  );
}
