import { useCallback, useEffect, useRef, useState } from "react";
import type { Booking } from "../interfaces/booking";
import type {
  UseWeekCellDragParams,
  UseWeekCellDragResult,
  WeekDragTarget,
} from "../interfaces/week-cell-drag-params";
import { resolveWeekDropTarget } from "../utils/resolve-week-drop-target";
import { useScheduleStore } from "./use-schedule-store";

interface CellDragRefsState {
  readonly booking: Booking;
  readonly originDateKey: string;
  readonly originResourceId: string;
  readonly startClientX: number;
  readonly startClientY: number;
  readonly pointerId: number;
  readonly captureElement: HTMLElement;
}

export function useWeekCellDrag({
  rows,
  scrollContainerRef,
  gridRef,
  sidebarWidth,
  headerHeight,
  weekDays,
  dragThreshold,
  onBookingDrop,
}: UseWeekCellDragParams): UseWeekCellDragResult {
  const startDragPending = useScheduleStore({ selector: (s) => s.startDragPending });
  const startDragging = useScheduleStore({ selector: (s) => s.startDragging });
  const cancelDrag = useScheduleStore({ selector: (s) => s.cancelDrag });
  const dragPhase = useScheduleStore({ selector: (s) => s.dragPhase });

  const isDragging = dragPhase === "dragging";

  const dragRefsRef = useRef<CellDragRefsState | null>(null);
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const cleanupRef = useRef<(() => void) | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const hasDragStartedRef = useRef(false);
  const dropTargetRef = useRef<WeekDragTarget | null>(null);
  const onBookingDropRef = useRef(onBookingDrop);
  onBookingDropRef.current = onBookingDrop;

  const [dropTarget, setDropTarget] = useState<WeekDragTarget | null>(null);
  const [ghostPosition, setGhostPosition] = useState<{
    readonly x: number;
    readonly y: number;
  } | null>(null);
  const [draggedBooking, setDraggedBooking] = useState<Booking | null>(null);

  function updateDropTarget({ target }: { readonly target: WeekDragTarget | null }): void {
    dropTargetRef.current = target;
    setDropTarget(target);
  }

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const dragRefs = dragRefsRef.current;
      if (!dragRefs) {
        return;
      }

      const dx = Math.abs(e.clientX - dragRefs.startClientX);
      const dy = Math.abs(e.clientY - dragRefs.startClientY);

      if (!hasDragStartedRef.current && dx + dy < dragThreshold) {
        return;
      }

      if (!hasDragStartedRef.current) {
        hasDragStartedRef.current = true;
        startDragPending({
          bookingId: dragRefs.booking.id,
          origin: {
            startMinutes: dragRefs.booking.startMinutes,
            endMinutes: dragRefs.booking.endMinutes,
            resourceId: dragRefs.originResourceId,
          },
        });
        startDragging();
        setDraggedBooking(dragRefs.booking);
      }

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;

        setGhostPosition({ x: e.clientX, y: e.clientY });

        const scrollContainer = scrollContainerRef.current;
        const gridEl = gridRef.current;
        if (!scrollContainer || !gridEl) {
          return;
        }

        const gridRect = gridEl.getBoundingClientRect();
        const gridContentWidth = gridRect.width - sidebarWidth;

        const target = resolveWeekDropTarget({
          clientX: e.clientX,
          clientY: e.clientY,
          gridRect,
          scrollLeft: scrollContainer.scrollLeft,
          scrollTop: scrollContainer.scrollTop,
          sidebarWidth,
          headerHeight,
          gridContentWidth,
          weekDays,
          rows: rowsRef.current,
        });

        updateDropTarget({ target });
      });
    },
    [
      dragThreshold,
      startDragPending,
      startDragging,
      scrollContainerRef,
      gridRef,
      sidebarWidth,
      headerHeight,
      weekDays,
    ],
  );

  const handlePointerUp = useCallback(
    (_e: PointerEvent) => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      const dragRefs = dragRefsRef.current;
      if (dragRefs) {
        dragRefs.captureElement.releasePointerCapture(dragRefs.pointerId);
      }

      const currentDropTarget = dropTargetRef.current;
      const currentOnBookingDrop = onBookingDropRef.current;

      if (dragRefs && currentDropTarget && currentOnBookingDrop) {
        const hasChanged =
          currentDropTarget.dateKey !== dragRefs.originDateKey ||
          currentDropTarget.resourceId !== dragRefs.originResourceId;

        if (hasChanged) {
          currentOnBookingDrop({
            info: {
              bookingId: dragRefs.booking.id,
              originalResourceId: dragRefs.originResourceId,
              originalDate: dragRefs.originDateKey,
              newResourceId: currentDropTarget.resourceId,
              newDate: currentDropTarget.dateKey,
            },
          });
        }
      }

      cancelDrag();
      dragRefsRef.current = null;
      hasDragStartedRef.current = false;
      updateDropTarget({ target: null });
      setGhostPosition(null);
      setDraggedBooking(null);

      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    },
    [cancelDrag],
  );

  const handleBookingPointerDown = useCallback(
    ({
      e,
      booking,
      dateKey,
      resourceId,
    }: {
      readonly e: React.PointerEvent;
      readonly booking: Booking;
      readonly dateKey: string;
      readonly resourceId: string;
    }) => {
      if (e.button !== 0) {
        return;
      }

      const element = e.currentTarget as HTMLElement;
      element.setPointerCapture(e.pointerId);

      hasDragStartedRef.current = false;
      dragRefsRef.current = {
        booking,
        originDateKey: dateKey,
        originResourceId: resourceId,
        startClientX: e.clientX,
        startClientY: e.clientY,
        pointerId: e.pointerId,
        captureElement: element,
      };

      const onMove = (ev: PointerEvent): void => {
        handlePointerMove(ev);
      };
      const onUp = (ev: PointerEvent): void => {
        handlePointerUp(ev);
      };

      element.addEventListener("pointermove", onMove);
      element.addEventListener("pointerup", onUp);
      element.addEventListener("pointercancel", onUp);

      cleanupRef.current = () => {
        element.removeEventListener("pointermove", onMove);
        element.removeEventListener("pointerup", onUp);
        element.removeEventListener("pointercancel", onUp);
      };
    },
    [handlePointerMove, handlePointerUp],
  );

  useEffect(() => {
    if (dragPhase === "idle") {
      return;
    }

    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key !== "Escape") {
        return;
      }

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      const dragRefs = dragRefsRef.current;
      if (dragRefs) {
        dragRefs.captureElement.releasePointerCapture(dragRefs.pointerId);
      }

      cancelDrag();
      dragRefsRef.current = null;
      hasDragStartedRef.current = false;
      updateDropTarget({ target: null });
      setGhostPosition(null);
      setDraggedBooking(null);

      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dragPhase, cancelDrag]);

  return {
    handleBookingPointerDown,
    isDragging,
    draggedBookingId: dragRefsRef.current?.booking.id ?? null,
    dropTarget,
    ghostPosition,
    draggedBooking,
  };
}
