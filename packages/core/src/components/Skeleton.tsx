import { useCalendarConfig } from "./CalendarContext";
import { cn } from "../utils/cn";

interface SkeletonProps {
  count?: number;
}

export function Skeleton({ count = 5 }: SkeletonProps) {
  const { classNames } = useCalendarConfig();

  return (
    <div className={cn("pro-calendr-react-skeleton", classNames?.skeleton)}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="pro-calendr-react-skeleton-bar" />
      ))}
    </div>
  );
}
