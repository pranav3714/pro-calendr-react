import type { CalendarViewType } from "../types";
import { useCalendarConfig } from "../components/CalendarContext";
import { cn } from "../utils/cn";

interface ViewSelectorProps {
  views?: CalendarViewType[];
  activeView?: CalendarViewType;
  onChange?: (view: CalendarViewType) => void;
}

export function ViewSelector({ views = [], activeView, onChange }: ViewSelectorProps) {
  const { classNames } = useCalendarConfig();

  return (
    <div className={cn("pro-calendr-react-view-selector", classNames?.viewSelector)}>
      {views.map((view) => (
        <button
          key={view}
          className="pro-calendr-react-btn"
          data-active={view === activeView}
          onClick={() => onChange?.(view)}
        >
          {view}
        </button>
      ))}
    </div>
  );
}
