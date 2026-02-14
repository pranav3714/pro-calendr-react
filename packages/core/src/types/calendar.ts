import type { ReactNode } from "react";
import type {
  CalendarEvent,
  EventContentProps,
  EventDropInfo,
  EventResizeInfo,
  EventClickInfo,
} from "./event";
import type {
  CalendarResource,
  CalendarResourceGroup,
  ResourceLabelProps,
  ResourceGroupHeaderProps,
} from "./resource";
import type {
  SelectInfo,
  DropValidationResult,
  ContextMenuTarget,
  ContextMenuItem,
} from "./interaction";
import type { CalendarClassNames, CalendarCSSVariables } from "./theme";
import type { CalendarPlugin } from "./plugin";
import type {
  CalendarViewType,
  BusinessHours,
  ZoomConfig,
  AnimationConfig,
  ResponsiveConfig,
  KeyboardShortcutsConfig,
  DensityBreakpoints,
  FilterBarConfig,
  MultiSelectConfig,
  ConflictDetectionConfig,
  PreviewPanelConfig,
  MinimapConfig,
  UrlSyncConfig,
  UndoRedoConfig,
} from "./config";
import type { DateRange } from "./plugin";

export interface CalendarProps {
  // --- Data ---
  events?: CalendarEvent[];
  resources?: CalendarResource[];
  resourceGroups?: CalendarResourceGroup[];
  loading?: boolean;

  // --- View ---
  defaultView?: CalendarViewType;
  views?: CalendarViewType[];
  defaultDate?: Date | string;
  timezone?: string;

  // --- Time configuration ---
  slotDuration?: number;
  slotMinTime?: string;
  slotMaxTime?: string;
  firstDay?: number;
  weekends?: boolean;
  businessHours?: BusinessHours;
  scrollTime?: string;

  // --- Event display ---
  eventContent?: (props: EventContentProps) => ReactNode;
  densityBreakpoints?: DensityBreakpoints;
  skeletonCount?: number;

  // --- Resource display ---
  resourceLabel?: (props: ResourceLabelProps) => ReactNode;
  resourceGroupHeader?: (props: ResourceGroupHeaderProps) => ReactNode;
  resourceAreaWidth?: number | string;
  filterResourcesWithEvents?: boolean;

  // --- Toolbar slots ---
  toolbarLeft?: ReactNode;
  toolbarCenter?: ReactNode;
  toolbarRight?: ReactNode;

  // --- Interactions ---
  selectable?: boolean;
  editable?: boolean;
  eventOverlap?: boolean;

  // --- Callbacks ---
  onEventClick?: (info: EventClickInfo) => void;
  onEventDrop?: (info: EventDropInfo) => void;
  onEventResize?: (info: EventResizeInfo) => void;
  onSelect?: (info: SelectInfo) => void;
  onDateRangeChange?: (range: DateRange) => void;
  onViewChange?: (view: CalendarViewType) => void;
  validateDrop?: (info: {
    event: CalendarEvent;
    newStart: Date;
    newEnd: Date;
    newResourceId?: string;
  }) => DropValidationResult;

  // --- Context menu ---
  contextMenu?: (target: ContextMenuTarget) => ContextMenuItem[];

  // --- Preview panel ---
  previewPanel?: PreviewPanelConfig;
  previewContent?: (props: { selectedEvent: CalendarEvent | null }) => ReactNode;

  // --- Features ---
  zoom?: ZoomConfig;
  animations?: AnimationConfig;
  responsive?: ResponsiveConfig;
  keyboardShortcuts?: KeyboardShortcutsConfig;
  filterBar?: FilterBarConfig;
  multiSelect?: MultiSelectConfig;
  conflictDetection?: ConflictDetectionConfig;
  minimap?: MinimapConfig;
  urlSync?: UrlSyncConfig;
  undoRedo?: UndoRedoConfig;

  // --- Plugins ---
  plugins?: CalendarPlugin[];

  // --- Styling ---
  classNames?: CalendarClassNames;
  style?: CalendarCSSVariables & React.CSSProperties;
  compact?: boolean;

  // --- Locale ---
  locale?: string;
  hour12?: boolean;
}

export interface CalendarRef {
  getDate: () => Date;
  getView: () => CalendarViewType;
  navigateDate: (direction: "prev" | "next" | "today" | Date) => void;
  setView: (view: CalendarViewType) => void;
  zoomToFit: () => void;
  scrollToTime: (time: string) => void;
  scrollToResource: (resourceId: string) => void;
}
