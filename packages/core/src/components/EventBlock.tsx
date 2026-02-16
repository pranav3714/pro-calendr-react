import type { ReactNode } from "react";
import type { CalendarEvent, EventContentProps, EventDensity } from "../types";

export interface EventBlockProps {
  event: CalendarEvent;
  density?: EventDensity;
  isSelected?: boolean;
  isDragging?: boolean;
  style?: React.CSSProperties;
  eventContent?: (props: EventContentProps) => ReactNode;
  onClick?: (event: CalendarEvent, nativeEvent: React.MouseEvent) => void;
}

function DefaultEventContent({ event, density }: { event: CalendarEvent; density: EventDensity }) {
  if (density === "micro") {
    return null;
  }

  const startDate = typeof event.start === "string" ? new Date(event.start) : event.start;
  const hours = startDate.getHours().toString().padStart(2, "0");
  const mins = startDate.getMinutes().toString().padStart(2, "0");

  if (density === "compact") {
    return (
      <span className="pro-calendr-react-event-text">
        {hours}:{mins} {event.title}
      </span>
    );
  }

  return (
    <div className="pro-calendr-react-event-content">
      <span className="pro-calendr-react-event-time">
        {hours}:{mins}
      </span>
      <span className="pro-calendr-react-event-title">{event.title}</span>
    </div>
  );
}

export function EventBlock({
  event,
  density = "full",
  isSelected = false,
  isDragging = false,
  style,
  eventContent,
  onClick,
}: EventBlockProps) {
  const bgColor = event.backgroundColor ?? "var(--cal-event-default-bg)";
  const textColor = event.textColor ?? "var(--cal-event-default-text)";
  const borderColor = event.borderColor ?? bgColor;

  const content = eventContent ? (
    eventContent({ event, density, isSelected, isDragging })
  ) : (
    <DefaultEventContent event={event} density={density} />
  );

  return (
    <div
      className="pro-calendr-react-event"
      data-testid={`event-${event.id}`}
      data-event-id={event.id}
      data-selected={isSelected || undefined}
      data-dragging={isDragging || undefined}
      data-density={density}
      role="button"
      tabIndex={0}
      onClick={(e) => onClick?.(event, e)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(event, e as unknown as React.MouseEvent);
        }
      }}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        borderLeftColor: borderColor,
        ...style,
      }}
    >
      {content}
    </div>
  );
}
