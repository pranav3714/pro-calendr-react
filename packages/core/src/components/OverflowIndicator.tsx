import { useCalendarConfig } from "./CalendarContext";
import { cn } from "../utils/cn";

interface OverflowIndicatorProps {
  count: number;
  onClick?: () => void;
}

export function OverflowIndicator({ count, onClick }: OverflowIndicatorProps) {
  const { classNames } = useCalendarConfig();

  return (
    <button
      className={cn("pro-calendr-react-overflow", classNames?.overflowIndicator)}
      onClick={onClick}
    >
      +{count} more
    </button>
  );
}
