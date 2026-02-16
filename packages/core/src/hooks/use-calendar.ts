import { useCalendarStore } from "../components/CalendarContext";

/**
 * Convenience hook for accessing calendar navigation state and actions.
 *
 * NOTE: This hook returns a new object reference on every render.
 * Each value is read via an atomic Zustand selector internally,
 * but the returned object itself is not stable.
 *
 * For performance-sensitive components, use atomic selectors directly:
 * ```ts
 * const currentView = useCalendarStore(s => s.currentView);
 * const setView = useCalendarStore(s => s.setView);
 * ```
 */
export function useCalendar() {
  const currentView = useCalendarStore((s) => s.currentView);
  const currentDate = useCalendarStore((s) => s.currentDate);
  const dateRange = useCalendarStore((s) => s.dateRange);
  const setView = useCalendarStore((s) => s.setView);
  const setDate = useCalendarStore((s) => s.setDate);
  const navigateDate = useCalendarStore((s) => s.navigateDate);
  return { currentView, currentDate, dateRange, setView, setDate, navigateDate };
}
