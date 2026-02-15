import { createContext, useContext } from "react";
import type { CalendarConfig } from "./CalendarProvider";

export const CalendarContext = createContext<CalendarConfig | null>(null);

export function useCalendarConfig(): CalendarConfig {
  const ctx = useContext(CalendarContext);
  if (!ctx) {
    throw new Error("useCalendarConfig must be used within a CalendarProvider");
  }
  return ctx;
}
