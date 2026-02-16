import { useCalendarStore } from "../components/CalendarContext";

export function useDateNavigation() {
  const currentDate = useCalendarStore((s) => s.currentDate);
  const navigateDate = useCalendarStore((s) => s.navigateDate);
  const setDate = useCalendarStore((s) => s.setDate);
  return { currentDate, navigateDate, setDate };
}
