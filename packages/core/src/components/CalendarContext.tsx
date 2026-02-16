import { createContext, useContext } from "react";
import { useStore, type StoreApi } from "zustand";
import type { CalendarStore } from "../store/calendar-store";
import type { CalendarConfig } from "./CalendarProvider";

// Context for Zustand store API (stable, never re-creates)
export const CalendarStoreContext = createContext<StoreApi<CalendarStore> | null>(null);

// Context for config props (events, callbacks, render slots)
export const CalendarConfigContext = createContext<CalendarConfig | null>(null);

// Consumer hook -- REQUIRES selector for atomic re-renders
export function useCalendarStore<T>(selector: (state: CalendarStore) => T): T {
  const store = useContext(CalendarStoreContext);
  if (!store) {
    throw new Error("useCalendarStore must be used within a CalendarProvider");
  }
  return useStore(store, selector);
}

export function useCalendarConfig(): CalendarConfig {
  const ctx = useContext(CalendarConfigContext);
  if (!ctx) {
    throw new Error("useCalendarConfig must be used within a CalendarProvider");
  }
  return ctx;
}
