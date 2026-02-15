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
        display: "grid",
        gridTemplateColumns: `60px repeat(${String(days.length)}, 1fr)`,
        borderBottom: "1px solid var(--cal-border)",
      }}
    >
      {/* Empty cell above time labels */}
      <div
        className="pro-calendr-react-day-header-corner"
        style={{
          borderRight: "1px solid var(--cal-border)",
        }}
      />
      {days.map((day) => {
        const isToday = isSameDay(day, now);
        return (
          <div
            key={day.toISOString()}
            className="pro-calendr-react-day-header"
            data-today={isToday || undefined}
            style={{
              textAlign: "center",
              padding: "8px 4px",
              fontSize: "var(--cal-font-size-sm)",
              color: isToday ? "var(--cal-accent)" : "var(--cal-text-muted)",
              fontWeight: isToday ? 600 : 500,
              borderRight: "1px solid var(--cal-border)",
            }}
          >
            <div>{format(day, "EEE")}</div>
            <div
              style={{
                fontSize: "var(--cal-font-size)",
                fontWeight: isToday ? 700 : 400,
                color: isToday ? "var(--cal-accent)" : "var(--cal-text)",
              }}
            >
              {format(day, "d")}
            </div>
          </div>
        );
      })}
    </div>
  );
}
