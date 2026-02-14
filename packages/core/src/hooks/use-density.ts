import type { EventDensity, DensityBreakpoints } from "../types";

const DEFAULT_BREAKPOINTS: DensityBreakpoints = { micro: 60, compact: 150 };

export function useDensity(
  _width = 0,
  breakpoints: DensityBreakpoints = DEFAULT_BREAKPOINTS,
): EventDensity {
  if (_width < breakpoints.micro) return "micro";
  if (_width < breakpoints.compact) return "compact";
  return "full";
}
