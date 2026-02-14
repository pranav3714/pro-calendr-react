export type CalendarViewType =
  | "timeline-day"
  | "timeline-week"
  | "timeline-month"
  | "timeline-year"
  | "week"
  | "day"
  | "month"
  | "list";

export interface BusinessHours {
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
}

export interface ZoomConfig {
  enabled: boolean;
  min: number;
  max: number;
  default: number;
  presets?: number[];
}

export interface AnimationConfig {
  enabled: boolean;
  duration?: number;
}

export interface ResponsiveConfig {
  mobileBreakpoint?: number;
  mobileDefaultView?: CalendarViewType;
  mobileCompact?: boolean;
}

export interface KeyboardShortcutsConfig {
  enabled: boolean;
  customBindings?: Record<string, () => void>;
}

export interface DensityBreakpoints {
  micro: number;
  compact: number;
}

export interface FilterBarConfig {
  enabled: boolean;
  searchable?: boolean;
  searchFields?: string[];
  filterGroups?: FilterGroup[];
  persistKey?: string;
}

export interface FilterGroup {
  key: string;
  label: string;
  options: FilterOption[];
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface MultiSelectConfig {
  enabled: boolean;
  onSelectionChange?: (events: import("./event").CalendarEvent[]) => void;
  batchActions?: BatchAction[];
}

export interface BatchAction {
  label: string;
  action: (events: import("./event").CalendarEvent[]) => void;
  variant?: "default" | "danger";
}

export interface ConflictDetectionConfig {
  enabled: boolean;
  customValidator?: (info: {
    event: import("./event").CalendarEvent;
    overlappingEvents: import("./event").CalendarEvent[];
  }) => { level: "error" | "warning"; message: string } | null;
  highlightConflicts?: boolean;
  showConflictCount?: boolean;
  warnOnly?: boolean;
}

export interface PreviewPanelConfig {
  enabled: boolean;
  position?: "right" | "bottom";
  width?: number;
  collapsible?: boolean;
}

export interface MinimapConfig {
  time?: boolean;
  resources?: boolean;
}

export interface UrlSyncConfig {
  enabled: boolean;
  paramPrefix?: string;
}

export interface UndoRedoConfig {
  enabled: boolean;
  maxHistory?: number;
  onUndo?: (info: {
    event: import("./event").CalendarEvent;
    previousState: Partial<import("./event").CalendarEvent>;
  }) => void;
  onRedo?: (info: {
    event: import("./event").CalendarEvent;
    newState: Partial<import("./event").CalendarEvent>;
  }) => void;
}
