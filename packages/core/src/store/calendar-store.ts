import { createStore } from "zustand";
import { createNavigationSlice } from "./slices/navigation-slice";
import { createInteractionSlice } from "./slices/interaction-slice";
import { createResourceSlice } from "./slices/resource-slice";
import type { NavigationSlice } from "./slices/navigation-slice";
import type { InteractionSlice } from "./slices/interaction-slice";
import type { ResourceSlice } from "./slices/resource-slice";

export type CalendarStore = NavigationSlice & InteractionSlice & ResourceSlice;

export function createCalendarStore(initialState?: Partial<CalendarStore>) {
  return createStore<CalendarStore>()((...a) => ({
    ...createNavigationSlice(...a),
    ...createInteractionSlice(...a),
    ...createResourceSlice(...a),
    ...initialState,
  }));
}
