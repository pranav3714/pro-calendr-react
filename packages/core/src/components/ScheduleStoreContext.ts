import { createContext } from "react";
import type { StoreApi } from "zustand/vanilla";
import type { ScheduleStore } from "../interfaces/store-types";

export const ScheduleStoreContext = createContext<StoreApi<ScheduleStore> | null>(null);
