import type { StoreApi } from "zustand/vanilla";
import type { FilterSlice, ScheduleStore } from "../../interfaces/store-types";

interface CreateFilterSliceParams {
  readonly set: StoreApi<ScheduleStore>["setState"];
  readonly get: StoreApi<ScheduleStore>["getState"];
}

export function createFilterSlice({ set, get }: CreateFilterSliceParams): FilterSlice {
  return {
    activeTypeFilter: null,
    isFilterDropdownOpen: false,

    setActiveTypeFilter: ({ type }) => {
      set({ activeTypeFilter: type });
    },

    toggleFilterDropdown: () => {
      set({ isFilterDropdownOpen: !get().isFilterDropdownOpen });
    },
  };
}
