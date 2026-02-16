import { useMemo, type ReactNode } from "react";
import type { CalendarEvent, EventContentProps } from "../../types";
import { useCalendarConfig } from "../../components/CalendarContext";
import { cn } from "../../utils/cn";
import { getDaysInRange, isSameDay } from "../../utils/date-utils";
import { buildEventSegments, allocateLanes } from "../../utils/lane-allocation";
import type { EventSegment } from "../../utils/lane-allocation";
import { DayCell } from "./DayCell";

export interface WeekRowProps {
  weekStart: Date;
  weekEnd: Date;
  events: CalendarEvent[];
  maxEventRows: number;
  currentMonth: Date;
  eventContent?: (props: EventContentProps) => ReactNode;
  onEventClick?: (event: CalendarEvent, nativeEvent: React.MouseEvent) => void;
}

function getToday(): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

export function WeekRow({
  weekStart,
  weekEnd,
  events,
  maxEventRows,
  currentMonth,
  eventContent,
  onEventClick,
}: WeekRowProps) {
  const { classNames } = useCalendarConfig();
  const today = useMemo(() => getToday(), []);

  const days = useMemo(
    () => getDaysInRange(weekStart, weekEnd),
    [weekStart, weekEnd],
  );

  const segments = useMemo(
    () => buildEventSegments(events, weekStart, weekEnd),
    [events, weekStart, weekEnd],
  );

  const { lanes, overflow } = useMemo(
    () => allocateLanes(segments, maxEventRows),
    [segments, maxEventRows],
  );

  // Compute overflow counts per day (overflow segments overlapping that day)
  const overflowCounts = useMemo(() => {
    const counts = new Array<number>(7).fill(0);
    for (const seg of overflow) {
      for (let d = seg.left; d < seg.right; d++) {
        if (d >= 0 && d < 7) {
          counts[d]++;
        }
      }
    }
    return counts;
  }, [overflow]);

  return (
    <div className={cn("pro-calendr-react-month-week-row", classNames?.weekRow)}>
      {/* Date numbers row */}
      <div className="pro-calendr-react-month-dates-row">
        {days.map((day, i) => (
          <DayCell
            key={day.toISOString()}
            date={day}
            isToday={isSameDay(day, today)}
            isOtherMonth={day.getMonth() !== currentMonth.getMonth()}
            overflowCount={overflowCounts[i]}
          />
        ))}
      </div>

      {/* Event lanes */}
      <div className="pro-calendr-react-month-lanes">
        {lanes.map((lane, laneIndex) => (
          <div key={laneIndex} className="pro-calendr-react-month-lane">
            {lane.map((segment) => (
              <MonthEventChip
                key={segment.event.id}
                segment={segment}
                eventContent={eventContent}
                onEventClick={onEventClick}
                classNames={classNames}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

interface MonthEventChipProps {
  segment: EventSegment;
  eventContent?: (props: EventContentProps) => ReactNode;
  onEventClick?: (event: CalendarEvent, nativeEvent: React.MouseEvent) => void;
  classNames?: {
    monthEvent?: string;
    monthEventContinuation?: string;
  };
}

function MonthEventChip({
  segment,
  eventContent,
  onEventClick,
  classNames: cls,
}: MonthEventChipProps) {
  const { event, left, right, isStart, isEnd } = segment;
  const bgColor = event.backgroundColor ?? "var(--cal-event-default-bg)";
  const textColor = event.textColor ?? "var(--cal-event-default-text)";

  const isContinuation = !isStart || !isEnd;

  const content = eventContent ? (
    eventContent({
      event,
      density: "compact",
      isSelected: false,
      isDragging: false,
    })
  ) : (
    <span className="pro-calendr-react-month-event-title">{event.title}</span>
  );

  return (
    <div
      className={cn(
        "pro-calendr-react-month-event",
        cls?.monthEvent,
        isContinuation && cls?.monthEventContinuation,
      )}
      data-testid={`month-event-${event.id}`}
      data-event-id={event.id}
      data-is-start={String(isStart)}
      data-is-end={String(isEnd)}
      role="button"
      tabIndex={0}
      onClick={(e) => onEventClick?.(event, e)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEventClick?.(event, e as unknown as React.MouseEvent);
        }
      }}
      style={{
        gridColumn: `${String(left + 1)} / ${String(right + 1)}`,
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      {content}
    </div>
  );
}
