import { useCalendarStore } from "../components/CalendarContext";

export function useSelection() {
  const selection = useCalendarStore((s) => s.selection);
  const setSelection = useCalendarStore((s) => s.setSelection);
  return { selection, setSelection };
}
