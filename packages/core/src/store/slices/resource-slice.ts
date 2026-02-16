import type { StateCreator } from "zustand";
import type { CalendarStore } from "../calendar-store";

export interface ResourceSlice {
  filteredResourceIds: string[];
  collapsedGroupIds: string[];

  setFilteredResourceIds: (ids: string[]) => void;
  toggleGroupCollapse: (groupId: string) => void;
  setCollapsedGroupIds: (ids: string[]) => void;
}

export const createResourceSlice: StateCreator<CalendarStore, [], [], ResourceSlice> = (
  set,
  get,
) => ({
  filteredResourceIds: [],
  collapsedGroupIds: [],

  setFilteredResourceIds: (ids) => {
    set({ filteredResourceIds: ids });
  },

  toggleGroupCollapse: (groupId) => {
    const current = get().collapsedGroupIds;
    if (current.includes(groupId)) {
      set({ collapsedGroupIds: current.filter((id) => id !== groupId) });
    } else {
      set({ collapsedGroupIds: [...current, groupId] });
    }
  },

  setCollapsedGroupIds: (ids) => {
    set({ collapsedGroupIds: ids });
  },
});
