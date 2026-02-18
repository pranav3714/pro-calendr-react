import { describe, it, expect } from "vitest";
import { computePopoverPosition } from "../compute-popover-position";

describe("computePopoverPosition", () => {
  const VIEWPORT_WIDTH = 1024;
  const VIEWPORT_HEIGHT = 768;
  const POPOVER_WIDTH = 300;
  const POPOVER_HEIGHT = 250;
  const GAP = 8;

  it("places popover below the anchor by default", () => {
    const result = computePopoverPosition({
      anchorX: 500,
      anchorY: 200,
      popoverWidth: POPOVER_WIDTH,
      popoverHeight: POPOVER_HEIGHT,
      viewportWidth: VIEWPORT_WIDTH,
      viewportHeight: VIEWPORT_HEIGHT,
      gap: GAP,
    });

    expect(result.placement).toBe("below");
    expect(result.y).toBe(208); // anchorY + gap
  });

  it("centers horizontally on the anchor", () => {
    const result = computePopoverPosition({
      anchorX: 500,
      anchorY: 200,
      popoverWidth: POPOVER_WIDTH,
      popoverHeight: POPOVER_HEIGHT,
      viewportWidth: VIEWPORT_WIDTH,
      viewportHeight: VIEWPORT_HEIGHT,
      gap: GAP,
    });

    expect(result.x).toBe(350); // 500 - 300/2
  });

  it("flips to above when not enough space below", () => {
    const result = computePopoverPosition({
      anchorX: 500,
      anchorY: 600,
      popoverWidth: POPOVER_WIDTH,
      popoverHeight: POPOVER_HEIGHT,
      viewportWidth: VIEWPORT_WIDTH,
      viewportHeight: VIEWPORT_HEIGHT,
      gap: GAP,
    });

    expect(result.placement).toBe("above");
    expect(result.y).toBe(342); // 600 - 250 - 8
  });

  it("centers vertically when neither above nor below has space", () => {
    const result = computePopoverPosition({
      anchorX: 500,
      anchorY: 200,
      popoverWidth: POPOVER_WIDTH,
      popoverHeight: 500,
      viewportWidth: VIEWPORT_WIDTH,
      viewportHeight: 400,
      gap: GAP,
    });

    expect(result.placement).toBe("center");
  });

  it("clamps horizontal position to left edge with margin", () => {
    const result = computePopoverPosition({
      anchorX: 50,
      anchorY: 200,
      popoverWidth: POPOVER_WIDTH,
      popoverHeight: POPOVER_HEIGHT,
      viewportWidth: VIEWPORT_WIDTH,
      viewportHeight: VIEWPORT_HEIGHT,
      gap: GAP,
    });

    expect(result.x).toBe(8); // VIEWPORT_MARGIN
  });

  it("clamps horizontal position to right edge with margin", () => {
    const result = computePopoverPosition({
      anchorX: 950,
      anchorY: 200,
      popoverWidth: POPOVER_WIDTH,
      popoverHeight: POPOVER_HEIGHT,
      viewportWidth: VIEWPORT_WIDTH,
      viewportHeight: VIEWPORT_HEIGHT,
      gap: GAP,
    });

    expect(result.x).toBe(716); // 1024 - 300 - 8
  });

  it("handles tiny viewport gracefully", () => {
    const result = computePopoverPosition({
      anchorX: 100,
      anchorY: 100,
      popoverWidth: 300,
      popoverHeight: 250,
      viewportWidth: 320,
      viewportHeight: 200,
      gap: GAP,
    });

    // Should still produce valid coordinates
    expect(result.x).toBeGreaterThanOrEqual(8);
    expect(result.y).toBeGreaterThanOrEqual(8);
  });

  it("works with zero gap", () => {
    const result = computePopoverPosition({
      anchorX: 500,
      anchorY: 200,
      popoverWidth: POPOVER_WIDTH,
      popoverHeight: POPOVER_HEIGHT,
      viewportWidth: VIEWPORT_WIDTH,
      viewportHeight: VIEWPORT_HEIGHT,
      gap: 0,
    });

    expect(result.y).toBe(200); // anchorY + 0
    expect(result.placement).toBe("below");
  });
});
