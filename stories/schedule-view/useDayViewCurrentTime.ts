import { useState, useEffect, useMemo, useRef, type RefObject } from "react";
import { type HelperConfig, minutesToPosition } from "./scheduleData";

// ── Types ────────────────────────────────────────────────────────────────────

interface UseDayViewCurrentTimeInput {
  containerRef: RefObject<HTMLDivElement>;
  helperConfig: HelperConfig;
  dayStartHour: number;
  dayEndHour: number;
}

interface UseDayViewCurrentTimeResult {
  currentTimeX: number | null;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

const useDayViewCurrentTime = ({
  containerRef,
  helperConfig,
  dayStartHour,
  dayEndHour,
}: UseDayViewCurrentTimeInput): UseDayViewCurrentTimeResult => {
  const [currentMinute, setCurrentMinute] = useState<number | null>(null);
  const hasScrolled = useRef(false);

  // Update current minute every 30 seconds
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentMinute(now.getHours() * 60 + now.getMinutes());
    };

    update();
    const interval = setInterval(update, 30_000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Auto-scroll to current time on mount (once)
  useEffect(() => {
    if (hasScrolled.current || currentMinute === null || !containerRef.current) return;

    const dayStart = dayStartHour * 60;
    const dayEnd = dayEndHour * 60;

    if (currentMinute >= dayStart && currentMinute <= dayEnd) {
      const x = minutesToPosition(currentMinute, helperConfig);
      const containerWidth = containerRef.current.clientWidth;
      containerRef.current.scrollLeft = Math.max(0, x - containerWidth / 3);
      hasScrolled.current = true;
    }
  }, [currentMinute, containerRef, helperConfig, dayStartHour, dayEndHour]);

  const currentTimeX = useMemo(() => {
    if (currentMinute === null) return null;

    const dayStart = dayStartHour * 60;
    const dayEnd = dayEndHour * 60;

    if (currentMinute < dayStart || currentMinute > dayEnd) return null;

    return minutesToPosition(currentMinute, helperConfig);
  }, [currentMinute, dayStartHour, dayEndHour, helperConfig]);

  return { currentTimeX };
};

export default useDayViewCurrentTime;
