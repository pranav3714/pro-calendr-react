import type { CalendarStore } from "./calendar-store";

export const selectCurrentView = (state: CalendarStore) => state.currentView;
export const selectCurrentDate = (state: CalendarStore) => state.currentDate;
export const selectDateRange = (state: CalendarStore) => state.dateRange;
export const selectSelection = (state: CalendarStore) => state.selection;
export const selectDragEngine = (state: CalendarStore) => state.dragEngine;
export const selectHoveredSlot = (state: CalendarStore) => state.hoveredSlot;
export const selectFilteredResourceIds = (state: CalendarStore) => state.filteredResourceIds;
