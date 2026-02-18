import { describe, it, expect } from "vitest";
import { createScheduleStore } from "../create-schedule-store";
import type { ResizeOrigin, ResizePosition } from "../../interfaces/resize-state";

const MOCK_ORIGIN: ResizeOrigin = {
  startMinutes: 480,
  endMinutes: 540,
};

const MOCK_POSITION: ResizePosition = {
  snappedStart: 480,
  snappedEnd: 600,
};

describe("resize slice", () => {
  describe("startResizePending", () => {
    it("transitions from idle to pending with booking, edge, and origin", () => {
      const store = createScheduleStore({ config: {} });
      store.getState().startResizePending({ bookingId: "b1", edge: "end", origin: MOCK_ORIGIN });
      const state = store.getState();
      expect(state.resizePhase).toBe("pending");
      expect(state.resizedBookingId).toBe("b1");
      expect(state.resizeEdge).toBe("end");
      expect(state.resizeOrigin).toBe(MOCK_ORIGIN);
      expect(state.resizePosition).toBeNull();
    });

    it("is a no-op when not in idle phase", () => {
      const store = createScheduleStore({ config: {} });
      store.getState().startResizePending({ bookingId: "b1", edge: "end", origin: MOCK_ORIGIN });
      store.getState().startResizePending({ bookingId: "b2", edge: "start", origin: MOCK_ORIGIN });
      expect(store.getState().resizedBookingId).toBe("b1");
    });
  });

  describe("startResizing", () => {
    it("transitions from pending to resizing", () => {
      const store = createScheduleStore({ config: {} });
      store.getState().startResizePending({ bookingId: "b1", edge: "end", origin: MOCK_ORIGIN });
      store.getState().startResizing();
      expect(store.getState().resizePhase).toBe("resizing");
    });

    it("is a no-op when not in pending phase", () => {
      const store = createScheduleStore({ config: {} });
      store.getState().startResizing();
      expect(store.getState().resizePhase).toBe("idle");
    });
  });

  describe("updateResizePosition", () => {
    it("updates position when resizing", () => {
      const store = createScheduleStore({ config: {} });
      store.getState().startResizePending({ bookingId: "b1", edge: "end", origin: MOCK_ORIGIN });
      store.getState().startResizing();
      store.getState().updateResizePosition({ position: MOCK_POSITION });
      expect(store.getState().resizePosition).toBe(MOCK_POSITION);
    });

    it("is a no-op when not in resizing phase", () => {
      const store = createScheduleStore({ config: {} });
      store.getState().updateResizePosition({ position: MOCK_POSITION });
      expect(store.getState().resizePosition).toBeNull();
    });
  });

  describe("completeResize", () => {
    it("returns operation data including edge and resets to idle", () => {
      const store = createScheduleStore({ config: {} });
      store.getState().startResizePending({ bookingId: "b1", edge: "end", origin: MOCK_ORIGIN });
      store.getState().startResizing();
      store.getState().updateResizePosition({ position: MOCK_POSITION });
      const result = store.getState().completeResize();
      expect(result).toEqual({
        bookingId: "b1",
        edge: "end",
        origin: MOCK_ORIGIN,
        finalPosition: MOCK_POSITION,
      });
      expect(store.getState().resizePhase).toBe("idle");
    });

    it("returns null when not in resizing phase", () => {
      const store = createScheduleStore({ config: {} });
      expect(store.getState().completeResize()).toBeNull();
    });
  });

  describe("cancelResize", () => {
    it("resets to idle from any phase", () => {
      const store = createScheduleStore({ config: {} });
      store.getState().startResizePending({ bookingId: "b1", edge: "start", origin: MOCK_ORIGIN });
      store.getState().startResizing();
      store.getState().cancelResize();
      const state = store.getState();
      expect(state.resizePhase).toBe("idle");
      expect(state.resizedBookingId).toBeNull();
      expect(state.resizeEdge).toBeNull();
      expect(state.resizeOrigin).toBeNull();
      expect(state.resizePosition).toBeNull();
    });
  });

  describe("full cycle", () => {
    it("handles complete resize lifecycle with start edge", () => {
      const store = createScheduleStore({ config: {} });
      store.getState().startResizePending({ bookingId: "b1", edge: "start", origin: MOCK_ORIGIN });
      store.getState().startResizing();
      const startPosition: ResizePosition = { snappedStart: 450, snappedEnd: 540 };
      store.getState().updateResizePosition({ position: startPosition });
      const result = store.getState().completeResize();
      expect(result?.edge).toBe("start");
      expect(result?.finalPosition).toBe(startPosition);
    });

    it("handles complete resize lifecycle with end edge", () => {
      const store = createScheduleStore({ config: {} });
      store.getState().startResizePending({ bookingId: "b1", edge: "end", origin: MOCK_ORIGIN });
      store.getState().startResizing();
      store.getState().updateResizePosition({ position: MOCK_POSITION });
      const result = store.getState().completeResize();
      expect(result?.edge).toBe("end");
      expect(store.getState().resizePhase).toBe("idle");
    });
  });
});
