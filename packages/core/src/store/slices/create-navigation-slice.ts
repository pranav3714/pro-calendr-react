import type { StoreApi } from "zustand/vanilla";
import type { NavigationSlice, ScheduleStore } from "../../interfaces/store-types";
import type { CreateScheduleStoreConfig } from "../../interfaces/store-config";
import { navigateDate as navigateDateUtil } from "../../utils/date-helpers";

interface CreateNavigationSliceParams {
  readonly set: StoreApi<ScheduleStore>["setState"];
  readonly get: StoreApi<ScheduleStore>["getState"];
  readonly config: CreateScheduleStoreConfig;
}

export function createNavigationSlice({
  set,
  get,
  config,
}: CreateNavigationSliceParams): NavigationSlice {
  return {
    viewMode: config.defaultViewMode ?? "day",
    currentDate: config.defaultDate ?? new Date(),

    setViewMode: ({ mode }) => {
      set({ viewMode: mode });
    },

    setCurrentDate: ({ date }) => {
      set({ currentDate: date });
    },

    navigateDate: ({ direction }) => {
      const { viewMode, currentDate } = get();
      const nextDate = navigateDateUtil({ date: currentDate, direction, viewMode });
      set({ currentDate: nextDate });
    },
  };
}
