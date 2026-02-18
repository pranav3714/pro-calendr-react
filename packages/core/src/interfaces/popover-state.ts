export interface PopoverAnchor {
  readonly x: number;
  readonly y: number;
}

export interface SelectionSliceState {
  readonly selectedBookingId: string | null;
  readonly popoverAnchor: PopoverAnchor | null;
}
