import type { TimeTooltipProps } from "../interfaces/ghost-props";
import { useScheduleStore } from "../hooks/use-schedule-store";
import { minutesToPosition } from "../utils/time-position";
import { formatTime } from "../utils/time-format";

const TOOLTIP_OFFSET_Y = -28;

export function TimeTooltip({ layoutConfig }: TimeTooltipProps) {
  const dragPhase = useScheduleStore({ selector: (s) => s.dragPhase });
  const dragPosition = useScheduleStore({ selector: (s) => s.dragPosition });
  const resizePhase = useScheduleStore({ selector: (s) => s.resizePhase });
  const resizePosition = useScheduleStore({ selector: (s) => s.resizePosition });

  const config = { dayStartHour: layoutConfig.dayStartHour, hourWidth: layoutConfig.hourWidth };

  if (dragPhase === "dragging" && dragPosition) {
    const left = minutesToPosition({ minutes: dragPosition.snappedStart, config });
    const label = `${formatTime({ minutes: dragPosition.snappedStart })} \u2013 ${formatTime({ minutes: dragPosition.snappedEnd })}`;

    return (
      <div
        aria-hidden="true"
        className="pro-calendr-react-time-tooltip pointer-events-none absolute z-50 whitespace-nowrap rounded bg-[var(--cal-tooltip-bg)] px-2 py-1 text-[11px] tabular-nums text-[var(--cal-tooltip-text)] shadow-md"
        style={{ left, top: TOOLTIP_OFFSET_Y }}
      >
        {label}
      </div>
    );
  }

  if (resizePhase === "resizing" && resizePosition) {
    const left = minutesToPosition({ minutes: resizePosition.snappedStart, config });
    const label = `${formatTime({ minutes: resizePosition.snappedStart })} \u2013 ${formatTime({ minutes: resizePosition.snappedEnd })}`;

    return (
      <div
        aria-hidden="true"
        className="pro-calendr-react-time-tooltip pointer-events-none absolute z-50 whitespace-nowrap rounded bg-[var(--cal-tooltip-bg)] px-2 py-1 text-[11px] tabular-nums text-[var(--cal-tooltip-text)] shadow-md"
        style={{ left, top: TOOLTIP_OFFSET_Y }}
      >
        {label}
      </div>
    );
  }

  return null;
}
