interface FormatTimeParams {
  readonly minutes: number;
}

export function formatTime({ minutes }: FormatTimeParams): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export function formatTimeShort({ minutes }: FormatTimeParams): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours)}:${String(mins).padStart(2, "0")}`;
}
