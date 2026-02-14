import { describe, it, expect } from "vitest";
import { snapToGrid } from "../snap";

describe("snapToGrid", () => {
  it("snaps to nearest grid boundary", () => {
    expect(snapToGrid(17, 10)).toBe(20);
    expect(snapToGrid(12, 10)).toBe(10);
    expect(snapToGrid(15, 10)).toBe(20);
  });

  it("handles zero position", () => {
    expect(snapToGrid(0, 10)).toBe(0);
  });

  it("handles position already on grid", () => {
    expect(snapToGrid(30, 10)).toBe(30);
  });
});
