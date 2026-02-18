import { describe, it, expect } from "vitest";
import { formatDateKey } from "../format-date-key";

describe("formatDateKey", () => {
  it("formats a standard date correctly", () => {
    const result = formatDateKey({ date: new Date(2026, 1, 18) });
    expect(result).toBe("2026-02-18");
  });

  it("zero-pads single-digit months", () => {
    const result = formatDateKey({ date: new Date(2026, 0, 5) });
    expect(result).toBe("2026-01-05");
  });

  it("zero-pads single-digit days", () => {
    const result = formatDateKey({ date: new Date(2026, 8, 3) });
    expect(result).toBe("2026-09-03");
  });

  it("handles year boundaries (December 31)", () => {
    const result = formatDateKey({ date: new Date(2025, 11, 31) });
    expect(result).toBe("2025-12-31");
  });

  it("handles year boundaries (January 1)", () => {
    const result = formatDateKey({ date: new Date(2026, 0, 1) });
    expect(result).toBe("2026-01-01");
  });

  it("handles double-digit months and days", () => {
    const result = formatDateKey({ date: new Date(2026, 10, 25) });
    expect(result).toBe("2026-11-25");
  });
});
