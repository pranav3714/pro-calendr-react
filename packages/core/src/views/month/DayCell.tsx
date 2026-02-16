import { format } from "date-fns";
import { useCalendarConfig } from "../../components/CalendarContext";
import { OverflowIndicator } from "../../components/OverflowIndicator";
import { cn } from "../../utils/cn";

export interface DayCellProps {
  date: Date;
  isToday: boolean;
  isOtherMonth: boolean;
  overflowCount: number;
  onOverflowClick?: () => void;
}

export function DayCell({
  date,
  isToday,
  isOtherMonth,
  overflowCount,
  onOverflowClick,
}: DayCellProps) {
  const { classNames } = useCalendarConfig();

  return (
    <div
      className={cn(
        "pro-calendr-react-month-day-cell",
        classNames?.dayCell,
        isToday && classNames?.dayCellToday,
        isOtherMonth && classNames?.dayCellOtherMonth,
      )}
      data-today={isToday || undefined}
      data-other-month={isOtherMonth || undefined}
    >
      <span className="pro-calendr-react-month-day-number">{format(date, "d")}</span>
      {overflowCount > 0 && (
        <OverflowIndicator count={overflowCount} onClick={onOverflowClick} />
      )}
    </div>
  );
}
