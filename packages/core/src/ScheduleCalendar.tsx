import type { ScheduleCalendarProps } from "./interfaces/schedule-calendar-props";
import { cn } from "./utils/cn";
import { ScheduleProvider } from "./components/ScheduleProvider";
import { ScheduleCalendarShell } from "./components/ScheduleCalendarShell";

function resolveTheme({ darkMode }: { readonly darkMode?: boolean }): string | undefined {
  if (darkMode === true) {
    return "dark";
  }
  return undefined;
}

export function ScheduleCalendar({
  defaultViewMode,
  defaultDate,
  darkMode,
  className,
  ...shellProps
}: ScheduleCalendarProps) {
  return (
    <div className={cn("pro-calendr-react", className)} data-theme={resolveTheme({ darkMode })}>
      <ScheduleProvider defaultViewMode={defaultViewMode} defaultDate={defaultDate}>
        <ScheduleCalendarShell {...shellProps} />
      </ScheduleProvider>
    </div>
  );
}
