import { useEffect, useRef } from "react";
import { useCalendarStore, useCalendarConfig } from "./CalendarContext";
import { WeekView } from "../views/week/WeekView";
import { DayView } from "../views/day/DayView";
import { MonthView } from "../views/month/MonthView";
import { ListView } from "../views/list/ListView";
import { cn } from "../utils/cn";
import type { CalendarEvent } from "../types";

export function CalendarBody() {
  const currentView = useCalendarStore((s) => s.currentView);
  const dateRange = useCalendarStore((s) => s.dateRange);
  const config = useCalendarConfig();

  // Body container ref for focus restoration
  const bodyRef = useRef<HTMLDivElement>(null);

  // Restore focus to the correct grid cell after view switches
  useEffect(() => {
    requestAnimationFrame(() => {
      const body = bodyRef.current;
      if (!body) return;

      // Find the roving tabindex target (the cell with tabIndex={0})
      const target = body.querySelector<HTMLElement>('[tabindex="0"]');
      if (target) {
        target.focus();
      }
    });
  }, [currentView]);

  // Bridge onEventClick from (event, nativeEvent) → EventClickInfo
  const handleEventClick = config.onEventClick
    ? (event: CalendarEvent, nativeEvent: React.MouseEvent) => {
        config.onEventClick?.({
          event,
          nativeEvent: nativeEvent.nativeEvent,
        });
      }
    : undefined;

  // Time-grid views (WeekView, DayView) share these props
  const viewProps = {
    events: config.events,
    dateRange,
    slotDuration: config.slotDuration,
    slotMinTime: config.slotMinTime,
    slotMaxTime: config.slotMaxTime,
    slotHeight: config.slotHeight,
    businessHours: config.businessHours,
    eventContent: config.eventContent,
    onEventClick: handleEventClick,
    editable: config.editable,
    selectable: config.selectable,
    onEventDrop: config.onEventDrop,
    onEventResize: config.onEventResize,
    onSelect: config.onSelect,
    validateDrop: config.validateDrop,
  };

  // MonthView has different props (no time-grid concepts)
  const monthViewProps = {
    events: config.events,
    dateRange,
    eventContent: config.eventContent,
    onEventClick: handleEventClick,
  };

  // ListView props (simple list of events)
  const listViewProps = {
    events: config.events,
    dateRange,
    eventContent: config.eventContent,
    onEventClick: handleEventClick,
  };

  return (
    <div
      ref={bodyRef}
      data-testid="pro-calendr-react-body"
      className={cn("pro-calendr-react-body", config.classNames?.body)}
    >
      {renderView()}
    </div>
  );

  function renderView() {
    switch (currentView) {
      case "week":
        return <WeekView {...viewProps} />;
      case "day":
        return <DayView {...viewProps} />;
      case "month":
        return <MonthView {...monthViewProps} />;
      case "list":
        return <ListView {...listViewProps} />;
      default:
        return null;
    }
  }
}
