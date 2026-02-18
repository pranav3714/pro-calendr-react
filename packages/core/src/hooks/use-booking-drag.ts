import { useCallback, useEffect, useRef } from "react";
import type {
  UseBookingDragParams,
  UseBookingDragResult,
} from "../interfaces/interaction-hook-params";
import type { Booking } from "../interfaces/booking";
import type { DragRefsState, ComputeGrabOffsetParams } from "../interfaces/interaction-ref-states";
import { positionToMinutes } from "../utils/time-position";
import { computeDragPosition } from "../utils/compute-drag-position";
import { useScheduleStore } from "./use-schedule-store";

function computeGrabOffset({
  clientX,
  scrollLeft,
  sidebarWidth,
  bookingStartMinutes,
  config,
}: ComputeGrabOffsetParams): number {
  const timelinePx = clientX + scrollLeft - sidebarWidth;
  const cursorMinutes = positionToMinutes({ px: timelinePx, config });
  return cursorMinutes - bookingStartMinutes;
}

export function useBookingDrag({
  layoutConfig,
  rows,
  scrollContainerRef,
  sidebarWidth,
  timeHeaderHeight,
  onBookingDrop,
}: UseBookingDragParams): UseBookingDragResult {
  const startDragPending = useScheduleStore({ selector: (s) => s.startDragPending });
  const startDragging = useScheduleStore({ selector: (s) => s.startDragging });
  const updateDragPosition = useScheduleStore({ selector: (s) => s.updateDragPosition });
  const completeDrag = useScheduleStore({ selector: (s) => s.completeDrag });
  const cancelDrag = useScheduleStore({ selector: (s) => s.cancelDrag });
  const dragPhase = useScheduleStore({ selector: (s) => s.dragPhase });

  const isDragging = dragPhase === "dragging";

  const dragRefsRef = useRef<DragRefsState | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  const cleanupListeners = useRef<(() => void) | null>(null);

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const dragRefs = dragRefsRef.current;
      if (!dragRefs) {
        return;
      }

      const dx = Math.abs(e.clientX - dragRefs.startClientX);
      const dy = Math.abs(e.clientY - dragRefs.startClientY);

      if (dx + dy < layoutConfig.dragThreshold) {
        return;
      }

      startDragPending({
        bookingId: dragRefs.bookingId,
        origin: {
          startMinutes: dragRefs.originStartMinutes,
          endMinutes: dragRefs.originEndMinutes,
          resourceId: dragRefs.originResourceId,
        },
      });
      startDragging();

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) {
          return;
        }

        const containerRect = scrollContainer.getBoundingClientRect();
        const position = computeDragPosition({
          clientX: e.clientX,
          clientY: e.clientY,
          scrollLeft: scrollContainer.scrollLeft,
          scrollTop: scrollContainer.scrollTop,
          containerTop: containerRect.top,
          sidebarWidth,
          timeHeaderHeight,
          grabOffsetMinutes: dragRefs.grabOffsetMinutes,
          duration: dragRefs.duration,
          rows: rowsRef.current,
          layoutConfig,
        });

        if (position) {
          updateDragPosition({ position });
        }
      });
    },
    [
      layoutConfig,
      scrollContainerRef,
      sidebarWidth,
      timeHeaderHeight,
      startDragPending,
      startDragging,
      updateDragPosition,
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

      const result = completeDrag();
      if (result && onBookingDrop) {
        const origin = result.origin;
        const final_ = result.finalPosition;
        onBookingDrop({
          info: {
            bookingId: result.bookingId,
            originalResourceId: origin.resourceId,
            originalStartMinutes: origin.startMinutes,
            originalEndMinutes: origin.endMinutes,
            newResourceId: final_.targetResourceId,
            newStartMinutes: final_.snappedStart,
            newEndMinutes: final_.snappedEnd,
            revert: () => {
              /* Consumer handles revert via their own state */
            },
          },
        });
      }

      if (!result) {
        cancelDrag();
      }

      dragRefsRef.current = null;

      if (cleanupListeners.current) {
        cleanupListeners.current();
        cleanupListeners.current = null;
      }
    },
    [completeDrag, cancelDrag, onBookingDrop],
  );

  const handleBookingPointerDown = useCallback(
    ({ e, booking }: { readonly e: React.PointerEvent; readonly booking: Booking }) => {
      if (e.button !== 0) {
        return;
      }

      const scrollContainer = scrollContainerRef.current;
      if (!scrollContainer) {
        return;
      }

      const grabOffset = computeGrabOffset({
        clientX: e.clientX,
        scrollLeft: scrollContainer.scrollLeft,
        sidebarWidth,
        bookingStartMinutes: booking.startMinutes,
        config: layoutConfig,
      });

      const element = e.currentTarget as HTMLElement;
      element.setPointerCapture(e.pointerId);

      dragRefsRef.current = {
        bookingId: booking.id,
        originStartMinutes: booking.startMinutes,
        originEndMinutes: booking.endMinutes,
        originResourceId: booking.resourceId,
        grabOffsetMinutes: grabOffset,
        duration: booking.endMinutes - booking.startMinutes,
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

      cleanupListeners.current = () => {
        element.removeEventListener("pointermove", onMove);
        element.removeEventListener("pointerup", onUp);
        element.removeEventListener("pointercancel", onUp);
      };
    },
    [scrollContainerRef, sidebarWidth, layoutConfig, handlePointerMove, handlePointerUp],
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

      if (cleanupListeners.current) {
        cleanupListeners.current();
        cleanupListeners.current = null;
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
  };
}
