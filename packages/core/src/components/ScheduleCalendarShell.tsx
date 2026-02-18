import { useMemo } from "react";
import type { ScheduleCalendarShellProps } from "../interfaces/schedule-shell-props";
import { BOOKING_TYPES } from "../constants/booking-types";
import { LAYOUT_DEFAULTS } from "../constants/layout-defaults";
import { useNavigationCallbacks } from "../hooks/use-navigation-callbacks";
import { useKeyboardNavigation } from "../hooks/use-keyboard-navigation";
import { ScheduleHeader } from "./ScheduleHeader";
import { StatsBar } from "./StatsBar";
import { ViewBody } from "./ViewBody";
import { LegendFooter } from "./LegendFooter";

export function ScheduleCalendarShell({
  bookings,
  resourceGroups,
  bookingTypes: bookingTypesProp,
  layoutConfig: layoutConfigProp,
  onBookingClick,
  onBookingDrop,
  onBookingResize,
  onSlotSelect,
  onDateChange,
  onViewModeChange,
  onBookingDelete,
  onBookingDuplicate,
  onBookingEdit,
  onWeekBookingDrop,
  onClose,
  title,
}: ScheduleCalendarShellProps) {
  const resolvedBookingTypes = useMemo(() => bookingTypesProp ?? BOOKING_TYPES, [bookingTypesProp]);

  const resolvedLayoutConfig = useMemo(
    () => ({ ...LAYOUT_DEFAULTS, ...layoutConfigProp }),
    [layoutConfigProp],
  );

  useKeyboardNavigation({ enabled: true });

  const nav = useNavigationCallbacks({
    onDateChange,
    onViewModeChange,
  });

  const isDayView = nav.viewMode === "day";

  return (
    <div className="pro-calendr-react-container flex h-full flex-col">
      <ScheduleHeader
        bookingTypes={resolvedBookingTypes}
        viewMode={nav.viewMode}
        currentDate={nav.currentDate}
        dateLabel={nav.dateLabel}
        onPrev={nav.handlePrev}
        onNext={nav.handleNext}
        onToday={nav.handleToday}
        onViewModeChange={nav.handleViewModeChange}
        onClose={onClose}
        title={title}
      />

      {isDayView && <StatsBar bookings={bookings} bookingTypes={resolvedBookingTypes} />}

      <div className="pro-calendr-react-body relative flex flex-1 overflow-hidden">
        <ViewBody
          bookings={bookings}
          resourceGroups={resourceGroups}
          layoutConfig={resolvedLayoutConfig}
          bookingTypes={resolvedBookingTypes}
          onBookingClick={onBookingClick}
          onBookingDrop={onBookingDrop}
          onBookingResize={onBookingResize}
          onSlotSelect={onSlotSelect}
          onBookingDelete={onBookingDelete}
          onBookingDuplicate={onBookingDuplicate}
          onBookingEdit={onBookingEdit}
          onWeekBookingDrop={onWeekBookingDrop}
          onDayClick={nav.handleDayClick}
        />
      </div>

      <LegendFooter bookingTypes={resolvedBookingTypes} />
    </div>
  );
}
