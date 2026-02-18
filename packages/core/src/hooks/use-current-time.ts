import { useEffect, useState } from "react";
import type { UseCurrentTimeParams } from "../interfaces/timeline-hook-params";

function getCurrentMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

interface IsWithinDayRangeParams {
  readonly minutes: number;
  readonly dayStartHour: number;
  readonly dayEndHour: number;
}

function isWithinDayRange({ minutes, dayStartHour, dayEndHour }: IsWithinDayRangeParams): boolean {
  return minutes >= dayStartHour * 60 && minutes <= dayEndHour * 60;
}

const UPDATE_INTERVAL_MS = 30_000;

export function useCurrentTime({ config }: UseCurrentTimeParams): number | null {
  const [currentMinutes, setCurrentMinutes] = useState(getCurrentMinutes);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentMinutes(getCurrentMinutes());
    }, UPDATE_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  if (
    !isWithinDayRange({
      minutes: currentMinutes,
      dayStartHour: config.dayStartHour,
      dayEndHour: config.dayEndHour,
    })
  ) {
    return null;
  }

  return currentMinutes;
}
