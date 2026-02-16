import type { ReactNode } from "react";
import { useCalendarConfig } from "../components/CalendarContext";
import { cn } from "../utils/cn";

interface CalendarToolbarProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
}

export function CalendarToolbar({ left, center, right }: CalendarToolbarProps) {
  const { classNames } = useCalendarConfig();

  return (
    <div
      data-testid="pro-calendr-react-toolbar"
      className={cn("pro-calendr-react-toolbar", classNames?.toolbar)}
    >
      <div className="pro-calendr-react-toolbar-left">{left}</div>
      <div className="pro-calendr-react-toolbar-center">{center}</div>
      <div className="pro-calendr-react-toolbar-right">{right}</div>
    </div>
  );
}
