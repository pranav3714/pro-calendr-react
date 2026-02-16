import type { ReactNode } from "react";
import type { CalendarEvent, EventContentProps } from "../../types";
import { useCalendarConfig } from "../../components/CalendarContext";
import { cn } from "../../utils/cn";
import { formatDate } from "../../utils/date-utils";
import { ListEventRow } from "./ListEventRow";

export interface ListDateGroupProps {
  dateKey: string;
  events: CalendarEvent[];
  eventContent?: (props: EventContentProps) => ReactNode;
  onEventClick?: (event: CalendarEvent, nativeEvent: React.MouseEvent) => void;
  hour12: boolean;
}

export function ListDateGroup({
  dateKey,
  events,
  eventContent,
  onEventClick,
  hour12,
}: ListDateGroupProps) {
  const { classNames } = useCalendarConfig();

  // Parse YYYY-MM-DD into a Date and format for display
  // Use component extraction to avoid timezone offset issues with new Date("YYYY-MM-DD")
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const formattedDate = formatDate(date, "EEEE, MMMM d, yyyy");

  return (
    <div role="listitem">
      <div className={cn("pro-calendr-react-list-date-header", classNames?.listDateHeader)}>
        {formattedDate}
      </div>
      {events.map((event) => (
        <ListEventRow
          key={event.id}
          event={event}
          eventContent={eventContent}
          onEventClick={onEventClick}
          hour12={hour12}
        />
      ))}
    </div>
  );
}
