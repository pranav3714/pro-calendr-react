import type { StoreApi } from "zustand/vanilla";
import type { SelectionSlice, ScheduleStore } from "../../interfaces/store-types";

interface CreateSelectionSliceParams {
  readonly set: StoreApi<ScheduleStore>["setState"];
}

export function createSelectionSlice({ set }: CreateSelectionSliceParams): SelectionSlice {
  return {
    selectedBookingId: null,
    popoverAnchor: null,

    selectBooking: ({ bookingId, anchor }) => {
      set({ selectedBookingId: bookingId, popoverAnchor: anchor });
    },

    clearSelection: () => {
      set({ selectedBookingId: null, popoverAnchor: null });
    },
  };
}
