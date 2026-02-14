import { useCalendarStore } from "../store";

export function useDateNavigation() {
  const { currentDate, navigateDate, setDate } = useCalendarStore();
  return { currentDate, navigateDate, setDate };
}
