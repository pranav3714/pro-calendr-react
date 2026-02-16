import { format } from "date-fns";
import type { UseRovingGridReturn } from "../../hooks/use-roving-grid";
import { useCalendarConfig } from "../../components/CalendarContext";
import { OverflowIndicator } from "../../components/OverflowIndicator";
import { cn } from "../../utils/cn";

export interface DayCellProps {
  date: Date;
  isToday: boolean;
  isOtherMonth: boolean;
  overflowCount: number;
  onOverflowClick?: () => void;
  getCellProps?: UseRovingGridReturn["getCellProps"];
  rowIndex?: number;
  colIndex?: number;
}

export function DayCell({
  date,
  isToday,
  isOtherMonth,
  overflowCount,
  onOverflowClick,
  getCellProps,
  rowIndex = 0,
  colIndex = 0,
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
      role="gridcell"
      aria-label={format(date, "EEEE, MMMM d, yyyy")}
      {...(getCellProps ? getCellProps(rowIndex, colIndex) : {})}
    >
      <span className="pro-calendr-react-month-day-number">{format(date, "d")}</span>
      {overflowCount > 0 && <OverflowIndicator count={overflowCount} onClick={onOverflowClick} />}
    </div>
  );
}
