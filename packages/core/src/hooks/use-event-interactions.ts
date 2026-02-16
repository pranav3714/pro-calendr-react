import { useRef, useEffect, useCallback } from "react";
import type { CalendarEvent, EventDropInfo, EventResizeInfo, DropValidationResult } from "../types";
import type { DragMode } from "../types/interaction";
import { useCalendarStore } from "../components/CalendarContext";
import { parseDate, getDurationMinutes } from "../utils/date-utils";
import { pointerToSnappedTime, pointerToColumnIndex, exceedsThreshold } from "../utils/snap";
import { DEFAULTS } from "../constants";
import { addMinutes } from "date-fns";

export interface UseEventInteractionsOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  days: Date[];
  slotHeight: number;
  slotDuration: number;
  slotMinTime: string;
  slotMaxTime: string;
  totalSlots: number;
  timeLabelsWidth: number;
  editable: boolean;
  onEventClick?: (event: CalendarEvent, nativeEvent: React.MouseEvent) => void;
  onEventDrop?: (info: EventDropInfo) => void;
  onEventResize?: (info: EventResizeInfo) => void;
  validateDrop?: (info: {
    event: CalendarEvent;
    newStart: Date;
    newEnd: Date;
    newResourceId?: string;
  }) => DropValidationResult;
}

export interface EventInteractionHandlers {
  handleEventPointerDown: (e: React.PointerEvent, event: CalendarEvent, mode: DragMode) => void;
}

const DRAG_THRESHOLD = DEFAULTS.dragThreshold;

