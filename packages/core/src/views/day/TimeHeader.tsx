import type { TimeHeaderProps } from "../../interfaces/day-view-props";
import { formatTime } from "../../utils/time-format";

interface HourMarkProps {
  readonly hour: number;
  readonly dayStartHour: number;
  readonly dayEndHour: number;
  readonly hourWidth: number;
}

function HourMark({ hour, dayStartHour, dayEndHour, hourWidth }: HourMarkProps) {
  const x = (hour - dayStartHour) * hourWidth;

  return (
    <div className="absolute bottom-0 top-0 flex flex-col justify-end" style={{ left: x }}>
      <span className="pb-1.5 pl-2 text-[11px] font-medium tabular-nums text-[var(--cal-text-muted)]">
        {formatTime({ minutes: hour * 60 })}
      </span>
      <div className="absolute bottom-0 left-0 h-2 w-px bg-[var(--cal-border)]" />
      {hour < dayEndHour && (
        <div
          className="absolute bottom-0 h-1.5 w-px bg-[var(--cal-border-light)]"
          style={{ left: hourWidth / 2 }}
        />
      )}
    </div>
  );
}

export function TimeHeader({
  hours,
  timelineWidth,
  sidebarWidth,
  hourWidth,
  dayStartHour,
  timeHeaderHeight,
}: TimeHeaderProps) {
  const dayEndHour = dayStartHour + hours.length - 1;

  return (
    <div className="sticky top-0 z-20 flex" style={{ height: timeHeaderHeight }}>
      <div
        className="sticky left-0 z-30 flex items-end border-b border-r border-[var(--cal-border)] bg-[var(--cal-bg)]"
        style={{ width: sidebarWidth, minWidth: sidebarWidth }}
      >
        <span className="px-3 pb-1 text-[10px] font-medium text-[var(--cal-text-subtle)]">
          RESOURCES
        </span>
      </div>

      <div
        className="relative flex-1 border-b border-[var(--cal-border)] bg-[var(--cal-bg)]"
        style={{ width: timelineWidth }}
      >
        {hours.map((hour) => (
          <HourMark
            key={hour}
            hour={hour}
            dayStartHour={dayStartHour}
            dayEndHour={dayEndHour}
            hourWidth={hourWidth}
          />
        ))}
      </div>
    </div>
  );
}
