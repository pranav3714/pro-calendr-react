import { useCalendarStore } from "../components/CalendarContext";

export function useDrag() {
  const dragState = useCalendarStore((s) => s.dragState);
  const setDragState = useCalendarStore((s) => s.setDragState);
  return {
    dragState,
    startDrag: setDragState,
    endDrag: () => {
      setDragState(null);
    },
  };
}