export function useEventInteractions(
  options: UseEventInteractionsOptions,
): EventInteractionHandlers {
  const { containerRef, editable, onEventClick } = options;

  // Store actions -- individual selectors to avoid re-renders
  const startPending = useCalendarStore((s) => s.startPending);
  const startDragging = useCalendarStore((s) => s.startDragging);
  const updateDragPosition = useCalendarStore((s) => s.updateDragPosition);
  const completeDrag = useCalendarStore((s) => s.completeDrag);
  const cancelDrag = useCalendarStore((s) => s.cancelDrag);
  const phase = useCalendarStore((s) => s.dragEngine.phase);

  // Refs for intermediate state (avoids reading from store on every move)
  const lastSnappedStartRef = useRef<Date | null>(null);
  const lastSnappedEndRef = useRef<Date | null>(null);
  const initialPointerRef = useRef<{ x: number; y: number } | null>(null);
  const dragModeRef = useRef<DragMode | null>(null);
  const eventRef = useRef<CalendarEvent | null>(null);
  const originalStartRef = useRef<Date | null>(null);
  const originalEndRef = useRef<Date | null>(null);
  const originalDurationRef = useRef<number>(0);
  const phaseRef = useRef<"idle" | "pending" | "dragging">("idle");
  const capturedElementRef = useRef<HTMLElement | null>(null);
  const pointerIdRef = useRef<number | null>(null);

  // Keep phaseRef in sync with store phase
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Stable references for options that change
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const cleanup = useCallback(() => {
    // Release pointer capture if still held
    if (capturedElementRef.current && pointerIdRef.current !== null) {
      try {
        capturedElementRef.current.releasePointerCapture(pointerIdRef.current);
      } catch {
        // Pointer capture may already be released
      }
    }

    // Remove data-dragging from calendar root
    const root = capturedElementRef.current?.closest(".pro-calendr-react");
    if (root) {
      root.removeAttribute("data-dragging");
    }

    // Reset refs
    lastSnappedStartRef.current = null;
    lastSnappedEndRef.current = null;
    initialPointerRef.current = null;
    dragModeRef.current = null;
    eventRef.current = null;
    originalStartRef.current = null;
    originalEndRef.current = null;
    originalDurationRef.current = 0;
    phaseRef.current = "idle";
    capturedElementRef.current = null;
    pointerIdRef.current = null;
  }, []);

  const handleCancel = useCallback(() => {
    cancelDrag();
    cleanup();
  }, [cancelDrag, cleanup]);

  // Cancellation listeners when phase is dragging
  useEffect(() => {
    if (phase !== "dragging") return;

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleCancel();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCancel();
      }
    };

    const onContextMenu = (e: Event) => {
      e.preventDefault();
      handleCancel();
    };

    const onBlur = () => {
      handleCancel();
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
  }, [phase, handleCancel]);

  const handleEventPointerDown = useCallback(
    (e: React.PointerEvent, event: CalendarEvent, mode: DragMode) => {
      // Only primary button
      if (e.button !== 0) return;

      // Guard: not editable
      if (!editable) return;

      // Guard: for resize, check event.durationEditable
      if ((mode === "resize-start" || mode === "resize-end") && event.durationEditable === false) {
        return;
      }

      // Guard: per-event opt-out
      if (event.editable === false) return;

      e.preventDefault();

      const element = e.currentTarget as HTMLElement;
      element.setPointerCapture(e.pointerId);
      capturedElementRef.current = element;
      pointerIdRef.current = e.pointerId;

      // Store initial state in refs
      const parsedStart = parseDate(event.start);
      const parsedEnd = parseDate(event.end);
      const duration = getDurationMinutes(parsedStart, parsedEnd);

      initialPointerRef.current = { x: e.clientX, y: e.clientY };
      dragModeRef.current = mode;
      eventRef.current = event;
      originalStartRef.current = parsedStart;
      originalEndRef.current = parsedEnd;
      originalDurationRef.current = duration;
      lastSnappedStartRef.current = null;
      lastSnappedEndRef.current = null;
      phaseRef.current = "pending";

      // Update store
      startPending(
        mode,
        {
          eventId: event.id,
          start: parsedStart,
          end: parsedEnd,
          sourceElement: element,
        },
        { x: e.clientX, y: e.clientY },
      );

      // Attach pointer event handlers to the captured element
      const onPointerMove = (moveEvent: PointerEvent) => {
        const currentPhase = phaseRef.current;

        if (currentPhase === "pending") {
          if (
            initialPointerRef.current &&
            exceedsThreshold(
              { x: moveEvent.clientX, y: moveEvent.clientY },
              initialPointerRef.current,
              DRAG_THRESHOLD,
            )
          ) {
            startDragging();
            phaseRef.current = "dragging";

            // Set data-dragging on calendar root
            const root = element.closest(".pro-calendr-react");
            if (root) {
              root.setAttribute("data-dragging", "true");
            }
          }
          return;
        }

        if (currentPhase === "dragging") {
          const container = containerRef.current;
          if (!container) return;

          const containerRect = container.getBoundingClientRect();
          const scrollTop = container.scrollTop;
          const currentDays = optionsRef.current.days;
          const currentSlotHeight = optionsRef.current.slotHeight;
          const currentSlotDuration = optionsRef.current.slotDuration;
          const currentSlotMinTime = optionsRef.current.slotMinTime;
          const currentTotalSlots = optionsRef.current.totalSlots;
          const currentTimeLabelsWidth = optionsRef.current.timeLabelsWidth;

          // Determine column (day)
          const columnIndex = pointerToColumnIndex(
            moveEvent.clientX,
            containerRect,
            currentDays.length,
            currentTimeLabelsWidth,
          );
          const targetDay = currentDays[columnIndex];

          // Compute snapped time
          const snappedTime = pointerToSnappedTime(
            moveEvent.clientY,
            containerRect,
            scrollTop,
            currentSlotHeight,
            currentSlotDuration,
            currentSlotMinTime,
            currentTotalSlots,
            targetDay,
          );

          let newStart: Date;
          let newEnd: Date;

          const currentMode = dragModeRef.current;
          const origStart = originalStartRef.current ?? new Date();
          const origEnd = originalEndRef.current ?? new Date();
          const origDuration = originalDurationRef.current;

          if (currentMode === "move") {
            newStart = snappedTime;
            newEnd = addMinutes(snappedTime, origDuration);
          } else if (currentMode === "resize-start") {
            newStart = snappedTime;
            newEnd = origEnd;
            // Clamp: newStart must be before originalEnd
            if (newStart >= origEnd) {
              newStart = addMinutes(origEnd, -currentSlotDuration);
            }
          } else {
            // resize-end
            newStart = origStart;
            newEnd = addMinutes(snappedTime, currentSlotDuration);
            // Clamp: newEnd must be after originalStart
            if (newEnd <= origStart) {
              newEnd = addMinutes(origStart, currentSlotDuration);
            }
          }

          // Only update store if snapped position changed
          const startChanged = lastSnappedStartRef.current?.getTime() !== newStart.getTime();
          const endChanged = lastSnappedEndRef.current?.getTime() !== newEnd.getTime();

          if (startChanged || endChanged) {
            let isValid = true;
            let validationMessage: string | undefined;

            if (optionsRef.current.validateDrop && eventRef.current) {
              const result = optionsRef.current.validateDrop({
                event: eventRef.current,
                newStart,
                newEnd,
              });
              isValid = result.valid;
              validationMessage = result.message;
            }

            updateDragPosition(
              { date: snappedTime, x: moveEvent.clientX, y: moveEvent.clientY },
              newStart,
              newEnd,
              isValid,
              validationMessage,
            );

            lastSnappedStartRef.current = newStart;
            lastSnappedEndRef.current = newEnd;
          }
        }
      };

      const onPointerUp = (upEvent: PointerEvent) => {
        const currentPhase = phaseRef.current;

        if (currentPhase === "pending") {
          // Threshold not exceeded -- treat as click
          if (onEventClick && eventRef.current) {
            onEventClick(eventRef.current, upEvent as unknown as React.MouseEvent);
          }
          cancelDrag();
          cleanup();
        } else if (currentPhase === "dragging") {
          // Check if last position was valid
          const lastStart = lastSnappedStartRef.current;
          const lastEnd = lastSnappedEndRef.current;
          const currentMode = dragModeRef.current;
          const currentEvent = eventRef.current;
          const origStart = originalStartRef.current;
          const origEnd = originalEndRef.current;

          if (lastStart && lastEnd && currentEvent && origStart && origEnd) {
            // Run final validation
            let isValid = true;
            if (optionsRef.current.validateDrop) {
              const result = optionsRef.current.validateDrop({
                event: currentEvent,
                newStart: lastStart,
                newEnd: lastEnd,
              });
              isValid = result.valid;
            }

            if (isValid) {
              if (currentMode === "move" && optionsRef.current.onEventDrop) {
                optionsRef.current.onEventDrop({
                  event: currentEvent,
                  oldStart: origStart,
                  oldEnd: origEnd,
                  newStart: lastStart,
                  newEnd: lastEnd,
                  revert: () => {
                    // No-op: events are controlled by the consumer
                  },
                });
              } else if (
                (currentMode === "resize-start" || currentMode === "resize-end") &&
                optionsRef.current.onEventResize
              ) {
                optionsRef.current.onEventResize({
                  event: currentEvent,
                  oldStart: origStart,
                  oldEnd: origEnd,
                  newStart: lastStart,
                  newEnd: lastEnd,
                  revert: () => {
                    // No-op: events are controlled by the consumer
                  },
                });
              }
            }
          }

          completeDrag();
          cleanup();
        } else {
          cleanup();
        }

        // Remove listeners
        element.removeEventListener("pointermove", onPointerMove);
        element.removeEventListener("pointerup", onPointerUp);
      };

      element.addEventListener("pointermove", onPointerMove);
      element.addEventListener("pointerup", onPointerUp);
    },
    [
      editable,
      startPending,
      startDragging,
      updateDragPosition,
      completeDrag,
      cancelDrag,
      onEventClick,
      containerRef,
      cleanup,
    ],
  );

  return { handleEventPointerDown };
}
