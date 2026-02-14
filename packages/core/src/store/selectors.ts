import type { CalendarStore } from "./calendar-store";

export const selectCurrentView = (state: CalendarStore) => state.currentView;
export const selectCurrentDate = (state: CalendarStore) => state.currentDate;
export const selectDateRange = (state: CalendarStore) => state.dateRange;
export const selectSelection = (state: CalendarStore) => state.selection;
export const selectDragState = (state: CalendarStore) => state.dragState;
export const selectHoveredSlot = (state: CalendarStore) => state.hoveredSlot;
export const selectFilteredResourceIds = (state: CalendarStore) => state.filteredResourceIds;
