import {
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  addDays,
  subDays,
  addYears,
  subYears,
} from "date-fns";
import type { StateCreator } from "zustand";
import type { CalendarViewType } from "../../types";
import { getDateRange, getToday } from "../../utils/date-utils";
import type { CalendarStore } from "../calendar-store";

export interface NavigationSlice {
  currentView: CalendarViewType;
  currentDate: Date;
  dateRange: { start: Date; end: Date };
  firstDay: number;
  timezone?: string;

  setView: (view: CalendarViewType) => void;
  setDate: (date: Date) => void;
  setDateRange: (range: { start: Date; end: Date }) => void;
  setFirstDay: (firstDay: number) => void;
  setTimezone: (timezone: string | undefined) => void;
  navigateDate: (direction: "prev" | "next" | "today") => void;
}

function navigateForView(date: Date, view: CalendarViewType, direction: "prev" | "next"): Date {
  const isPrev = direction === "prev";
  switch (view) {
    case "week":
    case "timeline-week":
      return isPrev ? subWeeks(date, 1) : addWeeks(date, 1);
    case "day":
    case "timeline-day":
      return isPrev ? subDays(date, 1) : addDays(date, 1);
    case "month":
    case "list":
    case "timeline-month":
      return isPrev ? subMonths(date, 1) : addMonths(date, 1);
    case "timeline-year":
      return isPrev ? subYears(date, 1) : addYears(date, 1);
    default:
      return isPrev ? subDays(date, 1) : addDays(date, 1);
  }
}

export const createNavigationSlice: StateCreator<CalendarStore, [], [], NavigationSlice> = (
  set,
  get,
) => ({
  currentView: "week",
  currentDate: new Date(),
  dateRange: { start: new Date(), end: new Date() },
  firstDay: 1,
  timezone: undefined,

  setView: (view) => {
    const { currentDate, firstDay } = get();
    const dateRange = getDateRange(currentDate, view, firstDay);
    set({ currentView: view, dateRange });
  },
  setDate: (date) => {
    const { currentView, firstDay } = get();
    const dateRange = getDateRange(date, currentView, firstDay);
    set({ currentDate: date, dateRange });
  },
  setDateRange: (range) => {
    set({ dateRange: range });
  },
  setFirstDay: (firstDay) => {
    const { currentDate, currentView } = get();
    const dateRange = getDateRange(currentDate, currentView, firstDay);
    set({ firstDay, dateRange });
  },
  setTimezone: (timezone) => {
    set({ timezone });
  },
  navigateDate: (direction) => {
    const { currentDate, currentView, firstDay, timezone } = get();
    const newDate =
      direction === "today"
        ? getToday(timezone)
        : navigateForView(currentDate, currentView, direction);
    const dateRange = getDateRange(newDate, currentView, firstDay);
    set({ currentDate: newDate, dateRange });
  },
});
