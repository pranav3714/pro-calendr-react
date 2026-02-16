import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { format } from "date-fns";
import type { CalendarProps, CalendarRef, CalendarViewType } from "../types";
import { useCalendarStore } from "./CalendarContext";
import { CalendarProvider } from "./CalendarProvider";
import { CalendarBody } from "./CalendarBody";
import { CalendarToolbar } from "../toolbar/CalendarToolbar";
import { DateNavigation } from "../toolbar/DateNavigation";
import { ViewSelector } from "../toolbar/ViewSelector";
import { Skeleton } from "./Skeleton";
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
  classNames,
  style,
}: CalendarProps & { calendarRef: React.Ref<CalendarRef> }) {
  const currentView = useCalendarStore((s) => s.currentView);
  const currentDate = useCalendarStore((s) => s.currentDate);
  const dateRange = useCalendarStore((s) => s.dateRange);
  const navigateDate = useCalendarStore((s) => s.navigateDate);
  const setView = useCalendarStore((s) => s.setView);
  const setDate = useCalendarStore((s) => s.setDate);

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
      data-testid="pro-calendr-react"
      className={`pro-calendr-react ${classNames?.root ?? ""}`}
      style={style}
    >
      <CalendarToolbar
        left={toolbarLeft ?? defaultLeft}
        center={toolbarCenter}
        right={toolbarRight ?? defaultRight}
      />
      {loading ? <Skeleton count={skeletonCount} /> : <CalendarBody />}
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
      classNames={classNames as Record<string, string>}
      style={style}
    >
      <CalendarInner {...props} {...rest} calendarRef={ref} />
    </CalendarProvider>
  );
});
