import React, { useMemo } from "react";
import {
  getMonthDays,
  isSameDay,
  generateBookingsForDate,
  WEEKDAY_LABELS,
  BOOKING_TYPES,
} from "./scheduleData";

// ── Types ────────────────────────────────────────────────────────────────────

interface MonthViewProps {
  currentDate: Date;
  onDayClick: (day: Date) => void;
}

interface DayCounts {
  total: number;
  types: Record<string, number>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const dayKey = (d: Date): string =>
  `${String(d.getFullYear())}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// ── DayCell ──────────────────────────────────────────────────────────────────

interface DayCellProps {
  day: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  counts: DayCounts | undefined;
  onClick: (day: Date) => void;
}

const DayCell: React.FC<DayCellProps> = React.memo(function DayCell({
  day,
  isCurrentMonth,
  isToday,
  isWeekend,
  counts,
  onClick,
}) {
  const typeEntries = useMemo(() => {
    if (!counts || counts.total === 0) return [];
    return Object.entries(counts.types).sort((a, b) => b[1] - a[1]);
  }, [counts]);

  const visibleEntries = typeEntries.slice(0, 3);
  const overflow = typeEntries.length - 3;

  return (
    <button
      type="button"
      className={`min-h-[100px] border-r border-gray-200 p-2 text-left transition-colors last:border-r-0 hover:bg-gray-50 ${
        !isCurrentMonth ? "opacity-40" : ""
      } ${isWeekend && isCurrentMonth ? "bg-gray-50/60" : ""} ${
        isToday && isCurrentMonth ? "bg-blue-50/50" : ""
      }`}
      onClick={() => {
        onClick(day);
      }}
    >
      {/* Header row: date number (left) + total count (right) */}
      <div className="flex items-start justify-between">
        <span
          className={`flex items-center justify-center text-sm font-bold leading-none ${
            isToday && isCurrentMonth
              ? "h-7 w-7 rounded-full bg-blue-600 text-white"
              : "text-gray-700"
          }`}
        >
          {day.getDate()}
        </span>
        {counts && counts.total > 0 && (
          <span className="text-[10px] tabular-nums text-gray-400">{counts.total}</span>
        )}
      </div>

      {/* Booking type dots */}
      {visibleEntries.length > 0 && (
        <div className="mt-1.5 space-y-0.5">
          {visibleEntries.map(([typeKey, count]) => {
            const typeStyle = BOOKING_TYPES[typeKey];
            return (
              <div key={typeKey} className="flex items-center gap-1">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${typeStyle.dot}`} />
                <span className="text-[10px] tabular-nums text-gray-500">{count}</span>
                <span className="truncate text-[10px] lowercase text-gray-400">
                  {typeStyle.label}
                </span>
              </div>
            );
          })}
          {overflow > 0 && <div className="text-[10px] text-gray-400">+{overflow} more</div>}
        </div>
      )}
    </button>
  );
});

// ── MonthView ────────────────────────────────────────────────────────────────

const MonthView: React.FC<MonthViewProps> = ({ currentDate, onDayClick }) => {
  const today = new Date();
  const currentMonth = currentDate.getMonth();

  const monthDays = useMemo(() => getMonthDays(currentDate), [currentDate]);

  const dayCounts = useMemo(() => {
    const map = new Map<string, DayCounts>();
    for (const day of monthDays) {
      const dk = dayKey(day);
      const bookings = generateBookingsForDate(day);
      const types: Record<string, number> = {};
      for (const booking of bookings) {
        types[booking.type] = (types[booking.type] ?? 0) + 1;
      }
      map.set(dk, { total: bookings.length, types });
    }
    return map;
  }, [monthDays]);

  // Split into weeks (arrays of 7)
  const weeks = useMemo(() => {
    const result: Date[][] = [];
    for (let i = 0; i < monthDays.length; i += 7) {
      result.push(monthDays.slice(i, i + 7));
    }
    return result;
  }, [monthDays]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-white">
      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto max-w-5xl">
          {/* Day-of-week headers */}
          <div className="mb-2 grid grid-cols-7">
            {WEEKDAY_LABELS.map((label, i) => (
              <div
                key={label}
                className={`py-2 text-center text-[11px] font-semibold uppercase tracking-wider ${
                  i >= 5 ? "text-gray-300" : "text-gray-400"
                }`}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="overflow-hidden rounded-xl border border-gray-200">
            {weeks.map((week, wi) => (
              <div
                key={wi}
                className={`grid grid-cols-7 ${wi > 0 ? "border-t border-gray-200" : ""}`}
              >
                {week.map((day) => {
                  const dk = dayKey(day);
                  const isCurrentMonth = day.getMonth() === currentMonth;
                  const isToday = isSameDay(day, today);
                  const dayOfWeek = day.getDay();
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                  return (
                    <DayCell
                      key={dk}
                      day={day}
                      isCurrentMonth={isCurrentMonth}
                      isToday={isToday}
                      isWeekend={isWeekend}
                      counts={dayCounts.get(dk)}
                      onClick={onDayClick}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthView;
