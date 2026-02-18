import type { ScheduleCalendarProps } from "./schedule-calendar-props";

export type ScheduleCalendarShellProps = Omit<
  ScheduleCalendarProps,
  "defaultViewMode" | "defaultDate" | "darkMode" | "className"
>;
