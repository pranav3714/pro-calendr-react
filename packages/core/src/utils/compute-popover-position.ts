import type {
  ComputePopoverPositionParams,
  PopoverPositionResult,
} from "../interfaces/popover-position";

const VIEWPORT_MARGIN = 8;

function computeVerticalPlacement({
  anchorY,
  popoverHeight,
  viewportHeight,
  gap,
}: {
  readonly anchorY: number;
  readonly popoverHeight: number;
  readonly viewportHeight: number;
  readonly gap: number;
}): { readonly y: number; readonly placement: PopoverPositionResult["placement"] } {
  const belowY = anchorY + gap;
  if (belowY + popoverHeight < viewportHeight) {
    return { y: belowY, placement: "below" };
  }

  const aboveY = anchorY - popoverHeight - gap;
  if (aboveY > 0) {
    return { y: aboveY, placement: "above" };
  }

  return {
    y: Math.max(VIEWPORT_MARGIN, (viewportHeight - popoverHeight) / 2),
    placement: "center",
  };
}

function computeHorizontalPosition({
  anchorX,
  popoverWidth,
  viewportWidth,
}: {
  readonly anchorX: number;
  readonly popoverWidth: number;
  readonly viewportWidth: number;
}): number {
  const centered = anchorX - popoverWidth / 2;
  const minX = VIEWPORT_MARGIN;
  const maxX = viewportWidth - popoverWidth - VIEWPORT_MARGIN;
  return Math.max(minX, Math.min(centered, maxX));
}

export function computePopoverPosition({
  anchorX,
  anchorY,
  popoverWidth,
  popoverHeight,
  viewportWidth,
  viewportHeight,
  gap,
}: ComputePopoverPositionParams): PopoverPositionResult {
  const { y, placement } = computeVerticalPlacement({
    anchorY,
    popoverHeight,
    viewportHeight,
    gap,
  });

  const x = computeHorizontalPosition({
    anchorX,
    popoverWidth,
    viewportWidth,
  });

  return { x, y, placement };
}
