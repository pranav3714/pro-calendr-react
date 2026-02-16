import type { StateCreator } from "zustand";
import type { Selection, DragEngineState, DragMode, DragOrigin, DragPosition } from "../../types";
import type { CalendarStore } from "../calendar-store";

const IDLE_DRAG_ENGINE: DragEngineState = {
  phase: "idle",
  mode: null,
  origin: null,
  current: null,
  initialPointer: null,
  isValid: true,
  snappedStart: null,
  snappedEnd: null,
};

export interface InteractionSlice {
  selection: Selection | null;
  dragEngine: DragEngineState;
  hoveredSlot: { date: Date; resourceId?: string } | null;
  focusedDate: Date | null;

  setSelection: (selection: Selection | null) => void;
  setFocusedDate: (date: Date | null) => void;
  startPending: (
    mode: DragMode,
    origin: DragOrigin,
    initialPointer: { x: number; y: number },
  ) => void;
  startDragging: () => void;
  updateDragPosition: (
    current: DragPosition,
    snappedStart: Date,
    snappedEnd: Date,
    isValid: boolean,
    validationMessage?: string,
  ) => void;
  completeDrag: () => void;
  cancelDrag: () => void;
  setHoveredSlot: (slot: { date: Date; resourceId?: string } | null) => void;
}

export const createInteractionSlice: StateCreator<CalendarStore, [], [], InteractionSlice> = (
  set,
  get,
) => ({
  selection: null,
  dragEngine: { ...IDLE_DRAG_ENGINE },
  hoveredSlot: null,
  focusedDate: null,

  setSelection: (selection) => {
    set({ selection });
  },
  setFocusedDate: (date) => {
    set({ focusedDate: date });
  },
  startPending: (mode, origin, initialPointer) => {
    set({
      dragEngine: {
        phase: "pending",
        mode,
        origin,
        current: null,
        initialPointer,
        isValid: true,
        snappedStart: null,
        snappedEnd: null,
      },
    });
  },
  startDragging: () => {
    const { dragEngine } = get();
    if (dragEngine.phase !== "pending") return;
    set({
      dragEngine: {
        ...dragEngine,
        phase: "dragging",
      },
    });
  },
  updateDragPosition: (current, snappedStart, snappedEnd, isValid, validationMessage) => {
    const { dragEngine } = get();
    if (dragEngine.phase !== "dragging") return;
    set({
      dragEngine: {
        ...dragEngine,
        current,
        snappedStart,
        snappedEnd,
        isValid,
        validationMessage,
      },
    });
  },
  completeDrag: () => {
    set({ dragEngine: { ...IDLE_DRAG_ENGINE } });
  },
  cancelDrag: () => {
    set({ dragEngine: { ...IDLE_DRAG_ENGINE } });
  },
  setHoveredSlot: (slot) => {
    set({ hoveredSlot: slot });
  },
});
