import { format, startOfDay } from "date-fns";
import { parseTimeToMinutes } from "./date-utils";

export interface TimeSlot {
  start: Date;
  end: Date;
  label: string;
}

/**
 * Generate an array of time slots for a time-based view.
 *
 * @param startTime - "HH:mm" string for the first slot (e.g. "00:00" or "06:00")
 * @param endTime - "HH:mm" string for the last slot boundary (e.g. "24:00" or "22:00")
 * @param durationMinutes - Duration of each slot in minutes (e.g. 15, 30, 60)
 * @param referenceDate - Optional date to anchor slot Date objects (defaults to today)
 * @param hour12 - Whether to format labels in 12-hour format
 */
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number,
  referenceDate?: Date,
  hour12 = false,
): TimeSlot[] {
  if (durationMinutes <= 0) return [];

  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);

  if (startMinutes >= endMinutes) return [];

  const refDay = startOfDay(referenceDate ?? new Date());
  const slots: TimeSlot[] = [];

  for (let m = startMinutes; m < endMinutes; m += durationMinutes) {
    const slotEnd = Math.min(m + durationMinutes, endMinutes);

    const start = new Date(refDay);
    start.setMinutes(m);

    const end = new Date(refDay);
    end.setMinutes(slotEnd);

    const label = format(start, hour12 ? "h:mm a" : "HH:mm");
    slots.push({ start, end, label });
  }

  return slots;
}

/**
 * Find which slot index a given Y pixel position falls into.
 *
 * @param y - The Y pixel position relative to the time grid top
 * @param slotHeight - Height of each slot in pixels
 * @param totalSlots - Total number of slots
 * @returns The 0-based slot index, clamped to valid range
 */
export function getSlotAtPosition(y: number, slotHeight: number, totalSlots: number): number {
  if (slotHeight <= 0 || totalSlots <= 0) return 0;
  const index = Math.floor(y / slotHeight);
  return Math.max(0, Math.min(index, totalSlots - 1));
}
