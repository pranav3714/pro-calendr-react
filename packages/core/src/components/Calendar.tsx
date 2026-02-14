import { forwardRef } from "react";
import type { CalendarProps, CalendarRef } from "../types";

export const Calendar = forwardRef<CalendarRef, CalendarProps>(function Calendar(
  _props,
  _ref,
) {
  return <div data-testid="pro-calendr-react" className="pro-calendr-react" />;
});
