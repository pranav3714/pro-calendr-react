import {
  addDays,
  addWeeks,
  addMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
  isSameDay as dateFnsIsSameDay,
} from "date-fns";
import type { ViewMode } from "../interfaces/view-mode";

interface IsSameDayParams {
  readonly dateA: Date;
  readonly dateB: Date;
}

export function isSameDay({ dateA, dateB }: IsSameDayParams): boolean {
  return dateFnsIsSameDay(dateA, dateB);
}

interface GetWeekDaysParams {
  readonly date: Date;
}

export function getWeekDays({ date }: GetWeekDaysParams): Date[] {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

interface GetMonthDaysParams {
  readonly date: Date;
}

export function getMonthDays({ date }: GetMonthDaysParams): Date[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let current = gridStart;
  while (current <= gridEnd) {
    days.push(current);
    current = addDays(current, 1);
  }
  return days;
}

interface FormatDateFullParams {
  readonly date: Date;
}

export function formatDateFull({ date }: FormatDateFullParams): string {
  return format(date, "EEEE, d MMMM yyyy");
}

interface FormatDateShortParams {
  readonly date: Date;
}

export function formatDateShort({ date }: FormatDateShortParams): string {
  return format(date, "d MMM");
}

interface FormatDateLabelParams {
  readonly date: Date;
  readonly viewMode: ViewMode;
}

export function formatDateLabel({ date, viewMode }: FormatDateLabelParams): string {
  if (viewMode === "day") {
    return formatDateFull({ date });
  }

  if (viewMode === "week") {
    const days = getWeekDays({ date });
    const first = days[0];
    const last = days[6];
    return `${formatDateShort({ date: first })} – ${formatDateShort({ date: last })}`;
  }

  return format(date, "MMMM yyyy");
}

interface NavigateDateParams {
  readonly date: Date;
  readonly direction: "prev" | "next" | "today";
  readonly viewMode: ViewMode;
}

export function navigateDate({ date, direction, viewMode }: NavigateDateParams): Date {
  if (direction === "today") {
    return new Date();
  }

  const delta = direction === "next" ? 1 : -1;

  if (viewMode === "day") {
    return addDays(date, delta);
  }

  if (viewMode === "week") {
    return addWeeks(date, delta);
  }

  return addMonths(date, delta);
}
