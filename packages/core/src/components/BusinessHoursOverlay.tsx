import type { BusinessHours } from "../types/config";
import { parseTimeToMinutes } from "../utils/date-utils";
import { cn } from "../utils/cn";

export interface BusinessHoursOverlayProps {
  businessHours: BusinessHours;
  day: Date;
  slotMinTime: string;
  slotMaxTime: string;
  slotDuration: number;
  slotHeight: number;
  className?: string;
}

export function BusinessHoursOverlay({
  businessHours,
  day,
  slotMinTime,
  slotMaxTime,
  slotDuration,
  slotHeight,
  className,
}: BusinessHoursOverlayProps) {
  const dayOfWeek = day.getDay();
  const isBusinessDay = businessHours.daysOfWeek.includes(dayOfWeek);

  const gridMinMinutes = parseTimeToMinutes(slotMinTime);
  const gridMaxMinutes = parseTimeToMinutes(slotMaxTime);
  const pixelsPerMinute = slotHeight / slotDuration;
  const totalHeight = (gridMaxMinutes - gridMinMinutes) * pixelsPerMinute;

  // Non-business day: shade entire column
  if (!isBusinessDay) {
    return (
      <div
        className={cn("pro-calendr-react-business-hours-overlay", className)}
        style={{ top: 0, height: totalHeight }}
        data-testid="business-hours-overlay"
      />
    );
  }

  // Business day: shade before and after business hours
  const bizStartMinutes = parseTimeToMinutes(businessHours.startTime);
  const bizEndMinutes = parseTimeToMinutes(businessHours.endTime);

  const regions: { top: number; height: number }[] = [];

  // Region before business hours
  if (bizStartMinutes > gridMinMinutes) {
    const regionStart = 0;
    const regionHeight =
      (Math.min(bizStartMinutes, gridMaxMinutes) - gridMinMinutes) * pixelsPerMinute;
    if (regionHeight > 0) {
      regions.push({ top: regionStart, height: regionHeight });
    }
  }

  // Region after business hours
  if (bizEndMinutes < gridMaxMinutes) {
    const regionTop = (Math.max(bizEndMinutes, gridMinMinutes) - gridMinMinutes) * pixelsPerMinute;
    const regionHeight =
      (gridMaxMinutes - Math.max(bizEndMinutes, gridMinMinutes)) * pixelsPerMinute;
    if (regionHeight > 0) {
      regions.push({ top: regionTop, height: regionHeight });
    }
  }

  if (regions.length === 0) {
    return null;
  }

  return (
    <>
      {regions.map((region, i) => (
        <div
          key={i}
          className={cn("pro-calendr-react-business-hours-overlay", className)}
          style={{ top: region.top, height: region.height }}
          data-testid="business-hours-overlay"
        />
      ))}
    </>
  );
}
