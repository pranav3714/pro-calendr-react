import { useCalendarStore, useCalendarConfig } from "./CalendarContext";
import { WeekView } from "../views/week/WeekView";
import { DayView } from "../views/day/DayView";
import { MonthView } from "../views/month/MonthView";
import { cn } from "../utils/cn";
import type { CalendarEvent } from "../types";

export function CalendarBody() {
  const currentView = useCalendarStore((s) => s.currentView);
  const dateRange = useCalendarStore((s) => s.dateRange);
  const config = useCalendarConfig();

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
    eventContent: config.eventContent,
    onEventClick: handleEventClick,
  };

  // MonthView has different props (no time-grid concepts)
  const monthViewProps = {
    events: config.events,
    dateRange,
    eventContent: config.eventContent,
    onEventClick: handleEventClick,
  };

  return (
    <div
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
      default:
        return null;
    }
  }
}
