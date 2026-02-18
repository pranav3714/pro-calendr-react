import { getMonth } from "date-fns";
import type { MonthCalendarGridProps } from "../../interfaces/month-view-props";
import type { MonthTypeIndicator } from "../../interfaces/month-view-props";
import type { BookingTypeConfig } from "../../interfaces/booking-type";
import { isSameDay } from "../../utils/date-helpers";
import { formatDateKey } from "../../utils/format-date-key";
import { MonthDayCell } from "./MonthDayCell";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_VISIBLE_TYPES = 3;

interface BuildTypeBreakdownParams {
  readonly byType: Readonly<Record<string, number>>;
  readonly bookingTypes: Readonly<Record<string, BookingTypeConfig>>;
}

function buildTypeBreakdown({
  byType,
  bookingTypes,
}: BuildTypeBreakdownParams): readonly MonthTypeIndicator[] {
  const entries = Object.entries(byType);
  entries.sort((a, b) => b[1] - a[1]);

  return entries.map(([type, count]) => {
    const config = bookingTypes[type];
    return {
      type,
      label: config.label,
      count,
      dotClass: config.dot,
    };
  });
}

function computeOverflowCount({ totalTypes }: { readonly totalTypes: number }): number {
  if (totalTypes <= MAX_VISIBLE_TYPES) {
    return 0;
  }
  return totalTypes - MAX_VISIBLE_TYPES;
}

export function MonthCalendarGrid({
  monthDays,
  currentDate,
  today,
  counts,
  bookingTypes,
  onDayClick,
}: MonthCalendarGridProps) {
  const currentMonth = getMonth(currentDate);

  return (
    <div>
      <div className="grid grid-cols-7 border-b border-[var(--cal-border)]">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--cal-text-subtle)]"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {monthDays.map((day) => {
          const dateKey = formatDateKey({ date: day });
          const dayCounts = counts.get(dateKey);
          const total = dayCounts?.total ?? 0;
          const byType = dayCounts?.byType ?? {};
          const typeBreakdown = buildTypeBreakdown({ byType, bookingTypes });
          const totalTypes = Object.keys(byType).length;

          return (
            <MonthDayCell
              key={dateKey}
              date={day}
              isCurrentMonth={getMonth(day) === currentMonth}
              isToday={isSameDay({ dateA: day, dateB: today })}
              totalCount={total}
              typeBreakdown={typeBreakdown}
              overflowCount={computeOverflowCount({ totalTypes })}
              onDayClick={onDayClick}
            />
          );
        })}
      </div>
    </div>
  );
}
