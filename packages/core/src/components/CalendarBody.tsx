import { useCalendarStore } from "./CalendarContext";
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
      default:
        return null;
    }
  }
}
