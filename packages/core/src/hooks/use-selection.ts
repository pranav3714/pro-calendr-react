import { useCalendarStore } from "../store";

export function useSelection() {
  const { selection, setSelection } = useCalendarStore();
  return { selection, setSelection };
}
