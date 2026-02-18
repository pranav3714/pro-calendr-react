import { format } from "date-fns";
import type { WeekDayHeaderProps } from "../../interfaces/week-view-props";
import { isSameDay } from "../../utils/date-helpers";
import { cn } from "../../utils/cn";

interface DayColumnHeaderProps {
  readonly day: Date;
  readonly isToday: boolean;
}

function DayColumnHeader({ day, isToday }: DayColumnHeaderProps) {
  const dayName = format(day, "EEE");
  const dateNumber = format(day, "d");

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center border-r border-[var(--cal-border)] py-1",
        isToday && "bg-[var(--cal-today-bg)]",
      )}
    >
      <span
        className={cn(
          "text-[10px] font-medium uppercase tracking-wider",
          isToday ? "text-[var(--cal-accent)]" : "text-[var(--cal-text-muted)]",
        )}
      >
        {dayName}
      </span>
      <span
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
          isToday ? "bg-[var(--cal-accent)] text-white" : "text-[var(--cal-text)]",
        )}
      >
        {dateNumber}
      </span>
    </div>
  );
}

export function WeekDayHeader({ days, today, sidebarWidth }: WeekDayHeaderProps) {
  return (
    <div className="sticky top-0 z-20 flex border-b border-[var(--cal-border)] bg-[var(--cal-bg)]">
      <div
        className="sticky left-0 z-30 flex shrink-0 items-center border-r border-[var(--cal-border)] bg-[var(--cal-bg)] px-3"
        style={{ width: sidebarWidth, minWidth: sidebarWidth }}
      >
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--cal-text-subtle)]">
          Resources
        </span>
      </div>
      <div className="grid flex-1 grid-cols-7">
        {days.map((day) => (
          <DayColumnHeader
            key={day.toISOString()}
            day={day}
            isToday={isSameDay({ dateA: day, dateB: today })}
          />
        ))}
      </div>
    </div>
  );
}
