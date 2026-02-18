import { describe, it, expect } from "vitest";
import { createScheduleStore } from "../create-schedule-store";
import type { DragOrigin, DragPosition } from "../../interfaces/drag-state";

const MOCK_ORIGIN: DragOrigin = {
  startMinutes: 480,
  endMinutes: 540,
  resourceId: "r1",
};

const MOCK_POSITION: DragPosition = {
  clientX: 200,
  clientY: 100,
  snappedStart: 510,
  snappedEnd: 570,
  targetResourceId: "r2",
};

describe("drag slice", () => {
  describe("startDragPending", () => {
    it("transitions from idle to pending with booking and origin", () => {
      const store = createScheduleStore({ config: {} });
      store.getState().startDragPending({ bookingId: "b1", origin: MOCK_ORIGIN });
      const state = store.getState();
      expect(state.dragPhase).toBe("pending");
      expect(state.draggedBookingId).toBe("b1");
      expect(state.dragOrigin).toBe(MOCK_ORIGIN);
      expect(state.dragPosition).toBeNull();
    });

    it("is a no-op when not in idle phase", () => {
      const store = createScheduleStore({ config: {} });
      store.getState().startDragPending({ bookingId: "b1", origin: MOCK_ORIGIN });
      store.getState().startDragPending({ bookingId: "b2", origin: MOCK_ORIGIN });
      expect(store.getState().draggedBookingId).toBe("b1");
    });
  });

  describe("startDragging", () => {
    it("transitions from pending to dragging", () => {
      const store = createScheduleStore({ config: {} });
      store.getState().startDragPending({ bookingId: "b1", origin: MOCK_ORIGIN });
      store.getState().startDragging();
      expect(store.getState().dragPhase).toBe("dragging");
    });

    it("is a no-op when not in pending phase", () => {
      const store = createScheduleStore({ config: {} });
      store.getState().startDragging();
      expect(store.getState().dragPhase).toBe("idle");
    });
  });

  describe("updateDragPosition", () => {
    it("updates position when dragging", () => {
      const store = createScheduleStore({ config: {} });
      store.getState().startDragPending({ bookingId: "b1", origin: MOCK_ORIGIN });
      store.getState().startDragging();
      store.getState().updateDragPosition({ position: MOCK_POSITION });
      expect(store.getState().dragPosition).toBe(MOCK_POSITION);
    });

    it("is a no-op when not in dragging phase", () => {
      const store = createScheduleStore({ config: {} });
      store.getState().updateDragPosition({ position: MOCK_POSITION });
      expect(store.getState().dragPosition).toBeNull();
    });
  });

  describe("completeDrag", () => {
    it("returns operation data and resets to idle when dragging", () => {
      const store = createScheduleStore({ config: {} });
      store.getState().startDragPending({ bookingId: "b1", origin: MOCK_ORIGIN });
      store.getState().startDragging();
      store.getState().updateDragPosition({ position: MOCK_POSITION });
      const result = store.getState().completeDrag();
      expect(result).toEqual({
        bookingId: "b1",
        origin: MOCK_ORIGIN,
        finalPosition: MOCK_POSITION,
      });
      expect(store.getState().dragPhase).toBe("idle");
      expect(store.getState().draggedBookingId).toBeNull();
    });

    it("returns null when not in dragging phase", () => {
      const store = createScheduleStore({ config: {} });
      expect(store.getState().completeDrag()).toBeNull();
    });

    it("resets all drag state after completion", () => {
      const store = createScheduleStore({ config: {} });
      store.getState().startDragPending({ bookingId: "b1", origin: MOCK_ORIGIN });
      store.getState().startDragging();
      store.getState().updateDragPosition({ position: MOCK_POSITION });
      store.getState().completeDrag();
      const state = store.getState();
      expect(state.dragPhase).toBe("idle");
      expect(state.draggedBookingId).toBeNull();
      expect(state.dragOrigin).toBeNull();
      expect(state.dragPosition).toBeNull();
    });
  });

  describe("cancelDrag", () => {
    it("resets to idle from pending", () => {
      const store = createScheduleStore({ config: {} });
      store.getState().startDragPending({ bookingId: "b1", origin: MOCK_ORIGIN });
      store.getState().cancelDrag();
      expect(store.getState().dragPhase).toBe("idle");
      expect(store.getState().draggedBookingId).toBeNull();
    });

    it("resets to idle from dragging", () => {
      const store = createScheduleStore({ config: {} });
      store.getState().startDragPending({ bookingId: "b1", origin: MOCK_ORIGIN });
      store.getState().startDragging();
      store.getState().cancelDrag();
      expect(store.getState().dragPhase).toBe("idle");
    });

    it("is safe to call from idle", () => {
      const store = createScheduleStore({ config: {} });
      store.getState().cancelDrag();
      expect(store.getState().dragPhase).toBe("idle");
    });
  });

  describe("full cycle", () => {
    it("handles complete drag lifecycle: idle -> pending -> dragging -> complete", () => {
      const store = createScheduleStore({ config: {} });
      expect(store.getState().dragPhase).toBe("idle");

      store.getState().startDragPending({ bookingId: "b1", origin: MOCK_ORIGIN });
      expect(store.getState().dragPhase).toBe("pending");

      store.getState().startDragging();
      expect(store.getState().dragPhase).toBe("dragging");

      store.getState().updateDragPosition({ position: MOCK_POSITION });
      expect(store.getState().dragPosition).toBe(MOCK_POSITION);

      const result = store.getState().completeDrag();
      expect(result).not.toBeNull();
      expect(store.getState().dragPhase).toBe("idle");
    });
  });
});
