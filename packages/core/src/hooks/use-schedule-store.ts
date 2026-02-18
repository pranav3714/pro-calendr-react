import { useContext } from "react";
import { useStore } from "zustand";
import type { ScheduleStore } from "../interfaces/store-types";
import { ScheduleStoreContext } from "../components/ScheduleStoreContext";

interface UseScheduleStoreParams<T> {
  readonly selector: (state: ScheduleStore) => T;
}

export function useScheduleStore<T>({ selector }: UseScheduleStoreParams<T>): T {
  const store = useContext(ScheduleStoreContext);

  if (store === null) {
    throw new Error("useScheduleStore must be used within a ScheduleProvider");
  }

  return useStore(store, selector);
}
