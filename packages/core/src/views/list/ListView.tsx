import { useMemo, type ReactNode } from "react";
import type { CalendarEvent, EventContentProps } from "../../types";
import { useCalendarConfig } from "../../components/CalendarContext";
import { cn } from "../../utils/cn";
import {
  filterEventsInRange,
  sortEventsByStart,
  groupEventsByDate,
} from "../../utils/event-filter";
import { ListDateGroup } from "./ListDateGroup";

export interface ListViewProps {
  events: CalendarEvent[];
  dateRange: { start: Date; end: Date };
  eventContent?: (props: EventContentProps) => ReactNode;
  onEventClick?: (event: CalendarEvent, nativeEvent: React.MouseEvent) => void;
}

export function ListView({ events, dateRange, eventContent, onEventClick }: ListViewProps) {
  const { classNames, hour12 } = useCalendarConfig();

  const groupedEntries = useMemo(() => {
    const filtered = filterEventsInRange(events, dateRange);
    const sorted = sortEventsByStart(filtered);
    const grouped = groupEventsByDate(sorted);
    // Sort date keys chronologically
    return [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [events, dateRange]);

  if (groupedEntries.length === 0) {
    return (
      <div
        data-testid="pro-calendr-react-list"
        className={cn("pro-calendr-react-list", classNames?.listView)}
      >
        <div className={cn("pro-calendr-react-list-empty", classNames?.listEmptyMessage)}>
          No events to display
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="pro-calendr-react-list"
      className={cn("pro-calendr-react-list", classNames?.listView)}
      role="list"
      aria-label="Event list"
    >
      {groupedEntries.map(([dateKey, dateEvents]) => (
        <ListDateGroup
          key={dateKey}
          dateKey={dateKey}
          events={dateEvents}
          eventContent={eventContent}
          onEventClick={onEventClick}
          hour12={hour12}
        />
      ))}
    </div>
  );
}
