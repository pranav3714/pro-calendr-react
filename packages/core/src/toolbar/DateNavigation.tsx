import { useCalendarConfig } from "../components/CalendarContext";
import { cn } from "../utils/cn";

interface DateNavigationProps {
  onPrev?: () => void;
  onNext?: () => void;
  onToday?: () => void;
  title?: string;
}

export function DateNavigation({ onPrev, onNext, onToday, title }: DateNavigationProps) {
  const { classNames } = useCalendarConfig();

  return (
    <div className={cn("pro-calendr-react-date-nav", classNames?.dateNav)}>
      <button className="pro-calendr-react-btn" onClick={onToday}>
        Today
      </button>
      <button className="pro-calendr-react-btn" onClick={onPrev}>
        Prev
      </button>
      <button className="pro-calendr-react-btn" onClick={onNext}>
        Next
      </button>
      {title && <span>{title}</span>}
    </div>
  );
}
