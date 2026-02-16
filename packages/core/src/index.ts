// Components
export { Calendar } from "./components/Calendar";
export { CalendarProvider } from "./components/CalendarProvider";
export { CalendarBody } from "./components/CalendarBody";
export { NowIndicator } from "./components/NowIndicator";
export { SelectionOverlay } from "./components/SelectionOverlay";
export { DragLayer } from "./components/DragLayer";
export { DragGhost } from "./components/DragGhost";
export { DropIndicator } from "./components/DropIndicator";
export { ContextMenu } from "./components/ContextMenu";
export { OverflowIndicator } from "./components/OverflowIndicator";
export { Skeleton } from "./components/Skeleton";

// Toolbar
export { CalendarToolbar } from "./toolbar/CalendarToolbar";
export { DateNavigation } from "./toolbar/DateNavigation";
export { ViewSelector } from "./toolbar/ViewSelector";

// Views
export { TimelineView } from "./views/timeline";
export { WeekView } from "./views/week";
export { MonthView } from "./views/month";
export { DayView } from "./views/day";
export { ListView } from "./views/list";

// Hooks
export {
  useCalendar,
  useCalendarEvents,
  useDateNavigation,
  useDrag,
  useSelection,
  useKeyboard,
  useVirtualization,
  useDensity,
} from "./hooks";

// Store
export { useCalendarStore } from "./components/CalendarContext";
export { createCalendarStore } from "./store";
export type { CalendarStore } from "./store";

// Plugins
export { createPlugin } from "./plugins";

// Utils
export {
  formatDate,
  parseDate,
  isSameDay,
  getDateRange,
  formatTime,
  formatDateHeader,
  getDaysInRange,
  getWeeksInRange,
  parseTimeToMinutes,
  minutesToDate,
  getMinutesSinceMidnight,
  getDurationMinutes,
  addDays,
  layoutCollisions,
  generateGridTemplate,
  snapToGrid,
  generateTimeSlots,
  getSlotAtPosition,
  detectConflicts,
} from "./utils";
export type { TimeSlot } from "./utils";

// Constants
export { DEFAULTS, KEYS } from "./constants";

// Types
export type * from "./types";
