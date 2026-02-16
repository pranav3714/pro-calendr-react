import { useCalendarStore, useCalendarConfig } from "./CalendarContext";
import { formatTime } from "../utils/date-utils";

export function DragGhost() {
  const phase = useCalendarStore((s) => s.dragEngine.phase);
  const mode = useCalendarStore((s) => s.dragEngine.mode);
  const current = useCalendarStore((s) => s.dragEngine.current);
  const snappedStart = useCalendarStore((s) => s.dragEngine.snappedStart);
  const snappedEnd = useCalendarStore((s) => s.dragEngine.snappedEnd);
  const originEventId = useCalendarStore((s) => s.dragEngine.origin?.eventId ?? null);
  const { events, hour12 } = useCalendarConfig();

  // Only show during dragging phase for move/resize modes (not select)
  if (phase !== "dragging" || mode === "select") return null;
  if (!current || !snappedStart || !snappedEnd || !originEventId) return null;

  const event = events.find((e) => e.id === originEventId);
  if (!event) return null;

  const bgColor = event.backgroundColor ?? "var(--cal-event-default-bg)";
  const textColor = event.textColor ?? "var(--cal-event-default-text)";
  const borderColor = event.borderColor ?? bgColor;

  return (
    <div
      className="pro-calendr-react-drag-ghost"
      style={{
        left: current.x,
        top: current.y,
        transform: "translate(-50%, -20px)",
        width: 200,
      }}
    >
      <div
        className="pro-calendr-react-event"
        style={{
          backgroundColor: bgColor,
          color: textColor,
          borderLeftColor: borderColor,
          position: "static",
          width: "100%",
        }}
      >
        <div className="pro-calendr-react-event-content">
          <span className="pro-calendr-react-event-time">
            {formatTime(snappedStart, hour12)} - {formatTime(snappedEnd, hour12)}
          </span>
          <span className="pro-calendr-react-event-title">{event.title}</span>
        </div>
      </div>
    </div>
  );
}
