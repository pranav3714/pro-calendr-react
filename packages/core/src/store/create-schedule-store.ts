import { createStore } from "zustand/vanilla";
import type { StoreApi } from "zustand/vanilla";
import type { ScheduleStore } from "../interfaces/store-types";
import type { CreateScheduleStoreConfig } from "../interfaces/store-config";
import { createNavigationSlice } from "./slices/create-navigation-slice";
import { createResourceSlice } from "./slices/create-resource-slice";
import { createFilterSlice } from "./slices/create-filter-slice";
import { createSelectionSlice } from "./slices/create-selection-slice";
import { createDragSlice } from "./slices/create-drag-slice";
import { createResizeSlice } from "./slices/create-resize-slice";

interface CreateScheduleStoreParams {
  readonly config?: CreateScheduleStoreConfig;
}

export function createScheduleStore({
  config = {},
}: CreateScheduleStoreParams): StoreApi<ScheduleStore> {
  return createStore<ScheduleStore>((set, get) => ({
    ...createNavigationSlice({ set, get, config }),
    ...createResourceSlice({ set }),
    ...createFilterSlice({ set, get }),
    ...createSelectionSlice({ set }),
    ...createDragSlice({ set, get }),
    ...createResizeSlice({ set, get }),
  }));
}
