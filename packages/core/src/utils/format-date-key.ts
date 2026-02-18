import { format } from "date-fns";

interface FormatDateKeyParams {
  readonly date: Date;
}

export function formatDateKey({ date }: FormatDateKeyParams): string {
  return format(date, "yyyy-MM-dd");
}
