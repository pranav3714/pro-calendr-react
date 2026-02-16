import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type Booking,
  type AnchorRect,
  WEEKDAY_LABELS,
  RESOURCE_GROUPS,
  BOOKING_TYPES,
  ROW_HEIGHT,
  GROUP_HEADER_HEIGHT,
  SIDEBAR_WIDTH,
  getWeekDays,
  isSameDay,
  generateBookingsForDate,
  formatTime,
} from "./scheduleData";
import { GroupIcons, ChevronIcon, ResourceAvatar } from "./scheduleIcons";
import BookingBlock from "./BookingBlock";

// ── Types ────────────────────────────────────────────────────────────────────

interface WeekViewProps {
  currentDate: Date;
  onBookingClick: (booking: Booking, rect: AnchorRect) => void;
  collapsedGroups: Set<string>;
  onToggleGroup: (groupId: string) => void;
  onDayClick: (day: Date) => void;
  bookingsCache: Map<string, Booking[]>;
  onBookingsChange: (dayKey: string, bookings: Booking[]) => void;
}

interface DragState {
  booking: Booking;
  sourceDayKey: string;
  sourceResourceId: string;
  offsetX: number;
  offsetY: number;
  startClientX: number;
  startClientY: number;
  currentX: number;
  currentY: number;
  isDragging: boolean;
}

interface HoveredCell {
  dayKey: string;
  resourceId: string;
}

