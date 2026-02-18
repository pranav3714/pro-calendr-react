import { useCallback, useRef, useState } from "react";
import type {
  UseSlotSelectionParams,
  SlotSelectionState,
  UseSlotSelectionResult,
} from "../interfaces/interaction-hook-params";
import type { ComputeSlotMinutesParams, SlotDragRefs } from "../interfaces/interaction-ref-states";
import { positionToMinutes, snapToGrid, clampMinutes } from "../utils/time-position";
import { resolveTargetResource } from "../utils/resolve-target-resource";
import { useScheduleStore } from "./use-schedule-store";

function computeSlotMinutes({
  clientX,
  scrollLeft,
  sidebarWidth,
  layoutConfig,
}: ComputeSlotMinutesParams): number {
  const timelinePx = clientX + scrollLeft - sidebarWidth;
  const config = { dayStartHour: layoutConfig.dayStartHour, hourWidth: layoutConfig.hourWidth };
  const rawMinutes = positionToMinutes({ px: timelinePx, config });
  const snapped = snapToGrid({ minutes: rawMinutes, interval: layoutConfig.snapInterval });
  return clampMinutes({ minutes: snapped, config: layoutConfig });
}

export function useSlotSelection({
  layoutConfig,
  rows,
  scrollContainerRef,
  sidebarWidth,
  timeHeaderHeight,
  currentDate,
  onSlotSelect,
}: UseSlotSelectionParams): UseSlotSelectionResult {
  const [slotSelection, setSlotSelection] = useState<SlotSelectionState | null>(null);

  const dragRefsRef = useRef<SlotDragRefs | null>(null);
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  const clearSelection = useScheduleStore({ selector: (s) => s.clearSelection });
  const dragPhase = useScheduleStore({ selector: (s) => s.dragPhase });
  const resizePhase = useScheduleStore({ selector: (s) => s.resizePhase });

  const cleanupListeners = useRef<(() => void) | null>(null);

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const dragRefs = dragRefsRef.current;
      if (!dragRefs) {
        return;
      }

      const scrollContainer = scrollContainerRef.current;
      if (!scrollContainer) {
        return;
      }

      const currentMinutes = computeSlotMinutes({
        clientX: e.clientX,
        scrollLeft: scrollContainer.scrollLeft,
        sidebarWidth,
        layoutConfig,
      });

      const startMin = Math.min(dragRefs.startMinutes, currentMinutes);
      const endMin = Math.max(dragRefs.startMinutes, currentMinutes);

      setSlotSelection({
        startMinutes: startMin,
        endMinutes: endMin,
        resourceId: dragRefs.resourceId,
      });
    },
    [layoutConfig, scrollContainerRef, sidebarWidth],
  );

  const handlePointerUp = useCallback(
    (_e: PointerEvent) => {
      const dragRefs = dragRefsRef.current;
      if (dragRefs) {
        dragRefs.captureElement.releasePointerCapture(dragRefs.pointerId);
      }

      setSlotSelection((current) => {
        if (current && onSlotSelect && current.endMinutes > current.startMinutes) {
          onSlotSelect({
            info: {
              startMinutes: current.startMinutes,
              endMinutes: current.endMinutes,
              resourceId: current.resourceId,
              date: currentDate,
            },
          });
        }
        return null;
      });

      dragRefsRef.current = null;

      if (cleanupListeners.current) {
        cleanupListeners.current();
        cleanupListeners.current = null;
      }
    },
    [currentDate, onSlotSelect],
  );

  const handleGridPointerDown = useCallback(
    ({ e }: { readonly e: React.PointerEvent }) => {
      if (e.button !== 0) {
        return;
      }

      if (dragPhase !== "idle" || resizePhase !== "idle") {
        return;
      }

      const scrollContainer = scrollContainerRef.current;
      if (!scrollContainer) {
        return;
      }

      clearSelection();

      const containerRect = scrollContainer.getBoundingClientRect();
      const relativeY =
        e.clientY - containerRect.top + scrollContainer.scrollTop - timeHeaderHeight;

      const targetResource = resolveTargetResource({ relativeY, rows: rowsRef.current });
      if (!targetResource) {
        return;
      }

      const startMinutes = computeSlotMinutes({
        clientX: e.clientX,
        scrollLeft: scrollContainer.scrollLeft,
        sidebarWidth,
        layoutConfig,
      });

      const element = e.currentTarget as HTMLElement;
      element.setPointerCapture(e.pointerId);

      dragRefsRef.current = {
        startMinutes,
        resourceId: targetResource.resourceId,
        pointerId: e.pointerId,
        captureElement: element,
      };

      setSlotSelection({
        startMinutes,
        endMinutes: startMinutes,
        resourceId: targetResource.resourceId,
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
    [
      dragPhase,
      resizePhase,
      scrollContainerRef,
      sidebarWidth,
      timeHeaderHeight,
      layoutConfig,
      clearSelection,
      handlePointerMove,
      handlePointerUp,
    ],
  );

  return {
    handleGridPointerDown,
    slotSelection,
  };
}
