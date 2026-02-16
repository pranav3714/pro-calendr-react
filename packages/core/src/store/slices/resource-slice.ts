import type { StateCreator } from "zustand";
import type { CalendarStore } from "../calendar-store";

export interface ResourceSlice {
  filteredResourceIds: string[];

  setFilteredResourceIds: (ids: string[]) => void;
}

export const createResourceSlice: StateCreator<CalendarStore, [], [], ResourceSlice> = (set) => ({
  filteredResourceIds: [],

  setFilteredResourceIds: (ids) => {
    set({ filteredResourceIds: ids });
  },
});
