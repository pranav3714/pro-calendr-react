import type { LayoutConfig } from "../interfaces/layout-config";

interface MinutesToPositionParams {
  readonly minutes: number;
  readonly config: Pick<LayoutConfig, "dayStartHour" | "hourWidth">;
}

export function minutesToPosition({ minutes, config }: MinutesToPositionParams): number {
  const offsetMinutes = minutes - config.dayStartHour * 60;
  return (offsetMinutes / 60) * config.hourWidth;
}

interface PositionToMinutesParams {
  readonly px: number;
  readonly config: Pick<LayoutConfig, "dayStartHour" | "hourWidth">;
}

export function positionToMinutes({ px, config }: PositionToMinutesParams): number {
  return (px / config.hourWidth) * 60 + config.dayStartHour * 60;
}

interface SnapToGridParams {
  readonly minutes: number;
  readonly interval: number;
}

export function snapToGrid({ minutes, interval }: SnapToGridParams): number {
  return Math.round(minutes / interval) * interval;
}

interface ClampMinutesParams {
  readonly minutes: number;
  readonly config: Pick<LayoutConfig, "dayStartHour" | "dayEndHour">;
}

export function clampMinutes({ minutes, config }: ClampMinutesParams): number {
  const min = config.dayStartHour * 60;
  const max = config.dayEndHour * 60;
  return Math.max(min, Math.min(max, minutes));
}
