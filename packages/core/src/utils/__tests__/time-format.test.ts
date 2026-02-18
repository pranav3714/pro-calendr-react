import { describe, it, expect } from "vitest";
import { formatTime, formatTimeShort } from "../time-format";

describe("formatTime", () => {
  it("formats midnight as 00:00", () => {
    expect(formatTime({ minutes: 0 })).toBe("00:00");
  });

  it("formats a morning time with zero-padded hours", () => {
    expect(formatTime({ minutes: 540 })).toBe("09:00");
  });

  it("formats an afternoon time", () => {
    expect(formatTime({ minutes: 870 })).toBe("14:30");
  });

  it("formats end of day", () => {
    expect(formatTime({ minutes: 1440 })).toBe("24:00");
  });

  it("formats single-digit minutes with padding", () => {
    expect(formatTime({ minutes: 65 })).toBe("01:05");
  });

  it("handles 15-minute intervals", () => {
    expect(formatTime({ minutes: 495 })).toBe("08:15");
    expect(formatTime({ minutes: 525 })).toBe("08:45");
  });
});

describe("formatTimeShort", () => {
  it("formats midnight without zero-padded hour", () => {
    expect(formatTimeShort({ minutes: 0 })).toBe("0:00");
  });

  it("formats single-digit hours without padding", () => {
    expect(formatTimeShort({ minutes: 540 })).toBe("9:00");
  });

  it("formats double-digit hours as-is", () => {
    expect(formatTimeShort({ minutes: 870 })).toBe("14:30");
  });

  it("pads minutes but not hours", () => {
    expect(formatTimeShort({ minutes: 65 })).toBe("1:05");
  });
});
