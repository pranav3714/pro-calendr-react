export type ResizePhase = "idle" | "pending" | "resizing";

export type ResizeEdge = "start" | "end";

export interface ResizeOrigin {
  readonly startMinutes: number;
  readonly endMinutes: number;
}

export interface ResizePosition {
  readonly snappedStart: number;
  readonly snappedEnd: number;
}

export interface ResizeSliceState {
  readonly resizePhase: ResizePhase;
  readonly resizedBookingId: string | null;
  readonly resizeEdge: ResizeEdge | null;
  readonly resizeOrigin: ResizeOrigin | null;
  readonly resizePosition: ResizePosition | null;
}
