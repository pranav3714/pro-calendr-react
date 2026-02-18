import { useCallback, useEffect, useRef } from "react";
import type {
  UseBookingResizeParams,
  UseBookingResizeResult,
} from "../interfaces/interaction-hook-params";
import type { Booking } from "../interfaces/booking";
import type { ResizeEdge } from "../interfaces/resize-state";
import { computeResizePosition } from "../utils/compute-resize-position";
import { useScheduleStore } from "./use-schedule-store";

interface ResizeRefsState {
  readonly originalStart: number;
  readonly originalEnd: number;
  readonly edge: ResizeEdge;
  readonly startClientX: number;
  readonly pointerId: number;
  readonly captureElement: HTMLElement;
}

export function useBookingResize({
  layoutConfig,
  scrollContainerRef,
  sidebarWidth,
  timeHeaderHeight: _timeHeaderHeight,
  onBookingResize,
}: UseBookingResizeParams): UseBookingResizeResult {
  const startResizePending = useScheduleStore({ selector: (s) => s.startResizePending });
  const startResizing = useScheduleStore({ selector: (s) => s.startResizing });
  const updateResizePosition = useScheduleStore({ selector: (s) => s.updateResizePosition });
  const completeResize = useScheduleStore({ selector: (s) => s.completeResize });
  const cancelResize = useScheduleStore({ selector: (s) => s.cancelResize });
  const resizePhase = useScheduleStore({ selector: (s) => s.resizePhase });

  const isResizing = resizePhase === "resizing";

  const resizeRefsRef = useRef<ResizeRefsState | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const savedCursorRef = useRef<string>("");
  const cleanupListeners = useRef<(() => void) | null>(null);

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const resizeRefs = resizeRefsRef.current;
      if (!resizeRefs) {
        return;
      }

      const dx = Math.abs(e.clientX - resizeRefs.startClientX);
      if (dx < layoutConfig.resizeThreshold) {
        return;
      }

      startResizing();

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) {
          return;
        }

        const position = computeResizePosition({
          clientX: e.clientX,
          scrollLeft: scrollContainer.scrollLeft,
          sidebarWidth,
          edge: resizeRefs.edge,
          originalStart: resizeRefs.originalStart,
          originalEnd: resizeRefs.originalEnd,
          layoutConfig,
        });

        updateResizePosition({ position });
      });
    },
    [layoutConfig, scrollContainerRef, sidebarWidth, startResizing, updateResizePosition],
  );

  const handlePointerUp = useCallback(
    (_e: PointerEvent) => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      const resizeRefs = resizeRefsRef.current;
      if (resizeRefs) {
        resizeRefs.captureElement.releasePointerCapture(resizeRefs.pointerId);
      }

      document.body.style.cursor = savedCursorRef.current;

      const result = completeResize();
      if (result && onBookingResize) {
        onBookingResize({
          info: {
            bookingId: result.bookingId,
            edge: result.edge,
            originalStartMinutes: result.origin.startMinutes,
            originalEndMinutes: result.origin.endMinutes,
            newStartMinutes: result.finalPosition.snappedStart,
            newEndMinutes: result.finalPosition.snappedEnd,
            revert: () => {
              /* Consumer handles revert via their own state */
            },
          },
        });
      }

      if (!result) {
        cancelResize();
      }

      resizeRefsRef.current = null;

      if (cleanupListeners.current) {
        cleanupListeners.current();
        cleanupListeners.current = null;
      }
    },
    [completeResize, cancelResize, onBookingResize],
  );

  const handleResizePointerDown = useCallback(
    ({
      e,
      booking,
      edge,
    }: {
      readonly e: React.PointerEvent;
      readonly booking: Booking;
      readonly edge: ResizeEdge;
    }) => {
      if (e.button !== 0) {
        return;
      }

      const element = e.currentTarget as HTMLElement;
      element.setPointerCapture(e.pointerId);

      savedCursorRef.current = document.body.style.cursor;
      document.body.style.cursor = edge === "start" ? "w-resize" : "e-resize";

      resizeRefsRef.current = {
        originalStart: booking.startMinutes,
        originalEnd: booking.endMinutes,
        edge,
        startClientX: e.clientX,
        pointerId: e.pointerId,
        captureElement: element,
      };

      startResizePending({
        bookingId: booking.id,
        edge,
        origin: {
          startMinutes: booking.startMinutes,
          endMinutes: booking.endMinutes,
        },
      });

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
    [startResizePending, handlePointerMove, handlePointerUp],
  );

  useEffect(() => {
    if (resizePhase === "idle") {
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

      const resizeRefs = resizeRefsRef.current;
      if (resizeRefs) {
        resizeRefs.captureElement.releasePointerCapture(resizeRefs.pointerId);
      }

      document.body.style.cursor = savedCursorRef.current;
      cancelResize();
      resizeRefsRef.current = null;

      if (cleanupListeners.current) {
        cleanupListeners.current();
        cleanupListeners.current = null;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [resizePhase, cancelResize]);

  return {
    handleResizePointerDown,
    isResizing,
  };
}
