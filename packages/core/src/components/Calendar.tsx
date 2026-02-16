import { forwardRef, useContext, useEffect, useImperativeHandle, useRef } from "react";
import { format } from "date-fns";
import type { CalendarProps, CalendarRef, CalendarViewType } from "../types";
import { useCalendarStore, useCalendarConfig, CalendarStoreContext } from "./CalendarContext";
import { CalendarProvider } from "./CalendarProvider";
import { CalendarBody } from "./CalendarBody";
import { DragLayer } from "./DragLayer";
import { CalendarToolbar } from "../toolbar/CalendarToolbar";
import { DateNavigation } from "../toolbar/DateNavigation";
import { ViewSelector } from "../toolbar/ViewSelector";
import { Skeleton } from "./Skeleton";
import { useKeyboard } from "../hooks/use-keyboard";
import { cn } from "../utils/cn";
import { DEFAULTS } from "../constants";

function getToolbarTitle(date: Date, view: CalendarViewType): string {
  switch (view) {
    case "day":
    case "timeline-day":
      return format(date, "EEEE, MMMM d, yyyy");
    case "month":
    case "list":
    case "timeline-month":
      return format(date, "MMMM yyyy");
    case "timeline-year":
      return format(date, "yyyy");
    default:
      return format(date, "MMMM yyyy");
  }
}

function CalendarInner({
  calendarRef,
  views = ["week", "day", "month", "list"],
  loading = false,
  skeletonCount = DEFAULTS.skeletonCount,
  onDateRangeChange,
  onViewChange,
  toolbarLeft,
  toolbarCenter,
  toolbarRight,
  style,
  theme,
}: CalendarProps & { calendarRef: React.Ref<CalendarRef> }) {
  const { classNames } = useCalendarConfig();
  const store = useContext(CalendarStoreContext);
  const currentView = useCalendarStore((s) => s.currentView);
  const currentDate = useCalendarStore((s) => s.currentDate);
  const dateRange = useCalendarStore((s) => s.dateRange);
  const navigateDate = useCalendarStore((s) => s.navigateDate);
  const setView = useCalendarStore((s) => s.setView);
  const setDate = useCalendarStore((s) => s.setDate);
  const dragPhase = useCalendarStore((s) => s.dragEngine.phase);
  const cancelDrag = useCalendarStore((s) => s.cancelDrag);
  const setSelection = useCalendarStore((s) => s.setSelection);

  // Calendar root ref for keyboard event scoping
  const rootRef = useRef<HTMLDivElement>(null);

  // Wire keyboard shortcuts to the calendar root
  useKeyboard({
    rootRef,
    config: { enabled: true },
    setView,
    navigateDate,
    cancelDrag,
    setSelection,
    getDragPhase: () => store?.getState().dragEngine.phase ?? "idle",
    getSelection: () => store?.getState().selection ?? null,
  });

  // Track previous dateRange/view for callbacks
  const prevDateRange = useRef(dateRange);
  const prevView = useRef(currentView);

  useEffect(() => {
    if (
      prevDateRange.current.start !== dateRange.start ||
      prevDateRange.current.end !== dateRange.end
    ) {
      onDateRangeChange?.(dateRange);
      prevDateRange.current = dateRange;
    }
  }, [dateRange, onDateRangeChange]);

  useEffect(() => {
    if (prevView.current !== currentView) {
      onViewChange?.(currentView);
      prevView.current = currentView;
    }
  }, [currentView, onViewChange]);

  // Expose ref API
  useImperativeHandle(calendarRef, () => ({
    getDate: () => currentDate,
    getView: () => currentView,
    navigateDate: (direction: "prev" | "next" | "today" | Date) => {
      if (direction instanceof Date) {
        setDate(direction);
      } else {
        navigateDate(direction);
      }
    },
    setView,
    zoomToFit: () => {
      // TODO: Milestone 7.3
    },
    scrollToTime: (_time: string) => {
      // TODO: Milestone 5
    },
    scrollToResource: (_resourceId: string) => {
      // TODO: Milestone 3
    },
  }));

  const title = getToolbarTitle(currentDate, currentView);

  const defaultLeft = (
    <DateNavigation
      onPrev={() => {
        navigateDate("prev");
      }}
      onNext={() => {
        navigateDate("next");
      }}
      onToday={() => {
        navigateDate("today");
      }}
      title={title}
    />
  );

  const defaultRight = <ViewSelector views={views} activeView={currentView} onChange={setView} />;

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      data-testid="pro-calendr-react"
      className={cn("pro-calendr-react", classNames?.root)}
      data-theme={theme === "dark" ? "dark" : theme === "auto" ? "auto" : undefined}
      data-dragging={dragPhase === "dragging" || undefined}
      style={style}
    >
      <CalendarToolbar
        left={toolbarLeft ?? defaultLeft}
        center={toolbarCenter}
        right={toolbarRight ?? defaultRight}
      />
      {loading ? <Skeleton count={skeletonCount} /> : <CalendarBody />}
      <DragLayer />
    </div>
  );
}

export const Calendar = forwardRef<CalendarRef, CalendarProps>(function Calendar(props, ref) {
  const {
    events,
    defaultView,
    defaultDate,
    firstDay,
    slotDuration,
    slotMinTime,
    slotMaxTime,
    eventContent,
    onEventClick,
    onDateRangeChange,
    onViewChange,
    views,
    loading,
    editable,
    selectable,
    hour12,
    skeletonCount,
    toolbarLeft,
    toolbarCenter,
    toolbarRight,
    classNames,
    style,
    ...rest
  } = props;

  return (
    <CalendarProvider
      events={events}
      defaultView={defaultView}
      defaultDate={defaultDate}
      firstDay={firstDay}
      slotDuration={slotDuration}
      slotMinTime={slotMinTime}
      slotMaxTime={slotMaxTime}
      eventContent={eventContent}
      onEventClick={onEventClick}
      onDateRangeChange={onDateRangeChange}
      onViewChange={onViewChange}
      views={views}
      loading={loading}
      editable={editable}
      selectable={selectable}
      hour12={hour12}
      skeletonCount={skeletonCount}
      toolbarLeft={toolbarLeft}
      toolbarCenter={toolbarCenter}
      toolbarRight={toolbarRight}
      classNames={classNames}
      style={style}
    >
      <CalendarInner {...props} {...rest} calendarRef={ref} />
    </CalendarProvider>
  );
});
