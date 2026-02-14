import { useCalendarStore } from "../store";

export function useDrag() {
  const { dragState, setDragState } = useCalendarStore();
  return {
    dragState,
    startDrag: setDragState,
    endDrag: () => { setDragState(null); },
  };
}
