import { format } from "date-fns";
import { isSameDay } from "../../utils/date-utils";

export interface DayColumnHeadersProps {
  days: Date[];
  today?: Date;
}

export function DayColumnHeaders({ days, today }: DayColumnHeadersProps) {
  const now = today ?? new Date();

  return (
    <div
      className="pro-calendr-react-day-headers"
      style={{
        gridTemplateColumns: `var(--cal-time-label-width, 60px) repeat(${String(days.length)}, 1fr)`,
      }}
    >
      {/* Empty cell above time labels */}
      <div className="pro-calendr-react-day-header-corner" />
      {days.map((day) => {
        const isToday = isSameDay(day, now);
        return (
          <div
            key={day.toISOString()}
            className="pro-calendr-react-day-header"
            data-today={isToday || undefined}
          >
            <div>{format(day, "EEE")}</div>
            <div className="pro-calendr-react-day-header-date">{format(day, "d")}</div>
          </div>
        );
      })}
    </div>
  );
}
