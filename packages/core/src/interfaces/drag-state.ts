export type DragPhase = "idle" | "pending" | "dragging";

export interface DragOrigin {
  readonly startMinutes: number;
  readonly endMinutes: number;
  readonly resourceId: string;
}

export interface DragPosition {
  readonly clientX: number;
  readonly clientY: number;
  readonly snappedStart: number;
  readonly snappedEnd: number;
  readonly targetResourceId: string;
}

export interface DragSliceState {
  readonly dragPhase: DragPhase;
  readonly draggedBookingId: string | null;
  readonly dragOrigin: DragOrigin | null;
  readonly dragPosition: DragPosition | null;
}
