import { describe, it, expect } from "vitest";
import { createScheduleStore } from "../create-schedule-store";

describe("navigation slice", () => {
  describe("initial state", () => {
    it("defaults to day view when no config provided", () => {
      const store = createScheduleStore({ config: {} });
      expect(store.getState().viewMode).toBe("day");
    });

    it("defaults to current date when no config provided", () => {
      const before = new Date();
      const store = createScheduleStore({ config: {} });
      const after = new Date();
      const storeDate = store.getState().currentDate;
      expect(storeDate.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(storeDate.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("uses default view mode from config", () => {
      const store = createScheduleStore({ config: { defaultViewMode: "week" } });
      expect(store.getState().viewMode).toBe("week");
    });

    it("uses default date from config", () => {
      const date = new Date(2025, 5, 15);
      const store = createScheduleStore({ config: { defaultDate: date } });
      expect(store.getState().currentDate).toBe(date);
    });
  });

  describe("setViewMode", () => {
    it("sets view mode to week", () => {
      const store = createScheduleStore({ config: {} });
      store.getState().setViewMode({ mode: "week" });
      expect(store.getState().viewMode).toBe("week");
    });

    it("sets view mode to month", () => {
      const store = createScheduleStore({ config: {} });
      store.getState().setViewMode({ mode: "month" });
      expect(store.getState().viewMode).toBe("month");
    });

    it("sets view mode to day", () => {
      const store = createScheduleStore({ config: {} });
      store.getState().setViewMode({ mode: "month" });
      store.getState().setViewMode({ mode: "day" });
      expect(store.getState().viewMode).toBe("day");
    });
  });

  describe("setCurrentDate", () => {
    it("sets the current date", () => {
      const store = createScheduleStore({ config: {} });
      const date = new Date(2025, 11, 25);
      store.getState().setCurrentDate({ date });
      expect(store.getState().currentDate).toBe(date);
    });
  });

  describe("navigateDate", () => {
    it("moves forward one day in day view", () => {
      const date = new Date(2025, 5, 15);
      const store = createScheduleStore({ config: { defaultDate: date, defaultViewMode: "day" } });
      store.getState().navigateDate({ direction: "next" });
      expect(store.getState().currentDate.getDate()).toBe(16);
    });

    it("moves backward one day in day view", () => {
      const date = new Date(2025, 5, 15);
      const store = createScheduleStore({ config: { defaultDate: date, defaultViewMode: "day" } });
      store.getState().navigateDate({ direction: "prev" });
      expect(store.getState().currentDate.getDate()).toBe(14);
    });

    it("moves forward one week in week view", () => {
      const date = new Date(2025, 5, 15);
      const store = createScheduleStore({ config: { defaultDate: date, defaultViewMode: "week" } });
      store.getState().navigateDate({ direction: "next" });
      expect(store.getState().currentDate.getDate()).toBe(22);
    });

    it("moves backward one week in week view", () => {
      const date = new Date(2025, 5, 15);
      const store = createScheduleStore({ config: { defaultDate: date, defaultViewMode: "week" } });
      store.getState().navigateDate({ direction: "prev" });
      expect(store.getState().currentDate.getDate()).toBe(8);
    });

    it("moves forward one month in month view", () => {
      const date = new Date(2025, 5, 15);
      const store = createScheduleStore({
        config: { defaultDate: date, defaultViewMode: "month" },
      });
      store.getState().navigateDate({ direction: "next" });
      expect(store.getState().currentDate.getMonth()).toBe(6);
    });

    it("moves backward one month in month view", () => {
      const date = new Date(2025, 5, 15);
      const store = createScheduleStore({
        config: { defaultDate: date, defaultViewMode: "month" },
      });
      store.getState().navigateDate({ direction: "prev" });
      expect(store.getState().currentDate.getMonth()).toBe(4);
    });

    it("navigates to today regardless of view mode", () => {
      const date = new Date(2020, 0, 1);
      const store = createScheduleStore({ config: { defaultDate: date } });
      const before = new Date();
      store.getState().navigateDate({ direction: "today" });
      const after = new Date();
      const storeDate = store.getState().currentDate;
      expect(storeDate.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(storeDate.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });
});
