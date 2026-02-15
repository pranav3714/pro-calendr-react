import { useEffect, type ReactNode } from "react";
import type { CalendarEvent, CalendarViewType, EventContentProps, EventClickInfo } from "../types";
import { useCalendarStore } from "../store/calendar-store";
import { DEFAULTS } from "../constants";
import { CalendarContext } from "./CalendarContext";

export interface CalendarConfig {
  events: CalendarEvent[];
  slotDuration: number;
  slotMinTime: string;
  slotMaxTime: string;
  slotHeight: number;
  views: CalendarViewType[];
  loading: boolean;
  editable: boolean;
  selectable: boolean;
  hour12: boolean;
  skeletonCount: number;
  eventContent?: (props: EventContentProps) => ReactNode;
  onEventClick?: (info: EventClickInfo) => void;
  onDateRangeChange?: (range: { start: Date; end: Date }) => void;
  onViewChange?: (view: CalendarViewType) => void;
  toolbarLeft?: ReactNode;
  toolbarCenter?: ReactNode;
  toolbarRight?: ReactNode;
  classNames?: Record<string, string>;
  style?: React.CSSProperties;
}

export interface CalendarProviderProps {
  children: ReactNode;
  events?: CalendarEvent[];
  defaultView?: CalendarViewType;
  defaultDate?: Date | string;
  firstDay?: number;
  slotDuration?: number;
  slotMinTime?: string;
  slotMaxTime?: string;
  slotHeight?: number;
  views?: CalendarViewType[];
  loading?: boolean;
  editable?: boolean;
  selectable?: boolean;
  hour12?: boolean;
  skeletonCount?: number;
  eventContent?: (props: EventContentProps) => ReactNode;
  onEventClick?: (info: EventClickInfo) => void;
  onDateRangeChange?: (range: { start: Date; end: Date }) => void;
  onViewChange?: (view: CalendarViewType) => void;
  toolbarLeft?: ReactNode;
  toolbarCenter?: ReactNode;
  toolbarRight?: ReactNode;
  classNames?: Record<string, string>;
  style?: React.CSSProperties;
}

export function CalendarProvider({
  children,
  events = [],
  defaultView = DEFAULTS.view,
  defaultDate,
  firstDay = DEFAULTS.firstDay,
  slotDuration = DEFAULTS.slotDuration,
  slotMinTime = DEFAULTS.slotMinTime,
  slotMaxTime = DEFAULTS.slotMaxTime,
  slotHeight = 40,
  views = ["week", "day", "month", "list"],
  loading = false,
  editable = false,
  selectable = false,
  hour12 = false,
  skeletonCount = DEFAULTS.skeletonCount,
  eventContent,
  onEventClick,
  onDateRangeChange,
  onViewChange,
  toolbarLeft,
  toolbarCenter,
  toolbarRight,
  classNames,
  style,
}: CalendarProviderProps) {
  const setView = useCalendarStore((s) => s.setView);
  const setDate = useCalendarStore((s) => s.setDate);
  const setFirstDay = useCalendarStore((s) => s.setFirstDay);

  // Initialize store on mount with defaults
  useEffect(() => {
    setView(defaultView);
    if (defaultDate) {
      const date = typeof defaultDate === "string" ? new Date(defaultDate) : defaultDate;
      setDate(date);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync firstDay prop to store when it changes
  useEffect(() => {
    setFirstDay(firstDay);
  }, [firstDay, setFirstDay]);

  const config: CalendarConfig = {
    events,
    slotDuration,
    slotMinTime,
    slotMaxTime,
    slotHeight,
    views,
    loading,
    editable,
    selectable,
    hour12,
    skeletonCount,
    eventContent,
    onEventClick,
    onDateRangeChange,
    onViewChange,
    toolbarLeft,
    toolbarCenter,
    toolbarRight,
    classNames,
    style,
  };

  return <CalendarContext.Provider value={config}>{children}</CalendarContext.Provider>;
}
