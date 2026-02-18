import { useMemo } from "react";
import type { MonthViewProps } from "../../interfaces/month-view-props";
import { getMonthDays } from "../../utils/date-helpers";
import { useMonthCounts } from "../../hooks/use-month-counts";
import { useFilteredBookings } from "../../hooks/use-filtered-bookings";
import { MonthCalendarGrid } from "./MonthCalendarGrid";

export function MonthView({ bookings, bookingTypes, currentDate, onDayClick }: MonthViewProps) {
  const filteredBookings = useFilteredBookings({ bookings });
  const today = useMemo(() => new Date(), []);
  const monthDays = useMemo(() => getMonthDays({ date: currentDate }), [currentDate]);

  const counts = useMonthCounts({
    bookings: filteredBookings,
    monthDays,
  });

  return (
    <div className="flex flex-1 flex-col overflow-auto p-4">
      <div className="mx-auto w-full max-w-5xl">
        <MonthCalendarGrid
          monthDays={monthDays}
          currentDate={currentDate}
          today={today}
          counts={counts}
          bookingTypes={bookingTypes}
          onDayClick={onDayClick}
        />
      </div>
    </div>
  );
}
