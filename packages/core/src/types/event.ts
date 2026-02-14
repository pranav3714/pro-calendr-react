export interface CalendarEvent {
  /** Unique event identifier */
  id: string;
  /** Event title displayed in the calendar */
  title: string;
  /** Event start time (ISO 8601 string or Date) */
  start: string | Date;
  /** Event end time (ISO 8601 string or Date) */
  end: string | Date;
  /** Whether the event spans the entire day */
  allDay?: boolean;
  /** Background color for the event */
  backgroundColor?: string;
  /** Border color for the event */
  borderColor?: string;
  /** Text color for the event */
  textColor?: string;
  /** Resource IDs this event belongs to (for timeline/resource views) */
  resourceIds?: string[];
  /** Whether the event can be dragged */
  editable?: boolean;
  /** Whether the event start time can be changed via drag */
  startEditable?: boolean;
  /** Whether the event duration can be changed via resize */
  durationEditable?: boolean;
  /** Display mode */
  display?: "auto" | "background";
  /** Arbitrary metadata attached to the event */
  extendedProps?: Record<string, unknown>;
}

export type EventDensity = "micro" | "compact" | "full";

export interface EventContentProps {
  event: CalendarEvent;
  density: EventDensity;
  isSelected: boolean;
  isDragging: boolean;
}

export interface EventDropInfo {
  event: CalendarEvent;
  oldStart: Date;
  oldEnd: Date;
  newStart: Date;
  newEnd: Date;
  oldResourceIds?: string[];
  newResourceIds?: string[];
  revert: () => void;
}

export interface EventResizeInfo {
  event: CalendarEvent;
  oldStart: Date;
  oldEnd: Date;
  newStart: Date;
  newEnd: Date;
  revert: () => void;
}

export interface EventClickInfo {
  event: CalendarEvent;
  nativeEvent: MouseEvent;
}
