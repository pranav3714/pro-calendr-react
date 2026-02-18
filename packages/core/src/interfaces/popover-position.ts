export interface ComputePopoverPositionParams {
  readonly anchorX: number;
  readonly anchorY: number;
  readonly popoverWidth: number;
  readonly popoverHeight: number;
  readonly viewportWidth: number;
  readonly viewportHeight: number;
  readonly gap: number;
}

export interface PopoverPositionResult {
  readonly x: number;
  readonly y: number;
  readonly placement: "below" | "above" | "center";
}
