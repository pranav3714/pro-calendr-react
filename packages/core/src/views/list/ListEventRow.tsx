import type { ReactNode } from "react";
import type { CalendarEvent, EventContentProps } from "../../types";
import { useCalendarConfig } from "../../components/CalendarContext";
import { cn } from "../../utils/cn";
import { parseDate, formatDate } from "../../utils/date-utils";

export interface ListEventRowProps {
  event: CalendarEvent;
  eventContent?: (props: EventContentProps) => ReactNode;
  onEventClick?: (event: CalendarEvent, nativeEvent: React.MouseEvent) => void;
  hour12: boolean;
}

export function ListEventRow({ event, eventContent, onEventClick, hour12 }: ListEventRowProps) {
  const { classNames } = useCalendarConfig();

  // Compute time display
  let timeDisplay: string;
  if (event.allDay) {
    timeDisplay = "All day";
  } else {
    const startStr = formatDate(parseDate(event.start), hour12 ? "h:mm a" : "HH:mm");
    const endStr = formatDate(parseDate(event.end), hour12 ? "h:mm a" : "HH:mm");
    timeDisplay = `${startStr} \u2013 ${endStr}`;
  }

  // Compute event color from backgroundColor or extendedProps
  const eventColor =
    event.backgroundColor ?? (event.extendedProps?.color as string | undefined) ?? undefined;

  const handleClick = (e: React.MouseEvent) => {
    onEventClick?.(event, e);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onEventClick?.(event, e as unknown as React.MouseEvent);
    }
  };

  return (
    <div
      className={cn("pro-calendr-react-list-event-row", classNames?.listEventRow)}
      role="listitem"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <span
        className="pro-calendr-react-list-event-dot"
        style={eventColor ? { backgroundColor: eventColor } : undefined}
      />
      <span className="pro-calendr-react-list-event-time">{timeDisplay}</span>
      {eventContent ? (
        eventContent({ event, density: "full", isSelected: false, isDragging: false })
      ) : (
        <span className="pro-calendr-react-list-event-title">{event.title}</span>
      )}
    </div>
  );
}
