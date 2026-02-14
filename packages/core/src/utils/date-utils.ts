export function formatDate(date: Date, _format: string): string {
  return date.toISOString();
}

export function parseDate(value: string | Date): Date {
  return typeof value === "string" ? new Date(value) : value;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getDateRange(
  date: Date,
  _view: string,
): { start: Date; end: Date } {
  return { start: new Date(date), end: new Date(date) };
}
