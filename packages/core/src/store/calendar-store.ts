import { create } from "zustand";
import type { CalendarViewType } from "../types";
import type { Selection, DragState } from "../types";

export interface CalendarStore {
  currentView: CalendarViewType;
  currentDate: Date;
  dateRange: { start: Date; end: Date };
  selection: Selection | null;
  dragState: DragState | null;
  hoveredSlot: { date: Date; resourceId?: string } | null;
  filteredResourceIds: string[];

  setView: (view: CalendarViewType) => void;
  setDate: (date: Date) => void;
  setDateRange: (range: { start: Date; end: Date }) => void;
  setSelection: (selection: Selection | null) => void;
  setDragState: (state: DragState | null) => void;
  setHoveredSlot: (slot: { date: Date; resourceId?: string } | null) => void;
  setFilteredResourceIds: (ids: string[]) => void;
  navigateDate: (direction: "prev" | "next" | "today") => void;
}

export const useCalendarStore = create<CalendarStore>()((set) => ({
  currentView: "week",
  currentDate: new Date(),
  dateRange: { start: new Date(), end: new Date() },
  selection: null,
  dragState: null,
  hoveredSlot: null,
  filteredResourceIds: [],

  setView: (view) => {
    set({ currentView: view });
  },
  setDate: (date) => {
    set({ currentDate: date });
  },
  setDateRange: (range) => {
    set({ dateRange: range });
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
  navigateDate: (_direction) => {
    // TODO: implement date navigation logic
  },
}));
