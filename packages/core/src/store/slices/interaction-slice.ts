import type { StateCreator } from "zustand";
import type { Selection, DragState } from "../../types";
import type { CalendarStore } from "../calendar-store";

export interface InteractionSlice {
  selection: Selection | null;
  dragState: DragState | null;
  hoveredSlot: { date: Date; resourceId?: string } | null;

  setSelection: (selection: Selection | null) => void;
  setDragState: (state: DragState | null) => void;
  setHoveredSlot: (slot: { date: Date; resourceId?: string } | null) => void;
}

export const createInteractionSlice: StateCreator<CalendarStore, [], [], InteractionSlice> = (
  set,
) => ({
  selection: null,
  dragState: null,
  hoveredSlot: null,

  setSelection: (selection) => {
    set({ selection });
  },
  setDragState: (state) => {
    set({ dragState: state });
  },
  setHoveredSlot: (slot) => {
    set({ hoveredSlot: slot });
  },
});
