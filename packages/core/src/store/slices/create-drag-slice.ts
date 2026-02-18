import type { StoreApi } from "zustand/vanilla";
import type { DragSlice, ScheduleStore } from "../../interfaces/store-types";

interface CreateDragSliceParams {
  readonly set: StoreApi<ScheduleStore>["setState"];
  readonly get: StoreApi<ScheduleStore>["getState"];
}

const IDLE_DRAG_STATE = {
  dragPhase: "idle" as const,
  draggedBookingId: null,
  dragOrigin: null,
  dragPosition: null,
};

export function createDragSlice({ set, get }: CreateDragSliceParams): DragSlice {
  return {
    ...IDLE_DRAG_STATE,

    startDragPending: ({ bookingId, origin }) => {
      if (get().dragPhase !== "idle") {
        return;
      }
      set({
        dragPhase: "pending",
        draggedBookingId: bookingId,
        dragOrigin: origin,
        dragPosition: null,
      });
    },

    startDragging: () => {
      if (get().dragPhase !== "pending") {
        return;
      }
      set({ dragPhase: "dragging" });
    },

    updateDragPosition: ({ position }) => {
      if (get().dragPhase !== "dragging") {
        return;
      }
      set({ dragPosition: position });
    },

    completeDrag: () => {
      const state = get();

      if (state.dragPhase !== "dragging") {
        return null;
      }
      if (!state.draggedBookingId || !state.dragOrigin || !state.dragPosition) {
        return null;
      }

      const result = {
        bookingId: state.draggedBookingId,
        origin: state.dragOrigin,
        finalPosition: state.dragPosition,
      };

      set(IDLE_DRAG_STATE);
      return result;
    },

    cancelDrag: () => {
      set(IDLE_DRAG_STATE);
    },
  };
}
