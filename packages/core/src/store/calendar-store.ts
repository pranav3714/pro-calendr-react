import { create } from "zustand";
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
import type { CalendarViewType } from "../types";
import type { Selection, DragState } from "../types";
import { getDateRange } from "../utils/date-utils";

export interface CalendarStore {
  currentView: CalendarViewType;
  currentDate: Date;
  dateRange: { start: Date; end: Date };
  firstDay: number;
  selection: Selection | null;
  dragState: DragState | null;
  hoveredSlot: { date: Date; resourceId?: string } | null;
  filteredResourceIds: string[];

  setView: (view: CalendarViewType) => void;
  setDate: (date: Date) => void;
  setDateRange: (range: { start: Date; end: Date }) => void;
  setFirstDay: (firstDay: number) => void;
  setSelection: (selection: Selection | null) => void;
  setDragState: (state: DragState | null) => void;
  setHoveredSlot: (slot: { date: Date; resourceId?: string } | null) => void;
  setFilteredResourceIds: (ids: string[]) => void;
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

export const useCalendarStore = create<CalendarStore>()((set, get) => ({
  currentView: "week",
  currentDate: new Date(),
  dateRange: { start: new Date(), end: new Date() },
  firstDay: 1,
  selection: null,
  dragState: null,
  hoveredSlot: null,
  filteredResourceIds: [],

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
  setSelection: (selection) => {
    set({ selection });
  },
  setDragState: (state) => {
    set({ dragState: state });
  },
  setHoveredSlot: (slot) => {
    set({ hoveredSlot: slot });
  },
  setFilteredResourceIds: (ids) => {
    set({ filteredResourceIds: ids });
  },
  navigateDate: (direction) => {
    const { currentDate, currentView, firstDay } = get();

    const newDate =
      direction === "today" ? new Date() : navigateForView(currentDate, currentView, direction);

    const dateRange = getDateRange(newDate, currentView, firstDay);
    set({ currentDate: newDate, dateRange });
  },
}));
