import { useState, useCallback, useEffect, useRef } from "react";
import { addMinutes } from "date-fns";
import type { SelectInfo } from "../types";
import { useCalendarStore } from "../components/CalendarContext";
import { pointerToSnappedTime } from "../utils/snap";

export function useSelection() {
  const selection = useCalendarStore((s) => s.selection);
  const setSelection = useCalendarStore((s) => s.setSelection);
  return { selection, setSelection };
}

export interface UseSlotSelectionOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  day: Date;
  slotHeight: number;
  slotDuration: number;
  slotMinTime: string;
  slotMaxTime: string;
  totalSlots: number;
  selectable: boolean;
  onSelect?: (info: SelectInfo) => void;
}

export interface SlotSelectionState {
  isSelecting: boolean;
  selectionPixels: { startY: number; endY: number } | null;
  handleSlotPointerDown: (e: React.PointerEvent) => void;
}

export function useSlotSelection(options: UseSlotSelectionOptions): SlotSelectionState {
  const { containerRef, selectable } = options;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const setSelection = useCalendarStore((s) => s.setSelection);
  const startPending = useCalendarStore((s) => s.startPending);
  const completeDrag = useCalendarStore((s) => s.completeDrag);
  const cancelDrag = useCalendarStore((s) => s.cancelDrag);

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionPixels, setSelectionPixels] = useState<{
    startY: number;
    endY: number;
  } | null>(null);

  const isSelectingRef = useRef(false);
  const startYRef = useRef(0);
  const capturedElementRef = useRef<HTMLElement | null>(null);
  const pointerIdRef = useRef<number | null>(null);

  const cancelSelection = useCallback(() => {
    setIsSelecting(false);
    setSelectionPixels(null);
    isSelectingRef.current = false;

    if (capturedElementRef.current && pointerIdRef.current !== null) {
      try {
        capturedElementRef.current.releasePointerCapture(pointerIdRef.current);
      } catch {
        // Pointer capture may already be released
      }
    }
    capturedElementRef.current = null;
    pointerIdRef.current = null;
    cancelDrag();
  }, [cancelDrag]);

  // Cancellation listeners
  useEffect(() => {
    if (!isSelecting) return;

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        cancelSelection();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        cancelSelection();
      }
    };

    const onContextMenu = (e: Event) => {
      e.preventDefault();
      cancelSelection();
    };

    const onBlur = () => {
      cancelSelection();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("contextmenu", onContextMenu);
    window.addEventListener("blur", onBlur);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("blur", onBlur);
    };
  }, [isSelecting, cancelSelection]);

  const handleSlotPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!selectable || e.button !== 0) return;

      // Don't start selection if clicking on an event
      const target = e.target as HTMLElement;
      if (target.closest("[data-event-id]")) return;

      const container = containerRef.current;
      if (!container) return;

      e.preventDefault();
      container.setPointerCapture(e.pointerId);
      capturedElementRef.current = container;
      pointerIdRef.current = e.pointerId;

      const containerRect = container.getBoundingClientRect();
      const scrollTop = container.scrollTop;
      const relativeY = e.clientY - containerRect.top + scrollTop;

      startYRef.current = relativeY;
      isSelectingRef.current = true;
      setIsSelecting(true);
      setSelectionPixels({ startY: relativeY, endY: relativeY });

      // Start pending in the interaction slice with mode='select'
      startPending(
        "select",
        {
          eventId: "",
          start: new Date(),
          end: new Date(),
          sourceElement: container,
        },
        { x: e.clientX, y: e.clientY },
      );

      const onPointerMove = (moveEvent: PointerEvent) => {
        if (!isSelectingRef.current) return;
        const rect = container.getBoundingClientRect();
        const currentScrollTop = container.scrollTop;
        const currentY = moveEvent.clientY - rect.top + currentScrollTop;
        setSelectionPixels({ startY: startYRef.current, endY: currentY });
      };

      const onPointerUp = (upEvent: PointerEvent) => {
        if (!isSelectingRef.current) {
          container.removeEventListener("pointermove", onPointerMove);
          container.removeEventListener("pointerup", onPointerUp);
          return;
        }

        const rect = container.getBoundingClientRect();
        const currentScrollTop = container.scrollTop;
        const endY = upEvent.clientY - rect.top + currentScrollTop;

        const opts = optionsRef.current;
        const currentDay = opts.day;
        const currentSlotHeight = opts.slotHeight;
        const currentSlotDuration = opts.slotDuration;
        const currentSlotMinTime = opts.slotMinTime;
        const currentTotalSlots = opts.totalSlots;

        // Convert pixel positions to snapped times
        let startTime = pointerToSnappedTime(
          startYRef.current + rect.top - currentScrollTop,
          rect,
          currentScrollTop,
          currentSlotHeight,
          currentSlotDuration,
          currentSlotMinTime,
          currentTotalSlots,
          currentDay,
        );

        let endTime = pointerToSnappedTime(
          endY + rect.top - currentScrollTop,
          rect,
          currentScrollTop,
          currentSlotHeight,
          currentSlotDuration,
          currentSlotMinTime,
          currentTotalSlots,
          currentDay,
        );

        // Ensure start < end
        if (startTime > endTime) {
          const tmp = startTime;
          startTime = endTime;
          endTime = tmp;
        }

        // Add one slot duration to end so selection covers at least one slot
        if (startTime.getTime() === endTime.getTime()) {
          endTime = addMinutes(endTime, currentSlotDuration);
        }

        opts.onSelect?.({ start: startTime, end: endTime, allDay: false });
        setSelection({ start: startTime, end: endTime });

        // Reset
        isSelectingRef.current = false;
        setIsSelecting(false);
        setSelectionPixels(null);
        capturedElementRef.current = null;
        pointerIdRef.current = null;
        completeDrag();

        container.removeEventListener("pointermove", onPointerMove);
        container.removeEventListener("pointerup", onPointerUp);
      };

      container.addEventListener("pointermove", onPointerMove);
      container.addEventListener("pointerup", onPointerUp);
    },
    [selectable, containerRef, startPending, completeDrag, setSelection],
  );

  return { isSelecting, selectionPixels, handleSlotPointerDown };
}