interface ResourceRowLayout {
  resourceId: string;
  yStart: number;
  yEnd: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const DRAG_THRESHOLD = 5;

const dayKey = (d: Date): string =>
  `${String(d.getFullYear())}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// ── Component ────────────────────────────────────────────────────────────────

const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  onBookingClick,
  collapsedGroups,
  onToggleGroup,
  onDayClick,
  bookingsCache,
  onBookingsChange,
}) => {
  const today = useMemo(() => new Date(), []);
  const gridRef = useRef<HTMLDivElement>(null);

  // ── Computed data ────────────────────────────────────────────────────────

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  const initialWeekBookings = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const day of weekDays) {
      const dk = dayKey(day);
      const cached = bookingsCache.get(dk);
      map.set(dk, cached ?? generateBookingsForDate(day));
    }
    return map;
  }, [weekDays, bookingsCache]);

  const [weekBookings, setWeekBookings] = useState<Map<string, Booking[]>>(initialWeekBookings);

  useEffect(() => {
    setWeekBookings(initialWeekBookings);
  }, [initialWeekBookings]);

  // Index: "dayKey:resourceId" -> bookings[]
  const bookingIndex = useMemo(() => {
    const index = new Map<string, Booking[]>();
    for (const [dk, bookings] of weekBookings) {
      for (const booking of bookings) {
        const key = `${dk}:${booking.resourceId}`;
        const list = index.get(key);
        if (list) {
          list.push(booking);
        } else {
          index.set(key, [booking]);
        }
      }
    }
    return index;
  }, [weekBookings]);

  const totalHeight = useMemo(() => {
    let h = 0;
    for (const group of RESOURCE_GROUPS) {
      h += GROUP_HEADER_HEIGHT;
      if (!collapsedGroups.has(group.id)) {
        h += group.resources.length * ROW_HEIGHT;
      }
    }
    return h;
  }, [collapsedGroups]);

  const resourceRowLayout = useMemo(() => {
    const layout: ResourceRowLayout[] = [];
    let y = 0;
    for (const group of RESOURCE_GROUPS) {
      y += GROUP_HEADER_HEIGHT;
      if (!collapsedGroups.has(group.id)) {
        for (const resource of group.resources) {
          layout.push({
            resourceId: resource.id,
            yStart: y,
            yEnd: y + ROW_HEIGHT,
          });
          y += ROW_HEIGHT;
        }
      }
    }
    return layout;
  }, [collapsedGroups]);

  // ── Drag state ───────────────────────────────────────────────────────────

  const [dragState, setDragState] = useState<DragState | null>(null);
  const [hoveredCell, setHoveredCell] = useState<HoveredCell | null>(null);

  const handleDragStart = useCallback(
    (e: React.PointerEvent, booking: Booking, sourceDK: string) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setDragState({
        booking,
        sourceDayKey: sourceDK,
        sourceResourceId: booking.resourceId,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
        startClientX: e.clientX,
        startClientY: e.clientY,
        currentX: e.clientX,
        currentY: e.clientY,
        isDragging: false,
      });
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState) return;

      const dx = Math.abs(e.clientX - dragState.startClientX);
      const dy = Math.abs(e.clientY - dragState.startClientY);
      const isDragging = dragState.isDragging || dx + dy >= DRAG_THRESHOLD;

      setDragState((prev) =>
        prev
          ? {
              ...prev,
              currentX: e.clientX,
              currentY: e.clientY,
              isDragging,
            }
          : null,
      );

      if (isDragging && gridRef.current) {
        const gridRect = gridRef.current.getBoundingClientRect();
        const relX = e.clientX - gridRect.left;
        const relY = e.clientY - gridRect.top + gridRef.current.scrollTop;
        const colWidth = gridRect.width / 7;
        const colIndex = Math.max(0, Math.min(6, Math.floor(relX / colWidth)));
        const day = weekDays[colIndex];
        const dk = dayKey(day);

        // Find resource from y position
        let resourceId: string | null = null;
        for (const row of resourceRowLayout) {
          if (relY >= row.yStart && relY < row.yEnd) {
            resourceId = row.resourceId;
            break;
          }
        }

        if (resourceId) {
          setHoveredCell({ dayKey: dk, resourceId });
        } else {
          setHoveredCell(null);
        }
      }
    },
    [dragState, weekDays, resourceRowLayout],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState) return;

      if (!dragState.isDragging) {
        // It was a click, not a drag
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const anchorRect: AnchorRect = {
          top: rect.top,
          bottom: rect.bottom,
          left: rect.left,
          right: rect.right,
          width: rect.width,
          height: rect.height,
        };
        onBookingClick(dragState.booking, anchorRect);
      } else if (hoveredCell) {
        // Move booking to new cell
        const { booking, sourceDayKey, sourceResourceId } = dragState;
        const targetDK = hoveredCell.dayKey;
        const targetResourceId = hoveredCell.resourceId;

        if (targetDK !== sourceDayKey || targetResourceId !== sourceResourceId) {
          setWeekBookings((prev) => {
            const next = new Map(prev);

            // Remove from source
            const sourceBookings = [...(next.get(sourceDayKey) ?? [])];
            const idx = sourceBookings.findIndex((b) => b.id === booking.id);
            if (idx !== -1) sourceBookings.splice(idx, 1);
            next.set(sourceDayKey, sourceBookings);
            onBookingsChange(sourceDayKey, sourceBookings);

            // Add to target
            const targetBookings = [...(next.get(targetDK) ?? [])];
            const movedBooking: Booking = { ...booking, resourceId: targetResourceId };
            targetBookings.push(movedBooking);
            next.set(targetDK, targetBookings);
            onBookingsChange(targetDK, targetBookings);

            return next;
          });
        }
      }

      setDragState(null);
      setHoveredCell(null);
    },
    [dragState, hoveredCell, onBookingClick, onBookingsChange],
  );

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-white">
      <div className="relative flex-1 overflow-auto">
        <div className="relative min-w-full">
          {/* Day Headers */}
          <div className="sticky top-0 z-20 flex" style={{ height: 48 }}>
            {/* Corner cell */}
            <div
              className="sticky left-0 z-30 flex shrink-0 items-center border-b border-r border-gray-200 bg-gray-50 px-3"
              style={{ width: SIDEBAR_WIDTH }}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Resources
              </span>
            </div>
            {/* Day column headers */}
            {weekDays.map((day, i) => {
              const isToday = isSameDay(day, today);
              const isWeekend = i >= 5;
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  className={`flex flex-1 flex-col items-center justify-center border-b border-r border-gray-200 transition-colors hover:bg-gray-100 ${
                    isToday ? "bg-blue-50/60" : isWeekend ? "bg-gray-50/50" : "bg-gray-50"
                  }`}
                  onClick={() => {
                    onDayClick(day);
                  }}
                >
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider ${
                      isToday ? "text-blue-600" : "text-gray-400"
                    }`}
                  >
                    {WEEKDAY_LABELS[i]}
                  </span>
                  <span
                    className={`mt-0.5 flex items-center justify-center text-sm font-bold leading-none ${
                      isToday ? "h-7 w-7 rounded-full bg-blue-600 text-white" : "text-gray-700"
                    }`}
                  >
                    {day.getDate()}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Body */}
          <div className="flex" style={{ minHeight: totalHeight }}>
            {/* Sidebar */}
            <div
              className="sticky left-0 z-10 shrink-0 border-r border-gray-200 bg-white"
              style={{ width: SIDEBAR_WIDTH }}
            >
              {RESOURCE_GROUPS.map((group) => (
                <React.Fragment key={group.id}>
                  {/* Group header */}
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 border-b border-gray-100 bg-gray-50/80 px-3 text-left transition-colors hover:bg-gray-100"
                    style={{ height: GROUP_HEADER_HEIGHT }}
                    onClick={() => {
                      onToggleGroup(group.id);
                    }}
                  >
                    <span className="flex items-center text-gray-400">{GroupIcons[group.id]}</span>
                    <span className="flex-1 truncate text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                      {group.label}
                    </span>
                    <span className="rounded-full bg-gray-200/80 px-1.5 py-0.5 text-[9px] font-medium text-gray-500">
                      {group.resources.length}
                    </span>
                    <ChevronIcon
                      className="h-3.5 w-3.5 text-gray-400"
                      open={!collapsedGroups.has(group.id)}
                    />
                  </button>

                  {/* Resource rows */}
                  {!collapsedGroups.has(group.id) &&
                    group.resources.map((resource) => {
                      const isHighlighted =
                        dragState?.isDragging === true && hoveredCell?.resourceId === resource.id;
                      return (
                        <div
                          key={resource.id}
                          className={`flex items-center gap-2 border-b border-gray-100 px-3 transition-colors ${
                            isHighlighted ? "bg-blue-50/50" : ""
                          }`}
                          style={{ height: ROW_HEIGHT }}
                        >
                          <ResourceAvatar
                            groupId={group.id}
                            resourceName={resource.name}
                            size="sm"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-xs font-medium text-gray-800">
                              {resource.name}
                            </div>
                            <div className="truncate text-[10px] text-gray-400">
                              {resource.subLabel}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </React.Fragment>
              ))}
            </div>

            {/* Grid */}
            <div
              ref={gridRef}
              className="relative flex flex-1"
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              {/* Drag ghost */}
              {dragState?.isDragging === true && <WeekDragGhost dragState={dragState} />}

              {/* Day columns */}
              {weekDays.map((day) => {
                const dk = dayKey(day);
                const isToday = isSameDay(day, today);
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                return (
                  <div
                    key={dk}
                    className={`flex-1 border-r border-gray-100 ${
                      isToday ? "bg-blue-50/20" : isWeekend ? "bg-gray-50/30" : ""
                    }`}
                  >
                    {RESOURCE_GROUPS.map((group) => (
                      <React.Fragment key={group.id}>
                        {/* Group header spacer */}
                        <div
                          className="border-b border-gray-100"
                          style={{ height: GROUP_HEADER_HEIGHT }}
                        />

                        {/* Resource cells */}
                        {!collapsedGroups.has(group.id) &&
                          group.resources.map((resource) => {
                            const cellKey = `${dk}:${resource.id}`;
                            const cellBookings = bookingIndex.get(cellKey) ?? [];
                            const maxVisible = 2;
                            const overflow = cellBookings.length - maxVisible;
                            const isTarget =
                              dragState?.isDragging === true &&
                              hoveredCell?.dayKey === dk &&
                              hoveredCell.resourceId === resource.id;

                            return (
                              <div
                                key={resource.id}
                                className={`relative border-b border-gray-100 transition-colors ${
                                  isTarget ? "bg-blue-50/60" : ""
                                }`}
                                style={{ height: ROW_HEIGHT }}
                              >
                                {cellBookings.slice(0, maxVisible).map((booking, bi) => {
                                  const isDimmed =
                                    dragState?.isDragging === true &&
                                    dragState.booking.id === booking.id;
                                  return (
                                    <BookingBlock
                                      key={booking.id}
                                      booking={booking}
                                      compact
                                      style={{
                                        left: 0,
                                        right: 0,
                                        top: bi * 22 + 2,
                                        height: 20,
                                        opacity: isDimmed ? 0.3 : 1,
                                      }}
                                      onClick={(b, rect) => {
                                        onBookingClick(b, {
                                          top: rect.top,
                                          bottom: rect.bottom,
                                          left: rect.left,
                                          right: rect.right,
                                          width: rect.width,
                                          height: rect.height,
                                        });
                                      }}
                                      onDragStart={(e, b) => {
                                        handleDragStart(e, b, dk);
                                      }}
                                    />
                                  );
                                })}
                                {overflow > 0 && (
                                  <div
                                    className="absolute text-[9px] font-medium text-gray-400"
                                    style={{ left: 2, top: maxVisible * 22 + 2 }}
                                  >
                                    +{overflow} more
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </React.Fragment>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── WeekDragGhost ────────────────────────────────────────────────────────────

interface WeekDragGhostProps {
  dragState: DragState;
}

const WeekDragGhost: React.FC<WeekDragGhostProps> = ({ dragState }) => {
  const { booking, currentX, currentY, offsetX, offsetY } = dragState;
  const type = BOOKING_TYPES[booking.type] ?? BOOKING_TYPES.flight;

  return (
    <div
      className={`pointer-events-none fixed z-50 rounded border-l-[3px] ${type.border} ${type.bg} opacity-80 shadow-xl`}
      style={{
        left: currentX - offsetX,
        top: currentY - offsetY,
        width: 140,
        height: 20,
      }}
    >
      <div className="flex items-center gap-1 px-1.5">
        <span className={`truncate text-[10px] font-semibold leading-tight ${type.text}`}>
          {booking.title}
        </span>
        <span className={`shrink-0 text-[9px] leading-tight ${type.sub}`}>
          {formatTime(booking.startMinutes)}
        </span>
      </div>
    </div>
  );
};

export default WeekView;
