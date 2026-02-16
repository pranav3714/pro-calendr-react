export interface Selection {
  start: Date;
  end: Date;
  resourceId?: string;
  allDay?: boolean;
}

export interface SelectInfo {
  start: Date;
  end: Date;
  resourceId?: string;
  allDay: boolean;
}

export interface DragOrigin {
  eventId: string;
  start: Date;
  end: Date;
  resourceIds?: string[];
  sourceElement: HTMLElement;
}

export interface DragPosition {
  date: Date;
  resourceId?: string;
  x: number;
  y: number;
}

export interface DragState {
  origin: DragOrigin;
  current: DragPosition;
  isValid: boolean;
  validationMessage?: string;
}

export type DragPhase = "idle" | "pending" | "dragging";
export type DragMode = "move" | "resize-start" | "resize-end" | "select";
export type ResizeEdge = "start" | "end";

export interface DragEngineState {
  phase: DragPhase;
  mode: DragMode | null;
  origin: DragOrigin | null;
  current: DragPosition | null;
  initialPointer: { x: number; y: number } | null;
  isValid: boolean;
  validationMessage?: string;
  snappedStart: Date | null;
  snappedEnd: Date | null;
}

export interface DropValidationResult {
  valid: boolean;
  message?: string;
  level?: "error" | "warning";
}

export interface ContextMenuTarget {
  type: "event" | "slot" | "resource";
  event?: import("./event").CalendarEvent;
  date?: Date;
  resourceId?: string;
  resource?: import("./resource").CalendarResource;
}

export interface ContextMenuItem {
  label: string;
  action: () => void;
  icon?: string;
  variant?: "default" | "danger";
  disabled?: boolean;
  divider?: boolean;
}
