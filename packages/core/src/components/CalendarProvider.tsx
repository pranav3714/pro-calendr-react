import { useState, useEffect, useMemo, type ReactNode } from "react";
import type {
  CalendarEvent,
  CalendarViewType,
  EventContentProps,
  EventClickInfo,
  EventDropInfo,
  EventResizeInfo,
  SelectInfo,
  DropValidationResult,
} from "../types";
import type {
  CalendarResource,
  CalendarResourceGroup,
  ResourceLabelProps,
  ResourceGroupHeaderProps,
} from "../types/resource";
import type { CalendarClassNames } from "../types/theme";
import type { BusinessHours } from "../types/config";
import { createCalendarStore } from "../store/calendar-store";
import { getDateRange } from "../utils/date-utils";
import { DEFAULTS } from "../constants";
import { CalendarStoreContext, CalendarConfigContext } from "./CalendarContext";

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
  businessHours?: BusinessHours;
  eventContent?: (props: EventContentProps) => ReactNode;
  onEventClick?: (info: EventClickInfo) => void;
  onEventDrop?: (info: EventDropInfo) => void;
  onEventResize?: (info: EventResizeInfo) => void;
  onSelect?: (info: SelectInfo) => void;
  validateDrop?: (info: {
    event: CalendarEvent;
    newStart: Date;
    newEnd: Date;
    newResourceId?: string;
  }) => DropValidationResult;
  onDateRangeChange?: (range: { start: Date; end: Date }) => void;
  onViewChange?: (view: CalendarViewType) => void;
  toolbarLeft?: ReactNode;
  toolbarCenter?: ReactNode;
  toolbarRight?: ReactNode;
  resources?: CalendarResource[];
  resourceGroups?: CalendarResourceGroup[];
  resourceLabel?: (props: ResourceLabelProps) => ReactNode;
  resourceGroupHeader?: (props: ResourceGroupHeaderProps) => ReactNode;
  resourceAreaWidth?: number | string;
  filterResourcesWithEvents?: boolean;
  classNames?: CalendarClassNames;
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
  businessHours?: BusinessHours;
  eventContent?: (props: EventContentProps) => ReactNode;
  onEventClick?: (info: EventClickInfo) => void;
  onEventDrop?: (info: EventDropInfo) => void;
  onEventResize?: (info: EventResizeInfo) => void;
  onSelect?: (info: SelectInfo) => void;
  validateDrop?: (info: {
    event: CalendarEvent;
    newStart: Date;
    newEnd: Date;
    newResourceId?: string;
  }) => DropValidationResult;
  onDateRangeChange?: (range: { start: Date; end: Date }) => void;
  onViewChange?: (view: CalendarViewType) => void;
  toolbarLeft?: ReactNode;
  toolbarCenter?: ReactNode;
  toolbarRight?: ReactNode;
  resources?: CalendarResource[];
  resourceGroups?: CalendarResourceGroup[];
  resourceLabel?: (props: ResourceLabelProps) => ReactNode;
  resourceGroupHeader?: (props: ResourceGroupHeaderProps) => ReactNode;
  resourceAreaWidth?: number | string;
  filterResourcesWithEvents?: boolean;
  classNames?: CalendarClassNames;
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
  businessHours,
  resources,
  resourceGroups,
  resourceLabel,
  resourceGroupHeader,
  resourceAreaWidth,
  filterResourcesWithEvents,
  eventContent,
  onEventClick,
  onEventDrop,
  onEventResize,
  onSelect,
  validateDrop,
  onDateRangeChange,
  onViewChange,
  toolbarLeft,
  toolbarCenter,
  toolbarRight,
  classNames,
  style,
}: CalendarProviderProps) {
  // Create store instance ONCE per mount via useState initializer
  const [store] = useState(() => {
    const initialDate = defaultDate
      ? typeof defaultDate === "string"
        ? new Date(defaultDate)
        : defaultDate
      : new Date();
    const initialView = defaultView;
    const dateRange = getDateRange(initialDate, initialView, firstDay);

    return createCalendarStore({
      currentView: initialView,
      currentDate: initialDate,
      dateRange,
      firstDay,
    });
  });

  // Sync firstDay prop changes to the store
  useEffect(() => {
    store.getState().setFirstDay(firstDay);
  }, [firstDay, store]);

  const config = useMemo<CalendarConfig>(
    () => ({
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
      businessHours,
      resources,
      resourceGroups,
      resourceLabel,
      resourceGroupHeader,
      resourceAreaWidth,
      filterResourcesWithEvents,
      eventContent,
      onEventClick,
      onEventDrop,
      onEventResize,
      onSelect,
      validateDrop,
      onDateRangeChange,
      onViewChange,
      toolbarLeft,
      toolbarCenter,
      toolbarRight,
      classNames,
      style,
    }),
    [
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
      businessHours,
      resources,
      resourceGroups,
      resourceLabel,
      resourceGroupHeader,
      resourceAreaWidth,
      filterResourcesWithEvents,
      eventContent,
      onEventClick,
      onEventDrop,
      onEventResize,
      onSelect,
      validateDrop,
      onDateRangeChange,
      onViewChange,
      toolbarLeft,
      toolbarCenter,
      toolbarRight,
      classNames,
      style,
    ],
  );

  return (
    <CalendarStoreContext.Provider value={store}>
      <CalendarConfigContext.Provider value={config}>{children}</CalendarConfigContext.Provider>
    </CalendarStoreContext.Provider>
  );
}
