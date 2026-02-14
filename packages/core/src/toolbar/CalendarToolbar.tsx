import type { ReactNode } from "react";

interface CalendarToolbarProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
}

export function CalendarToolbar({ left, center, right }: CalendarToolbarProps) {
  return (
    <div data-testid="pro-calendr-react-toolbar" className="pro-calendr-react-toolbar">
      <div className="pro-calendr-react-toolbar-left">{left}</div>
      <div className="pro-calendr-react-toolbar-center">{center}</div>
      <div className="pro-calendr-react-toolbar-right">{right}</div>
    </div>
  );
}
