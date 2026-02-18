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
        "flex flex-col items-center justify-center border-r border-gray-200 py-1",
        isToday && "bg-blue-50",
      )}
    >
      <span
        className={cn(
          "text-[10px] font-medium uppercase tracking-wider",
          isToday ? "text-blue-600" : "text-gray-500",
        )}
      >
        {dayName}
      </span>
      <span
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
          isToday ? "bg-blue-600 text-white" : "text-gray-800",
        )}
      >
        {dateNumber}
      </span>
    </div>
  );
}

export function WeekDayHeader({ days, today, sidebarWidth }: WeekDayHeaderProps) {
  return (
    <div className="sticky top-0 z-20 flex border-b border-gray-200 bg-white">
      <div
        className="sticky left-0 z-30 flex shrink-0 items-center border-r border-gray-200 bg-white px-3"
        style={{ width: sidebarWidth, minWidth: sidebarWidth }}
      >
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
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
