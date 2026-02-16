import { useState, useEffect } from "react";
import { isSameDay, getMinutesSinceMidnight, parseTimeToMinutes } from "../utils/date-utils";
import { cn } from "../utils/cn";

export interface NowIndicatorProps {
  slotMinTime: string;
  slotMaxTime: string;
  slotDuration: number;
  slotHeight: number;
  day: Date;
  className?: string;
}

export function NowIndicator({
  slotMinTime,
  slotMaxTime,
  slotDuration,
  slotHeight,
  day,
  className,
}: NowIndicatorProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Only render on today's column
  if (!isSameDay(day, now)) {
    return null;
  }

  const minutes = getMinutesSinceMidnight(now);
  const minMinutes = parseTimeToMinutes(slotMinTime);
  const maxMinutes = parseTimeToMinutes(slotMaxTime);

  // Don't render if current time is outside the visible range
  if (minutes < minMinutes || minutes > maxMinutes) {
    return null;
  }

  const top = (minutes - minMinutes) * (slotHeight / slotDuration);

  return (
    <div
      className={cn("pro-calendr-react-now-indicator", className)}
      style={{ top }}
      data-testid="now-indicator"
    />
  );
}
