import { describe, it, expect } from "vitest";
import { TZDate } from "@date-fns/tz";
import { generateTimeSlots, getSlotAtPosition } from "../slot";

describe("generateTimeSlots", () => {
  const refDate = new Date(2026, 1, 14);

  it("generates 30-minute slots for full day", () => {
    const slots = generateTimeSlots("00:00", "24:00", 30, refDate);
    expect(slots).toHaveLength(48); // 24 hours * 2
    expect(slots[0].label).toBe("00:00");
    expect(slots[47].label).toBe("23:30");
  });

  it("generates 60-minute slots", () => {
    const slots = generateTimeSlots("00:00", "24:00", 60, refDate);
    expect(slots).toHaveLength(24);
    expect(slots[0].label).toBe("00:00");
    expect(slots[8].label).toBe("08:00");
  });

  it("generates 15-minute slots", () => {
    const slots = generateTimeSlots("08:00", "12:00", 15, refDate);
    expect(slots).toHaveLength(16); // 4 hours * 4
    expect(slots[0].label).toBe("08:00");
    expect(slots[15].label).toBe("11:45");
  });

  it("generates slots with custom time range", () => {
    const slots = generateTimeSlots("06:00", "22:00", 30, refDate);
    expect(slots).toHaveLength(32); // 16 hours * 2
    expect(slots[0].label).toBe("06:00");
    expect(slots[31].label).toBe("21:30");
  });

  it("returns empty array for invalid duration", () => {
    expect(generateTimeSlots("00:00", "24:00", 0, refDate)).toEqual([]);
    expect(generateTimeSlots("00:00", "24:00", -1, refDate)).toEqual([]);
  });

  it("returns empty array when start >= end", () => {
    expect(generateTimeSlots("12:00", "12:00", 30, refDate)).toEqual([]);
    expect(generateTimeSlots("14:00", "12:00", 30, refDate)).toEqual([]);
  });

  it("slot start and end dates are on the reference date", () => {
    const slots = generateTimeSlots("08:00", "10:00", 30, refDate);
    slots.forEach((slot) => {
      expect(slot.start.getDate()).toBe(14);
      expect(slot.start.getMonth()).toBe(1); // February
      expect(slot.end.getDate()).toBe(14);
    });
  });

  it("each slot end matches next slot start", () => {
    const slots = generateTimeSlots("08:00", "12:00", 30, refDate);
    for (let i = 0; i < slots.length - 1; i++) {
      expect(slots[i].end.getTime()).toBe(slots[i + 1].start.getTime());
    }
  });

  it("first slot starts at startTime", () => {
    const slots = generateTimeSlots("08:30", "12:00", 30, refDate);
    expect(slots[0].start.getHours()).toBe(8);
    expect(slots[0].start.getMinutes()).toBe(30);
  });

  it("last slot ends at or before endTime", () => {
    const slots = generateTimeSlots("08:00", "12:00", 30, refDate);
    const lastSlot = slots[slots.length - 1];
    expect(lastSlot.end.getHours()).toBe(12);
    expect(lastSlot.end.getMinutes()).toBe(0);
  });

  it("formats labels in 12-hour format when specified", () => {
    const slots = generateTimeSlots("08:00", "15:00", 60, refDate, true);
    expect(slots[0].label).toBe("8:00 AM");
    expect(slots[4].label).toBe("12:00 PM");
    expect(slots[5].label).toBe("1:00 PM");
  });

  it("handles partial last slot (end time not on boundary)", () => {
    const slots = generateTimeSlots("08:00", "09:15", 30, refDate);
    // 08:00-08:30, 08:30-09:00, 09:00-09:15
    expect(slots).toHaveLength(3);
    const lastSlot = slots[2];
    expect(lastSlot.start.getHours()).toBe(9);
    expect(lastSlot.start.getMinutes()).toBe(0);
    expect(lastSlot.end.getHours()).toBe(9);
    expect(lastSlot.end.getMinutes()).toBe(15);
  });
});

describe("getSlotAtPosition", () => {
  it("returns correct slot index for position", () => {
    expect(getSlotAtPosition(0, 40, 10)).toBe(0);
    expect(getSlotAtPosition(39, 40, 10)).toBe(0);
    expect(getSlotAtPosition(40, 40, 10)).toBe(1);
    expect(getSlotAtPosition(80, 40, 10)).toBe(2);
  });

  it("clamps to last slot", () => {
    expect(getSlotAtPosition(1000, 40, 10)).toBe(9);
  });

  it("clamps negative position to 0", () => {
    expect(getSlotAtPosition(-10, 40, 10)).toBe(0);
  });

  it("returns 0 for zero slotHeight", () => {
    expect(getSlotAtPosition(100, 0, 10)).toBe(0);
  });

  it("returns 0 for zero totalSlots", () => {
    expect(getSlotAtPosition(100, 40, 0)).toBe(0);
  });
});

// ─── Timezone-aware slot generation tests ───────────────────────────────────

describe("generateTimeSlots with timezone", () => {
  it("produces slots with TZDate boundaries when timezone is provided", () => {
    const refDate = new TZDate(2026, 1, 14, 0, 0, 0, "America/New_York");
    const slots = generateTimeSlots("08:00", "12:00", 60, refDate, false, "America/New_York");
    expect(slots).toHaveLength(4);
    slots.forEach((slot) => {
      expect(slot.start).toBeInstanceOf(TZDate);
      expect(slot.end).toBeInstanceOf(TZDate);
    });
    expect(slots[0].start.getHours()).toBe(8);
    expect(slots[3].end.getHours()).toBe(12);
  });

  it("produces plain Date slots when no timezone is provided (backward compat)", () => {
    const refDate = new Date(2026, 1, 14);
    const slots = generateTimeSlots("08:00", "12:00", 60, refDate);
    expect(slots).toHaveLength(4);
    slots.forEach((slot) => {
      expect(slot.start.constructor.name).toBe("Date");
    });
  });
});
