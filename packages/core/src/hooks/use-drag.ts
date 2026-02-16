import { useCalendarStore } from "../components/CalendarContext";

export function useDrag() {
  const dragEngine = useCalendarStore((s) => s.dragEngine);
  const startPending = useCalendarStore((s) => s.startPending);
  const startDragging = useCalendarStore((s) => s.startDragging);
  const updateDragPosition = useCalendarStore((s) => s.updateDragPosition);
  const completeDrag = useCalendarStore((s) => s.completeDrag);
  const cancelDrag = useCalendarStore((s) => s.cancelDrag);
  return { dragEngine, startPending, startDragging, updateDragPosition, completeDrag, cancelDrag };
}
