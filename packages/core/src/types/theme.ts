export interface CalendarClassNames {
  root?: string;
  toolbar?: string;
  body?: string;
  event?: string;
  eventSelected?: string;
  eventDragging?: string;
  resourceLabel?: string;
  resourceGroupHeader?: string;
  resourceSidebar?: string;
  timeHeader?: string;
  timeSlot?: string;
  timeSlotHover?: string;
  nowIndicator?: string;
  selectionOverlay?: string;
  dayCell?: string;
  dayCellToday?: string;
  dayCellOtherMonth?: string;
  weekRow?: string;
  overflowIndicator?: string;
  skeleton?: string;
  contextMenu?: string;
  contextMenuItem?: string;
  dragGhost?: string;
  dropIndicator?: string;
}

export interface CalendarCSSVariables {
  "--cal-bg"?: string;
  "--cal-bg-dark"?: string;
  "--cal-bg-muted"?: string;
  "--cal-border"?: string;
  "--cal-border-dark"?: string;
  "--cal-accent"?: string;
  "--cal-accent-hover"?: string;
  "--cal-text"?: string;
  "--cal-text-muted"?: string;
  "--cal-text-dark"?: string;
  "--cal-radius"?: string;
  "--cal-radius-sm"?: string;
  "--cal-radius-lg"?: string;
  "--cal-font-size"?: string;
  "--cal-font-size-sm"?: string;
  "--cal-shadow"?: string;
  "--cal-shadow-lg"?: string;
  "--cal-now-indicator"?: string;
  "--cal-selection"?: string;
  "--cal-event-default-bg"?: string;
  "--cal-event-default-text"?: string;
  "--cal-slot-height"?: string;
  "--cal-slot-width"?: string;
  "--cal-resource-width"?: string;
  [key: `--cal-${string}`]: string | undefined;
}
