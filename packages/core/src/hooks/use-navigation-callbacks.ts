import { useCallback } from "react";
import type { ViewMode } from "../interfaces/view-mode";
import { formatDateLabel } from "../utils/date-helpers";
import { navigateDate as navigateDateUtil } from "../utils/date-helpers";
import { useScheduleStore } from "./use-schedule-store";

interface UseNavigationCallbacksParams {
  readonly onDateChange?: (params: { readonly date: Date }) => void;
  readonly onViewModeChange?: (params: { readonly mode: ViewMode }) => void;
}

interface UseNavigationCallbacksResult {
  readonly viewMode: ViewMode;
  readonly currentDate: Date;
  readonly dateLabel: string;
  readonly handlePrev: () => void;
  readonly handleNext: () => void;
  readonly handleToday: () => void;
  readonly handleViewModeChange: (params: { readonly mode: ViewMode }) => void;
  readonly handleDayClick: (params: { readonly date: Date }) => void;
}

export function useNavigationCallbacks({
  onDateChange,
  onViewModeChange,
}: UseNavigationCallbacksParams): UseNavigationCallbacksResult {
  const viewMode = useScheduleStore({ selector: (s) => s.viewMode });
  const currentDate = useScheduleStore({ selector: (s) => s.currentDate });
  const storeNavigateDate = useScheduleStore({
    selector: (s) => s.navigateDate,
  });
  const storeSetViewMode = useScheduleStore({
    selector: (s) => s.setViewMode,
  });
  const storeSetCurrentDate = useScheduleStore({
    selector: (s) => s.setCurrentDate,
  });

  const dateLabel = formatDateLabel({ date: currentDate, viewMode });

  const handlePrev = useCallback(() => {
    const newDate = navigateDateUtil({
      date: currentDate,
      direction: "prev",
      viewMode,
    });
    storeNavigateDate({ direction: "prev" });
    onDateChange?.({ date: newDate });
  }, [currentDate, viewMode, storeNavigateDate, onDateChange]);

  const handleNext = useCallback(() => {
    const newDate = navigateDateUtil({
      date: currentDate,
      direction: "next",
      viewMode,
    });
    storeNavigateDate({ direction: "next" });
    onDateChange?.({ date: newDate });
  }, [currentDate, viewMode, storeNavigateDate, onDateChange]);

  const handleToday = useCallback(() => {
    storeNavigateDate({ direction: "today" });
    onDateChange?.({ date: new Date() });
  }, [storeNavigateDate, onDateChange]);

  const handleViewModeChange = useCallback(
    ({ mode }: { readonly mode: ViewMode }) => {
      storeSetViewMode({ mode });
      onViewModeChange?.({ mode });
    },
    [storeSetViewMode, onViewModeChange],
  );

  const handleDayClick = useCallback(
    ({ date }: { readonly date: Date }) => {
      storeSetCurrentDate({ date });
      storeSetViewMode({ mode: "day" });
      onDateChange?.({ date });
      onViewModeChange?.({ mode: "day" });
    },
    [storeSetCurrentDate, storeSetViewMode, onDateChange, onViewModeChange],
  );

  return {
    viewMode,
    currentDate,
    dateLabel,
    handlePrev,
    handleNext,
    handleToday,
    handleViewModeChange,
    handleDayClick,
  };
}
