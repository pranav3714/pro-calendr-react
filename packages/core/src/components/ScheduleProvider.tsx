import { useEffect, useRef } from "react";
import type { StoreApi } from "zustand/vanilla";
import type { ScheduleStore } from "../interfaces/store-types";
import type { ScheduleProviderProps } from "../interfaces/store-config";
import type { ViewMode } from "../interfaces/view-mode";
import { createScheduleStore } from "../store/create-schedule-store";
import { ScheduleStoreContext } from "./ScheduleStoreContext";

interface UseSyncViewModeParams {
  readonly store: StoreApi<ScheduleStore>;
  readonly defaultViewMode: ViewMode | undefined;
}

function useSyncDefaultViewMode({ store, defaultViewMode }: UseSyncViewModeParams): void {
  useEffect(() => {
    if (defaultViewMode === undefined) {
      return;
    }
    store.setState({ viewMode: defaultViewMode });
  }, [store, defaultViewMode]);
}

interface UseSyncDateParams {
  readonly store: StoreApi<ScheduleStore>;
  readonly defaultDate: Date | undefined;
}

function useSyncDefaultDate({ store, defaultDate }: UseSyncDateParams): void {
  useEffect(() => {
    if (defaultDate === undefined) {
      return;
    }
    store.setState({ currentDate: defaultDate });
  }, [store, defaultDate]);
}

export function ScheduleProvider({
  children,
  defaultViewMode,
  defaultDate,
}: ScheduleProviderProps) {
  const storeRef = useRef<StoreApi<ScheduleStore> | null>(null);

  storeRef.current ??= createScheduleStore({
    config: { defaultViewMode, defaultDate },
  });

  useSyncDefaultViewMode({ store: storeRef.current, defaultViewMode });
  useSyncDefaultDate({ store: storeRef.current, defaultDate });

  return (
    <ScheduleStoreContext.Provider value={storeRef.current}>
      {children}
    </ScheduleStoreContext.Provider>
  );
}
