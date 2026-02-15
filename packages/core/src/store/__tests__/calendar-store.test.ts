import { describe, it, expect, beforeEach } from "vitest";
import { useCalendarStore } from "../calendar-store";

describe("CalendarStore", () => {
  beforeEach(() => {
    // Reset store between tests
    useCalendarStore.setState({
      currentView: "week",
      currentDate: new Date(2026, 1, 14), // Feb 14, 2026 (Saturday)
      firstDay: 1,
    });
    // Trigger dateRange recalculation
    useCalendarStore.getState().setDate(new Date(2026, 1, 14));
  });

  describe("setView", () => {
    it("changes view and updates dateRange", () => {
      const store = useCalendarStore.getState();
      store.setView("month");
      const state = useCalendarStore.getState();
      expect(state.currentView).toBe("month");
      // Month range starts from the week containing the first of the month
      // For Feb 2026 with Monday start, that's Jan 26 (start.getDay() should be Monday)
      expect(state.dateRange.start.getDay()).toBe(1); // Monday
    });

    it("keeps the same currentDate when switching views", () => {
      const store = useCalendarStore.getState();
      const originalDate = store.currentDate;
      store.setView("day");
      expect(useCalendarStore.getState().currentDate).toBe(originalDate);
    });
  });

  describe("setDate", () => {
    it("updates currentDate and dateRange", () => {
      const store = useCalendarStore.getState();
      const newDate = new Date(2026, 5, 15);
      store.setDate(newDate);
      const state = useCalendarStore.getState();
      expect(state.currentDate).toBe(newDate);
      // dateRange should contain the new date
      expect(state.dateRange.start.getTime()).toBeLessThanOrEqual(newDate.getTime());
      expect(state.dateRange.end.getTime()).toBeGreaterThanOrEqual(newDate.getTime());
    });
  });

  describe("navigateDate", () => {
    describe("week view", () => {
      it("navigates to next week", () => {
        const store = useCalendarStore.getState();
        const originalDate = store.currentDate.getDate();
        store.navigateDate("next");
        const newDate = useCalendarStore.getState().currentDate;
        expect(newDate.getDate()).toBe(originalDate + 7);
      });

      it("navigates to previous week", () => {
        const store = useCalendarStore.getState();
        const originalDate = store.currentDate.getDate();
        store.navigateDate("prev");
        const newDate = useCalendarStore.getState().currentDate;
        expect(newDate.getDate()).toBe(originalDate - 7);
      });

      it("navigates to today", () => {
        const store = useCalendarStore.getState();
        store.setDate(new Date(2020, 0, 1)); // go far away
        store.navigateDate("today");
        const state = useCalendarStore.getState();
        const today = new Date();
        expect(state.currentDate.getDate()).toBe(today.getDate());
        expect(state.currentDate.getMonth()).toBe(today.getMonth());
      });
    });

    describe("day view", () => {
      it("navigates by single day", () => {
        const store = useCalendarStore.getState();
        store.setView("day");
        const dateBefore = useCalendarStore.getState().currentDate.getDate();
        useCalendarStore.getState().navigateDate("next");
        expect(useCalendarStore.getState().currentDate.getDate()).toBe(dateBefore + 1);
      });
    });

    describe("month view", () => {
      it("navigates by month", () => {
        const store = useCalendarStore.getState();
        store.setView("month");
        const monthBefore = useCalendarStore.getState().currentDate.getMonth();
        useCalendarStore.getState().navigateDate("next");
        expect(useCalendarStore.getState().currentDate.getMonth()).toBe(monthBefore + 1);
      });
    });

    it("always updates dateRange along with currentDate", () => {
      const store = useCalendarStore.getState();
      store.navigateDate("next");
      const state = useCalendarStore.getState();
      expect(state.dateRange.start.getTime()).toBeLessThanOrEqual(state.currentDate.getTime());
      expect(state.dateRange.end.getTime()).toBeGreaterThanOrEqual(state.currentDate.getTime());
    });
  });

  describe("setFirstDay", () => {
    it("updates firstDay and recalculates dateRange", () => {
      const store = useCalendarStore.getState();
      store.setFirstDay(0); // Sunday
      const state = useCalendarStore.getState();
      expect(state.firstDay).toBe(0);
      expect(state.dateRange.start.getDay()).toBe(0); // Sunday
    });
  });

  describe("selection", () => {
    it("sets and clears selection", () => {
      const store = useCalendarStore.getState();
      const sel = { start: new Date(), end: new Date() };
      store.setSelection(sel);
      expect(useCalendarStore.getState().selection).toBe(sel);
      store.setSelection(null);
      expect(useCalendarStore.getState().selection).toBeNull();
    });
  });

  describe("filteredResourceIds", () => {
    it("sets filtered resource IDs", () => {
      const store = useCalendarStore.getState();
      store.setFilteredResourceIds(["r1", "r2"]);
      expect(useCalendarStore.getState().filteredResourceIds).toEqual(["r1", "r2"]);
    });
  });
});
