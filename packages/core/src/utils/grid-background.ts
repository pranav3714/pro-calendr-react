import type {
  BuildGridBackgroundParams,
  GridBackgroundResult,
} from "../interfaces/grid-background-params";

const DEFAULT_HOUR_LINE_COLOR = "rgb(243 244 246)";
const DEFAULT_HALF_HOUR_LINE_COLOR = "rgb(249 250 251)";

interface BuildGradientParams {
  readonly color: string;
  readonly intervalPx: number;
  readonly offsetPx: number;
}

function buildRepeatingGradient({ color, intervalPx, offsetPx }: BuildGradientParams): string {
  const start = String(offsetPx);
  const lineEnd = String(offsetPx + 1);
  const repeatEnd = String(intervalPx);

  return `repeating-linear-gradient(to right, transparent 0px, transparent ${start}px, ${color} ${start}px, ${color} ${lineEnd}px, transparent ${lineEnd}px, transparent ${repeatEnd}px)`;
}

export function buildGridBackground({
  hourWidth,
  hourLineColor = DEFAULT_HOUR_LINE_COLOR,
  halfHourLineColor = DEFAULT_HALF_HOUR_LINE_COLOR,
}: BuildGridBackgroundParams): GridBackgroundResult {
  const halfWidth = hourWidth / 2;

  const hourGradient = buildRepeatingGradient({
    color: hourLineColor,
    intervalPx: hourWidth,
    offsetPx: 0,
  });

  const halfHourGradient = buildRepeatingGradient({
    color: halfHourLineColor,
    intervalPx: hourWidth,
    offsetPx: halfWidth,
  });

  return {
    backgroundImage: `${hourGradient}, ${halfHourGradient}`,
    backgroundSize: "100% 100%",
  };
}
