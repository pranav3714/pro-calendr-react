import { describe, it, expect, beforeEach } from "vitest";
import { createCalendarStore } from "../calendar-store";

describe("CalendarStore", () => {
  let store: ReturnType<typeof createCalendarStore>;

  beforeEach(() => {
    store = createCalendarStore({
      currentDate: new Date(2026, 1, 14),
      firstDay: 1,
    });
    // Trigger dateRange recalculation
    store.getState().setDate(new Date(2026, 1, 14));
  });

  describe("setView", () => {
    it("changes view and updates dateRange", () => {
      store.getState().setView("month");
      const state = store.getState();
      expect(state.currentView).toBe("month");
      // Month range starts from the week containing the first of the month
      // For Feb 2026 with Monday start, that's Jan 26 (start.getDay() should be Monday)
      expect(state.dateRange.start.getDay()).toBe(1); // Monday
    });

    it("keeps the same currentDate when switching views", () => {
      const originalDate = store.getState().currentDate;
      store.getState().setView("day");
      expect(store.getState().currentDate).toBe(originalDate);
    });
  });

  describe("setDate", () => {
    it("updates currentDate and dateRange", () => {
      const newDate = new Date(2026, 5, 15);
      store.getState().setDate(newDate);
      const state = store.getState();
      expect(state.currentDate).toBe(newDate);
      // dateRange should contain the new date
      expect(state.dateRange.start.getTime()).toBeLessThanOrEqual(newDate.getTime());
      expect(state.dateRange.end.getTime()).toBeGreaterThanOrEqual(newDate.getTime());
    });
  });

  describe("navigateDate", () => {
    describe("week view", () => {
      it("navigates to next week", () => {
        const originalDate = store.getState().currentDate.getDate();
        store.getState().navigateDate("next");
        const newDate = store.getState().currentDate;
        expect(newDate.getDate()).toBe(originalDate + 7);
      });

      it("navigates to previous week", () => {
        const originalDate = store.getState().currentDate.getDate();
        store.getState().navigateDate("prev");
        const newDate = store.getState().currentDate;
        expect(newDate.getDate()).toBe(originalDate - 7);
      });

      it("navigates to today", () => {
        store.getState().setDate(new Date(2020, 0, 1)); // go far away
        store.getState().navigateDate("today");
        const state = store.getState();
        const today = new Date();
        expect(state.currentDate.getDate()).toBe(today.getDate());
        expect(state.currentDate.getMonth()).toBe(today.getMonth());
      });
    });

    describe("day view", () => {
      it("navigates by single day", () => {
        store.getState().setView("day");
        const dateBefore = store.getState().currentDate.getDate();
        store.getState().navigateDate("next");
        expect(store.getState().currentDate.getDate()).toBe(dateBefore + 1);
      });
    });

    describe("month view", () => {
      it("navigates by month", () => {
        store.getState().setView("month");
        const monthBefore = store.getState().currentDate.getMonth();
        store.getState().navigateDate("next");
        expect(store.getState().currentDate.getMonth()).toBe(monthBefore + 1);
      });
    });

    it("always updates dateRange along with currentDate", () => {
      store.getState().navigateDate("next");
      const state = store.getState();
      expect(state.dateRange.start.getTime()).toBeLessThanOrEqual(state.currentDate.getTime());
      expect(state.dateRange.end.getTime()).toBeGreaterThanOrEqual(state.currentDate.getTime());
    });
  });

  describe("setFirstDay", () => {
    it("updates firstDay and recalculates dateRange", () => {
      store.getState().setFirstDay(0); // Sunday
      const state = store.getState();
      expect(state.firstDay).toBe(0);
      expect(state.dateRange.start.getDay()).toBe(0); // Sunday
    });
  });

  describe("selection", () => {
    it("sets and clears selection", () => {
      const sel = { start: new Date(), end: new Date() };
      store.getState().setSelection(sel);
      expect(store.getState().selection).toBe(sel);
      store.getState().setSelection(null);
      expect(store.getState().selection).toBeNull();
    });
  });

  describe("filteredResourceIds", () => {
    it("sets filtered resource IDs", () => {
      store.getState().setFilteredResourceIds(["r1", "r2"]);
      expect(store.getState().filteredResourceIds).toEqual(["r1", "r2"]);
    });
  });
});
