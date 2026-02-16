import { createPortal } from "react-dom";
import { useCalendarStore, useCalendarConfig } from "./CalendarContext";
import { DragGhost } from "./DragGhost";
import { formatTime, parseDate } from "../utils/date-utils";
import { differenceInMinutes } from "date-fns";

function formatDelta(minutes: number): string {
  const sign = minutes >= 0 ? "+" : "-";
  const abs = Math.abs(minutes);
  const hours = Math.floor(abs / 60);
  const mins = abs % 60;

  if (hours === 0) return `${sign}${String(mins)}min`;
  if (mins === 0) return `${sign}${String(hours)}h`;
  return `${sign}${String(hours)}h ${String(mins)}min`;
}

function DragTimeTooltip() {
  const current = useCalendarStore((s) => s.dragEngine.current);
  const snappedStart = useCalendarStore((s) => s.dragEngine.snappedStart);
  const snappedEnd = useCalendarStore((s) => s.dragEngine.snappedEnd);
  const isValid = useCalendarStore((s) => s.dragEngine.isValid);
  const validationMessage = useCalendarStore((s) => s.dragEngine.validationMessage);
  const originStart = useCalendarStore((s) => s.dragEngine.origin?.start ?? null);
  const { hour12 } = useCalendarConfig();

  if (!current || !snappedStart || !snappedEnd) return null;

  const originalStart = originStart ? parseDate(originStart) : snappedStart;
  const deltaMinutes = differenceInMinutes(snappedStart, originalStart);

  const validityClass = isValid
    ? "pro-calendr-react-drag-tooltip--valid"
    : "pro-calendr-react-drag-tooltip--invalid";

  return (
    <div
      className={`pro-calendr-react-drag-tooltip ${validityClass}`}
      style={{
        left: current.x + 16,
        top: current.y - 16,
      }}
    >
      <div>
        {formatTime(snappedStart, hour12)} - {formatTime(snappedEnd, hour12)}
      </div>
      {deltaMinutes !== 0 && (
        <div style={{ fontSize: "11px", opacity: 0.8 }}>{formatDelta(deltaMinutes)}</div>
      )}
      {validationMessage && (
        <div style={{ fontSize: "11px", color: "#ef4444" }}>{validationMessage}</div>
      )}
    </div>
  );
}

export function DragLayer() {
  const phase = useCalendarStore((s) => s.dragEngine.phase);
  const mode = useCalendarStore((s) => s.dragEngine.mode);

  if (phase !== "dragging" || mode === "select") return null;

  return createPortal(
    <div className="pro-calendr-react-drag-layer">
      <DragGhost />
      <DragTimeTooltip />
    </div>,
    document.body,
  );
}
