import { useCalendarStore } from "../store";

export function useCalendar() {
  const store = useCalendarStore();
  return store;
}
