import type { CalendarViewType } from "../types";

interface ViewSelectorProps {
  views?: CalendarViewType[];
  activeView?: CalendarViewType;
  onChange?: (view: CalendarViewType) => void;
}

export function ViewSelector({ views = [], activeView, onChange }: ViewSelectorProps) {
  return (
    <div className="pro-calendr-react-view-selector">
      {views.map((view) => (
        <button key={view} data-active={view === activeView} onClick={() => onChange?.(view)}>
          {view}
        </button>
      ))}
    </div>
  );
}
