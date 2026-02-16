import { useState, useMemo, useCallback } from "react";
import DayView from "./DayView";
import WeekView from "./WeekView";
import MonthView from "./MonthView";
import BookingPopover from "./BookingPopover";
import {
  BOOKING_TYPES,
  DAY_START_HOUR,
  DAY_END_HOUR,
  generateBookingsForDate,
  formatDateFull,
  MONTH_NAMES,
  getWeekDays,
  isSameDay,
} from "./scheduleData";
import type { Booking, AnchorRect } from "./scheduleData";

// ── Inline Icons ─────────────────────────────────────────────────────────────

const ChevronLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const FilterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
    />
  </svg>
);

const CloseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// ── Types ────────────────────────────────────────────────────────────────────

type ViewMode = "day" | "week" | "month";

const VIEW_MODES: { id: ViewMode; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
];

// ── Component ────────────────────────────────────────────────────────────────

interface ScheduleViewProps {
  onClose?: () => void;
  dayStartHour?: number;
  dayEndHour?: number;
}

const ScheduleView = ({
  onClose,
  dayStartHour = DAY_START_HOUR,
  dayEndHour = DAY_END_HOUR,
}: ScheduleViewProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [bookingsCache, setBookingsCache] = useState(() => new Map<string, Booking[]>());
  const [collapsedGroups, setCollapsedGroups] = useState(() => new Set<string>());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [popoverAnchor, setPopoverAnchor] = useState<AnchorRect | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  // Get/generate bookings for current date (cached)
  const dateKey = currentDate.toISOString().slice(0, 10);
  const bookings = useMemo(() => {
    if (bookingsCache.has(dateKey)) return bookingsCache.get(dateKey) ?? [];
    return generateBookingsForDate(currentDate);
  }, [currentDate, dateKey, bookingsCache]);

  // Filter bookings by type
  const filteredBookings = useMemo(() => {
    if (!typeFilter) return bookings;
    return bookings.filter((b) => b.type === typeFilter);
  }, [bookings, typeFilter]);

  // Navigation
  const navigateDate = useCallback(
    (direction: number) => {
      const d = new Date(currentDate);
      if (viewMode === "day") d.setDate(d.getDate() + direction);
      else if (viewMode === "week") d.setDate(d.getDate() + direction * 7);
      else d.setMonth(d.getMonth() + direction);
      setCurrentDate(d);
    },
    [currentDate, viewMode],
  );

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const handleDayClick = useCallback((day: Date) => {
    setCurrentDate(day);
    setViewMode("day");
  }, []);

  const toggleGroup = useCallback((groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);

  const handleBookingClick = useCallback((booking: Booking, rect: AnchorRect) => {
    setSelectedBooking(booking);
    setPopoverAnchor(rect);
  }, []);

  const handleBookingsChange = useCallback(
    (updated: Booking[]) => {
      setBookingsCache((prev) => {
        const next = new Map(prev);
        next.set(dateKey, updated);
        return next;
      });
    },
    [dateKey],
  );

  const handleWeekBookingsChange = useCallback((dayKey: string, updatedBookings: Booking[]) => {
    setBookingsCache((prev) => {
      const next = new Map(prev);
      next.set(dayKey, updatedBookings);
      return next;
    });
  }, []);

  const closePopover = useCallback(() => {
    setSelectedBooking(null);
    setPopoverAnchor(null);
  }, []);

  // Format header date label
  const dateLabel = useMemo(() => {
    if (viewMode === "day") return formatDateFull(currentDate);
    if (viewMode === "week") {
      const days = getWeekDays(currentDate);
      const first = days[0];
      const last = days[6];
      if (first.getMonth() === last.getMonth()) {
        return `${String(first.getDate())} – ${String(last.getDate())} ${MONTH_NAMES[first.getMonth()]} ${String(first.getFullYear())}`;
      }
      return `${String(first.getDate())} ${MONTH_NAMES[first.getMonth()].slice(0, 3)} – ${String(last.getDate())} ${MONTH_NAMES[last.getMonth()].slice(0, 3)} ${String(last.getFullYear())}`;
    }
    return `${MONTH_NAMES[currentDate.getMonth()]} ${String(currentDate.getFullYear())}`;
  }, [currentDate, viewMode]);

  // Booking stats for the header
  const stats = useMemo(() => {
    const total = filteredBookings.length;
    const byType: Record<string, number> = {};
    for (const b of filteredBookings) {
      byType[b.type] = (byType[b.type] ?? 0) + 1;
    }
    return { total, byType };
  }, [filteredBookings]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-50">
      {/* ── Header ── */}
      <header className="shrink-0 border-b border-gray-200 bg-white">
        {/* Top row */}
        <div className="flex items-center justify-between px-4 py-2.5">
          {/* Left: Title + Close */}
          <div className="flex items-center gap-3">
            {onClose && (
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                title="Close schedule"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              <h1 className="text-lg font-bold text-gray-900">Schedule</h1>
            </div>
          </div>

          {/* Center: Date navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigateDate(-1);
              }}
              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>

            <button
              onClick={goToToday}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                isSameDay(currentDate, new Date())
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Today
            </button>

            <button
              onClick={() => {
                navigateDate(1);
              }}
              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>

            <span className="ml-2 min-w-[200px] text-sm font-semibold text-gray-800">
              {dateLabel}
            </span>
          </div>

          {/* Right: View mode + Filter */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg bg-gray-100 p-0.5">
              {VIEW_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    setViewMode(mode.id);
                  }}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                    viewMode === mode.id
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Filter toggle */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowFilter(!showFilter);
                }}
                className={`rounded-lg p-2 transition-colors ${
                  typeFilter || showFilter
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                }`}
              >
                <FilterIcon className="h-4 w-4" />
                {typeFilter && (
                  <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-blue-500" />
                )}
              </button>

              {/* Filter dropdown */}
              {showFilter && (
                <div className="absolute right-0 top-full z-30 mt-1 w-52 rounded-xl border border-gray-200 bg-white py-1 shadow-xl">
                  <button
                    onClick={() => {
                      setTypeFilter(null);
                      setShowFilter(false);
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      !typeFilter
                        ? "bg-blue-50 font-medium text-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-gray-300" />
                    All Types
                    {!typeFilter && <span className="ml-auto text-xs text-blue-500">Active</span>}
                  </button>
                  {Object.entries(BOOKING_TYPES).map(([key, bt]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setTypeFilter(key);
                        setShowFilter(false);
                      }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors ${
                        typeFilter === key
                          ? "bg-blue-50 font-medium text-blue-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${bt.dot}`} />
                      {bt.label}
                      {typeFilter === key && (
                        <span className="ml-auto text-xs text-blue-500">Active</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats bar (day view only) */}
        {viewMode === "day" && (
          <div className="flex items-center gap-3 overflow-x-auto px-4 pb-2">
            <span className="shrink-0 text-[11px] font-medium text-gray-400">
              {stats.total} bookings
            </span>
            <div className="h-3 w-px bg-gray-200" />
            <div className="flex items-center gap-2 overflow-x-auto">
              {Object.entries(stats.byType).map(([type, count]) => {
                const bt = BOOKING_TYPES[type];
                return (
                  <button
                    key={type}
                    onClick={() => {
                      setTypeFilter(typeFilter === type ? null : type);
                    }}
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                      typeFilter === type
                        ? `${bt.badge} ring-1 ring-offset-1 ${bt.ring}`
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${bt.dot}`} />
                    {count} {bt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* ── View Body ── */}
      {viewMode === "day" && (
        <DayView
          bookings={filteredBookings}
          onBookingClick={handleBookingClick}
          onBookingsChange={handleBookingsChange}
          collapsedGroups={collapsedGroups}
          onToggleGroup={toggleGroup}
          dayStartHour={dayStartHour}
          dayEndHour={dayEndHour}
        />
      )}
      {viewMode === "week" && (
        <WeekView
          currentDate={currentDate}
          onBookingClick={handleBookingClick}
          collapsedGroups={collapsedGroups}
          onToggleGroup={toggleGroup}
          onDayClick={handleDayClick}
          bookingsCache={bookingsCache}
          onBookingsChange={handleWeekBookingsChange}
        />
      )}
      {viewMode === "month" && <MonthView currentDate={currentDate} onDayClick={handleDayClick} />}

      {/* ── Legend (bottom bar) ── */}
      <footer className="flex shrink-0 items-center gap-4 overflow-x-auto border-t border-gray-200 bg-white px-4 py-1.5">
        <span className="shrink-0 text-[10px] font-medium text-gray-400">Legend</span>
        {Object.entries(BOOKING_TYPES).map(([key, bt]) => (
          <div key={key} className="flex shrink-0 items-center gap-1.5">
            <span className={`h-2 w-2 rounded-sm ${bt.dot}`} />
            <span className="text-[10px] text-gray-500">{bt.label}</span>
          </div>
        ))}
      </footer>

      {/* ── Booking Popover ── */}
      {selectedBooking && popoverAnchor && (
        <BookingPopover
          booking={selectedBooking}
          anchorRect={popoverAnchor}
          onClose={closePopover}
          onEdit={() => {
            closePopover();
          }}
          onDelete={() => {
            handleBookingsChange(bookings.filter((b) => b.id !== selectedBooking.id));
            closePopover();
          }}
          onDuplicate={() => {
            const dayEndMinutes = dayEndHour * 60;
            const dayStartMinutes = dayStartHour * 60;
            const duration = selectedBooking.endMinutes - selectedBooking.startMinutes;
            const dupEnd = Math.min(selectedBooking.endMinutes + 30, dayEndMinutes);
            const dupStart = Math.max(dupEnd - duration, dayStartMinutes);
            const dup: Booking = {
              ...selectedBooking,
              id: `${selectedBooking.id}-dup-${String(Date.now())}`,
              startMinutes: dupStart,
              endMinutes: dupEnd,
            };
            handleBookingsChange([...bookings, dup]);
            closePopover();
          }}
        />
      )}
    </div>
  );
};

export default ScheduleView;
