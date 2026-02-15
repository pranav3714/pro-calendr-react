import { useCalendarStore } from "../store/calendar-store";
import { useCalendarConfig } from "./CalendarContext";
import { WeekView } from "../views/week/WeekView";
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

  return (
    <div data-testid="pro-calendr-react-body" className="pro-calendr-react-body">
      {renderView()}
    </div>
  );

  function renderView() {
    switch (currentView) {
      case "week":
        return <WeekView {...viewProps} />;
      case "day":
      case "month":
      case "list":
      case "timeline-day":
      case "timeline-week":
      case "timeline-month":
      case "timeline-year":
        return (
          <div
            className="pro-calendr-react-placeholder"
            style={{ padding: 24, textAlign: "center", color: "var(--cal-text-muted)" }}
          >
            {currentView} view coming soon
          </div>
        );
      default:
        return null;
    }
  }
}
