import type { ReactNode } from "react";

interface CalendarProviderProps {
  children: ReactNode;
}

export function CalendarProvider({ children }: CalendarProviderProps) {
  return <>{children}</>;
}
