import { describe, it, expect } from "vitest";
import { computeResizePosition } from "../compute-resize-position";
import type { LayoutConfig } from "../../interfaces/layout-config";

const LAYOUT: LayoutConfig = {
  hourWidth: 128,
  rowHeight: 56,
  sidebarWidth: 208,
  groupHeaderHeight: 36,
  timeHeaderHeight: 40,
  snapInterval: 15,
  dayStartHour: 6,
  dayEndHour: 22,
  dragThreshold: 5,
  resizeThreshold: 3,
  minDuration: 15,
};

describe("computeResizePosition", () => {
  describe("resizing the end edge", () => {
    it("extends the end time when dragging right", () => {
      // Original: 480-540 (8:00-9:00)
      // clientX maps to ~600 min (10:00)
      // 600 min = (600 - 360) / 60 * 128 = 512 px
      const result = computeResizePosition({
        clientX: 208 + 512,
        scrollLeft: 0,
        sidebarWidth: 208,
        edge: "end",
        originalStart: 480,
        originalEnd: 540,
        layoutConfig: LAYOUT,
      });

      expect(result.snappedStart).toBe(480);
      expect(result.snappedEnd).toBe(600);
    });

    it("enforces minimum duration when shrinking", () => {
      // Trying to drag end to before start + minDuration
      // Original: 480-600, dragging end back to 485 → should clamp to 495 (480+15)
      const result = computeResizePosition({
        clientX: 208 + 10,
        scrollLeft: 0,
        sidebarWidth: 208,
        edge: "end",
        originalStart: 480,
        originalEnd: 600,
        layoutConfig: LAYOUT,
      });

      expect(result.snappedEnd).toBeGreaterThanOrEqual(480 + LAYOUT.minDuration);
      expect(result.snappedStart).toBe(480);
    });

    it("snaps to the nearest 15-minute interval", () => {
      const result = computeResizePosition({
        clientX: 208 + 300,
        scrollLeft: 0,
        sidebarWidth: 208,
        edge: "end",
        originalStart: 480,
        originalEnd: 540,
        layoutConfig: LAYOUT,
      });

      expect(result.snappedEnd % 15).toBe(0);
    });

    it("clamps to day end boundary", () => {
      const result = computeResizePosition({
        clientX: 5000,
        scrollLeft: 0,
        sidebarWidth: 208,
        edge: "end",
        originalStart: 480,
        originalEnd: 540,
        layoutConfig: LAYOUT,
      });

      expect(result.snappedEnd).toBeLessThanOrEqual(1320); // 22 * 60
    });
  });

  describe("resizing the start edge", () => {
    it("moves the start time earlier when dragging left", () => {
      // Original: 480-600, dragging start left to 420 (7:00)
      // 420 min = (420 - 360) / 60 * 128 = 128 px
      const result = computeResizePosition({
        clientX: 208 + 128,
        scrollLeft: 0,
        sidebarWidth: 208,
        edge: "start",
        originalStart: 480,
        originalEnd: 600,
        layoutConfig: LAYOUT,
      });

      expect(result.snappedStart).toBe(420);
      expect(result.snappedEnd).toBe(600);
    });

    it("enforces minimum duration when dragging start too close to end", () => {
      // Original: 480-540 (60 min), dragging start to 535 → should clamp to 525 (540-15)
      const result = computeResizePosition({
        clientX: 208 + 400,
        scrollLeft: 0,
        sidebarWidth: 208,
        edge: "start",
        originalStart: 480,
        originalEnd: 540,
        layoutConfig: LAYOUT,
      });

      expect(result.snappedStart).toBeLessThanOrEqual(540 - LAYOUT.minDuration);
      expect(result.snappedEnd).toBe(540);
    });

    it("clamps to day start boundary", () => {
      const result = computeResizePosition({
        clientX: 0,
        scrollLeft: 0,
        sidebarWidth: 208,
        edge: "start",
        originalStart: 480,
        originalEnd: 600,
        layoutConfig: LAYOUT,
      });

      expect(result.snappedStart).toBeGreaterThanOrEqual(360); // 6 * 60
    });

    it("snaps to the nearest 15-minute interval", () => {
      const result = computeResizePosition({
        clientX: 208 + 150,
        scrollLeft: 0,
        sidebarWidth: 208,
        edge: "start",
        originalStart: 480,
        originalEnd: 600,
        layoutConfig: LAYOUT,
      });

      expect(result.snappedStart % 15).toBe(0);
    });
  });

  describe("scroll offset handling", () => {
    it("accounts for horizontal scroll offset", () => {
      // Use wide booking (360-600) and high clientX so minDuration doesn't interfere
      const withoutScroll = computeResizePosition({
        clientX: 208 + 512,
        scrollLeft: 0,
        sidebarWidth: 208,
        edge: "end",
        originalStart: 360,
        originalEnd: 600,
        layoutConfig: LAYOUT,
      });

      const withScroll = computeResizePosition({
        clientX: 208 + 512,
        scrollLeft: 128,
        sidebarWidth: 208,
        edge: "end",
        originalStart: 360,
        originalEnd: 600,
        layoutConfig: LAYOUT,
      });

      // 128px scroll = 1 hour = 60 minutes difference
      expect(withScroll.snappedEnd).toBe(withoutScroll.snappedEnd + 60);
    });
  });

  describe("edge cases", () => {
    it("handles start and end edges producing valid results for identical positions", () => {
      // Both edges should produce results that respect minDuration
      const startResult = computeResizePosition({
        clientX: 208 + 256,
        scrollLeft: 0,
        sidebarWidth: 208,
        edge: "start",
        originalStart: 480,
        originalEnd: 495,
        layoutConfig: LAYOUT,
      });

      expect(startResult.snappedEnd - startResult.snappedStart).toBeGreaterThanOrEqual(
        LAYOUT.minDuration,
      );

      const endResult = computeResizePosition({
        clientX: 208 + 256,
        scrollLeft: 0,
        sidebarWidth: 208,
        edge: "end",
        originalStart: 480,
        originalEnd: 495,
        layoutConfig: LAYOUT,
      });

      expect(endResult.snappedEnd - endResult.snappedStart).toBeGreaterThanOrEqual(
        LAYOUT.minDuration,
      );
    });
  });
});
