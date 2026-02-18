import { describe, it, expect } from "vitest";
import { createScheduleStore } from "../create-schedule-store";

describe("resource slice", () => {
  describe("initial state", () => {
    it("starts with empty collapsed group ids", () => {
      const store = createScheduleStore({ config: {} });
      expect(store.getState().collapsedGroupIds.size).toBe(0);
    });
  });

  describe("toggleGroupCollapse", () => {
    it("adds a group id to collapsed set", () => {
      const store = createScheduleStore({ config: {} });
      store.getState().toggleGroupCollapse({ groupId: "aircraft" });
      expect(store.getState().collapsedGroupIds.has("aircraft")).toBe(true);
    });

    it("removes a group id from collapsed set when already present", () => {
      const store = createScheduleStore({ config: {} });
      store.getState().toggleGroupCollapse({ groupId: "aircraft" });
      store.getState().toggleGroupCollapse({ groupId: "aircraft" });
      expect(store.getState().collapsedGroupIds.has("aircraft")).toBe(false);
    });

    it("handles multiple toggles correctly", () => {
      const store = createScheduleStore({ config: {} });
      store.getState().toggleGroupCollapse({ groupId: "aircraft" });
      store.getState().toggleGroupCollapse({ groupId: "instructors" });
      expect(store.getState().collapsedGroupIds.size).toBe(2);
      store.getState().toggleGroupCollapse({ groupId: "aircraft" });
      expect(store.getState().collapsedGroupIds.size).toBe(1);
      expect(store.getState().collapsedGroupIds.has("instructors")).toBe(true);
    });

    it("does not affect other collapsed group ids", () => {
      const store = createScheduleStore({ config: {} });
      store.getState().toggleGroupCollapse({ groupId: "aircraft" });
      store.getState().toggleGroupCollapse({ groupId: "instructors" });
      store.getState().toggleGroupCollapse({ groupId: "aircraft" });
      expect(store.getState().collapsedGroupIds.has("instructors")).toBe(true);
      expect(store.getState().collapsedGroupIds.has("aircraft")).toBe(false);
    });
  });

  describe("setCollapsedGroupIds", () => {
    it("replaces the entire collapsed set", () => {
      const store = createScheduleStore({ config: {} });
      store.getState().toggleGroupCollapse({ groupId: "aircraft" });
      const newSet = new Set(["instructors", "rooms"]);
      store.getState().setCollapsedGroupIds({ ids: newSet });
      expect(store.getState().collapsedGroupIds).toBe(newSet);
      expect(store.getState().collapsedGroupIds.has("aircraft")).toBe(false);
    });

    it("clears all when given empty set", () => {
      const store = createScheduleStore({ config: {} });
      store.getState().toggleGroupCollapse({ groupId: "aircraft" });
      store.getState().setCollapsedGroupIds({ ids: new Set() });
      expect(store.getState().collapsedGroupIds.size).toBe(0);
    });
  });
});
