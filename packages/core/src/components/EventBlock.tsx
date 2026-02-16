import type { ReactNode } from "react";
import type { CalendarEvent, EventContentProps, EventDensity } from "../types";
import type { DragMode } from "../types/interaction";
import { useCalendarConfig } from "./CalendarContext";
import { cn } from "../utils/cn";

export interface EventBlockProps {
  event: CalendarEvent;
  density?: EventDensity;
  isSelected?: boolean;
  isDragging?: boolean;
  editable?: boolean;
  durationEditable?: boolean;
  style?: React.CSSProperties;
  eventContent?: (props: EventContentProps) => ReactNode;
  onClick?: (event: CalendarEvent, nativeEvent: React.MouseEvent) => void;
  onPointerDown?: (e: React.PointerEvent, event: CalendarEvent, mode: DragMode) => void;
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
  editable = false,
  durationEditable,
  style,
  eventContent,
  onClick,
  onPointerDown,
}: EventBlockProps) {
  const { classNames } = useCalendarConfig();
  const bgColor = event.backgroundColor ?? "var(--cal-event-default-bg)";
  const textColor = event.textColor ?? "var(--cal-event-default-text)";
  const borderColor = event.borderColor ?? bgColor;

  // Per-event opt-out from editing
  const canDrag = editable && event.editable !== false;
  const canResize = canDrag && (durationEditable ?? true) && event.durationEditable !== false;

  const content = eventContent ? (
    eventContent({ event, density, isSelected, isDragging })
  ) : (
    <DefaultEventContent event={event} density={density} />
  );

  return (
    <div
      className={cn(
        "pro-calendr-react-event",
        classNames?.event,
        isSelected && classNames?.eventSelected,
        isDragging && classNames?.eventDragging,
      )}
      data-testid={`event-${event.id}`}
      data-event-id={event.id}
      data-selected={isSelected || undefined}
      data-dragging={isDragging || undefined}
      data-editable={canDrag || undefined}
      data-density={density}
      role="button"
      tabIndex={-1}
      onClick={(e) => onClick?.(event, e)}
      onPointerDown={
        canDrag
          ? (e) => {
              onPointerDown?.(e, event, "move");
            }
          : undefined
      }
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
      {canResize && (
        <>
          <div
            className="pro-calendr-react-event-resize-handle pro-calendr-react-event-resize-handle--top"
            onPointerDown={(e) => {
              e.stopPropagation();
              onPointerDown?.(e, event, "resize-start");
            }}
          />
          <div
            className="pro-calendr-react-event-resize-handle pro-calendr-react-event-resize-handle--bottom"
            onPointerDown={(e) => {
              e.stopPropagation();
              onPointerDown?.(e, event, "resize-end");
            }}
          />
        </>
      )}
    </div>
  );
}
