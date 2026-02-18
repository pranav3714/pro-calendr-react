import type { StoreApi } from "zustand/vanilla";
import type { ResizeSlice, ScheduleStore } from "../../interfaces/store-types";

interface CreateResizeSliceParams {
  readonly set: StoreApi<ScheduleStore>["setState"];
  readonly get: StoreApi<ScheduleStore>["getState"];
}

const IDLE_RESIZE_STATE = {
  resizePhase: "idle" as const,
  resizedBookingId: null,
  resizeEdge: null,
  resizeOrigin: null,
  resizePosition: null,
};

export function createResizeSlice({ set, get }: CreateResizeSliceParams): ResizeSlice {
  return {
    ...IDLE_RESIZE_STATE,

    startResizePending: ({ bookingId, edge, origin }) => {
      if (get().resizePhase !== "idle") {
        return;
      }
      set({
        resizePhase: "pending",
        resizedBookingId: bookingId,
        resizeEdge: edge,
        resizeOrigin: origin,
        resizePosition: null,
      });
    },

    startResizing: () => {
      if (get().resizePhase !== "pending") {
        return;
      }
      set({ resizePhase: "resizing" });
    },

    updateResizePosition: ({ position }) => {
      if (get().resizePhase !== "resizing") {
        return;
      }
      set({ resizePosition: position });
    },

    completeResize: () => {
      const state = get();

      if (state.resizePhase !== "resizing") {
        return null;
      }
      if (
        !state.resizedBookingId ||
        !state.resizeEdge ||
        !state.resizeOrigin ||
        !state.resizePosition
      ) {
        return null;
      }

      const result = {
        bookingId: state.resizedBookingId,
        edge: state.resizeEdge,
        origin: state.resizeOrigin,
        finalPosition: state.resizePosition,
      };

      set(IDLE_RESIZE_STATE);
      return result;
    },

    cancelResize: () => {
      set(IDLE_RESIZE_STATE);
    },
  };
}
