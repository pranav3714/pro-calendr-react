import type { StoreApi } from "zustand/vanilla";
import type { ResourceSlice, ScheduleStore } from "../../interfaces/store-types";

interface CreateResourceSliceParams {
  readonly set: StoreApi<ScheduleStore>["setState"];
}

interface ComputeToggledSetParams {
  readonly current: Set<string>;
  readonly groupId: string;
}

function computeToggledSet({ current, groupId }: ComputeToggledSetParams): Set<string> {
  const next = new Set(current);

  if (current.has(groupId)) {
    next.delete(groupId);
    return next;
  }

  next.add(groupId);
  return next;
}

export function createResourceSlice({ set }: CreateResourceSliceParams): ResourceSlice {
  return {
    collapsedGroupIds: new Set<string>(),

    toggleGroupCollapse: ({ groupId }) => {
      set((state) => ({
        collapsedGroupIds: computeToggledSet({
          current: state.collapsedGroupIds,
          groupId,
        }),
      }));
    },

    setCollapsedGroupIds: ({ ids }) => {
      set({ collapsedGroupIds: ids });
    },
  };
}
