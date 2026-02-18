import type { Booking } from "./booking";
import type { ResizeEdge } from "./resize-state";
import type { UseSlotSelectionParams } from "./interaction-hook-params";

export interface DragRefsState {
  readonly bookingId: string;
  readonly originStartMinutes: number;
  readonly originEndMinutes: number;
  readonly originResourceId: string;
  readonly grabOffsetMinutes: number;
  readonly duration: number;
  readonly startClientX: number;
  readonly startClientY: number;
  readonly pointerId: number;
  readonly captureElement: HTMLElement;
}

export interface ResizeRefsState {
  readonly originalStart: number;
  readonly originalEnd: number;
  readonly edge: ResizeEdge;
  readonly startClientX: number;
  readonly pointerId: number;
  readonly captureElement: HTMLElement;
}

export interface SlotDragRefs {
  readonly startMinutes: number;
  readonly resourceId: string;
  readonly pointerId: number;
  readonly captureElement: HTMLElement;
}

export interface CellDragRefsState {
  readonly booking: Booking;
  readonly originDateKey: string;
  readonly originResourceId: string;
  readonly startClientX: number;
  readonly startClientY: number;
  readonly pointerId: number;
  readonly captureElement: HTMLElement;
}

export interface ComputeGrabOffsetParams {
  readonly clientX: number;
  readonly scrollLeft: number;
  readonly sidebarWidth: number;
  readonly bookingStartMinutes: number;
  readonly config: { readonly dayStartHour: number; readonly hourWidth: number };
}

export interface ComputeSlotMinutesParams {
  readonly clientX: number;
  readonly scrollLeft: number;
  readonly sidebarWidth: number;
  readonly layoutConfig: UseSlotSelectionParams["layoutConfig"];
}

export interface ResolveResizeCursorParams {
  readonly edge: ResizeEdge;
}
