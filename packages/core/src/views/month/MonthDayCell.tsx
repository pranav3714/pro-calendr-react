import type { MonthDayCellProps } from "../../interfaces/month-view-props";
import { cn } from "../../utils/cn";

const MAX_VISIBLE_TYPES = 3;

function DateBadge({ date, isToday }: { readonly date: Date; readonly isToday: boolean }) {
  const dateNumber = date.getDate();

  if (isToday) {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
        {dateNumber}
      </span>
    );
  }

  return <span className="text-sm font-medium text-gray-800">{dateNumber}</span>;
}

function TotalCountBadge({ count }: { readonly count: number }) {
  if (count === 0) {
    return null;
  }

  return (
    <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-gray-500">
      {count}
    </span>
  );
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

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex flex-col gap-0.5 border-b border-r border-gray-100 p-1.5 text-left transition-colors hover:bg-gray-50",
        !isCurrentMonth && "opacity-40",
        isToday && "bg-blue-50/50",
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
            <span className="truncate text-[10px] text-gray-600">
              {indicator.count} {indicator.label}
            </span>
          </div>
        ))}
        {overflowCount > 0 && (
          <span className="text-[10px] text-gray-400">+{overflowCount} more</span>
        )}
      </div>
    </button>
  );
}
