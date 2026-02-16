import React, { useRef } from "react";
import { type Booking, BOOKING_TYPES, formatTime } from "./scheduleData";

// ── Inline SVG Icons ────────────────────────────────────────────────────────

const PlaneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className ?? "h-4 w-4"} viewBox="0 0 16 16" fill="currentColor">
    <path d="M6.428 1.151C6.708.591 7.213 0 8 0s1.292.592 1.572 1.151l.162.318c.1.196.2.41.267.544a4 4 0 0 0 .45.674l3.725 4.478a.5.5 0 0 1-.044.682l-.535.535a.5.5 0 0 1-.575.1L9.64 6.67a.5.5 0 0 0-.658.26L8.5 8.083l2.9 4.348a.5.5 0 0 1-.076.612l-.535.535a.5.5 0 0 1-.584.1L6.5 11.8l-.5 2.7a.5.5 0 0 1-.4.4l-.7.1a.5.5 0 0 1-.556-.378L3.5 11.5l-1-.5a.5.5 0 0 1-.1-.584l1.878-3.705a.5.5 0 0 1 .26-.658L6.67 5.64a.5.5 0 0 0 .1-.575L5.233 1.69c-.1-.196-.2-.41-.267-.544a4 4 0 0 0-.45-.674l-.162-.318z" />
  </svg>
);

const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className ?? "h-4 w-4"} viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
  </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className ?? "h-4 w-4"} viewBox="0 0 16 16" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm.75-10.25a.75.75 0 0 0-1.5 0v3.5c0 .199.079.39.22.53l2 2a.75.75 0 1 0 1.06-1.06l-1.78-1.78V4.75Z"
      clipRule="evenodd"
    />
  </svg>
);

// ── Constants ───────────────────────────────────────────────────────────────

const DRAG_THRESHOLD = 5;

// ── Props ───────────────────────────────────────────────────────────────────

interface BookingBlockProps {
  booking: Booking;
  style: React.CSSProperties;
  onClick?: (booking: Booking, rect: DOMRect) => void;
  onDragStart?: (e: React.PointerEvent, booking: Booking) => void;
  onResizeStart?: (e: React.PointerEvent, booking: Booking, edge: "left" | "right") => void;
  compact?: boolean;
}

// ── Component ───────────────────────────────────────────────────────────────

const BookingBlock: React.FC<BookingBlockProps> = React.memo(function BookingBlock({
  booking,
  style,
  onClick,
  onDragStart,
  onResizeStart,
  compact = false,
}: BookingBlockProps) {
  const type = BOOKING_TYPES[booking.type] ?? BOOKING_TYPES.flight;
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  const duration = booking.endMinutes - booking.startMinutes;
  const hours = Math.floor(duration / 60);
  const mins = duration % 60;
  const durationStr =
    hours > 0
      ? mins > 0
        ? `${String(hours)}h${String(mins)}m`
        : `${String(hours)}h`
      : `${String(mins)}m`;

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStart.current = { x: e.clientX, y: e.clientY };
    onDragStart?.(e, booking);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!pointerStart.current) {
      onClick?.(booking, e.currentTarget.getBoundingClientRect());
      return;
    }
    const dx = Math.abs(e.clientX - pointerStart.current.x);
    const dy = Math.abs(e.clientY - pointerStart.current.y);
    if (dx + dy < DRAG_THRESHOLD) {
      onClick?.(booking, e.currentTarget.getBoundingClientRect());
    }
    pointerStart.current = null;
  };

  // ── Compact mode (week view cells) ──────────────────────────────────────

  if (compact) {
    return (
      <button
        type="button"
        className={`rounded border-l-[3px] ${type.border} ${type.bg} overflow-hidden transition-all duration-150 hover:z-20 hover:shadow-md focus:outline-none focus:ring-2 ${type.ring} group text-left`}
        style={{ position: "absolute", ...style }}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        draggable
      >
        <div className="px-1 py-0.5">
          <div className={`truncate text-[10px] font-semibold leading-tight ${type.text}`}>
            {booking.title}
          </div>
          <div className={`text-[9px] leading-tight ${type.sub}`}>
            {formatTime(booking.startMinutes)}
          </div>
        </div>
      </button>
    );
  }

  // ── Full mode (day timeline) ────────────────────────────────────────────

  const handleResizePointerDown = (e: React.PointerEvent, edge: "left" | "right") => {
    e.stopPropagation();
    onResizeStart?.(e, booking, edge);
  };

  return (
    <button
      type="button"
      className={`rounded-md border-l-[3px] ${type.border} ${type.bg} cursor-grab select-none overflow-hidden transition-all duration-150 hover:z-30 hover:shadow-lg focus:outline-none focus:ring-2 active:cursor-grabbing ${type.ring} group text-left`}
      style={{ position: "absolute", ...style }}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
    >
      {/* Pending status dot */}
      {booking.status === "pending" && (
        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-white" />
      )}

      <div className="flex h-full flex-col justify-center gap-0.5 px-2 py-1">
        {/* Title row with optional type icon */}
        <div className="flex items-center gap-1">
          {booking.type === "flight" && <PlaneIcon className={`h-3 w-3 shrink-0 ${type.text}`} />}
          <span className={`truncate text-[11px] font-semibold leading-tight ${type.text}`}>
            {booking.title}
          </span>
        </div>

        {/* Student */}
        {booking.student && (
          <div className="flex items-center gap-1">
            <UserIcon className={`h-3 w-3 shrink-0 ${type.sub}`} />
            <span className={`truncate text-[10px] leading-tight ${type.sub}`}>
              {booking.student}
            </span>
          </div>
        )}

        {/* Duration badge */}
        <div className="flex items-center gap-1">
          <ClockIcon className={`h-3 w-3 shrink-0 ${type.sub}`} />
          <span className={`text-[10px] leading-tight ${type.sub}`}>{durationStr}</span>
        </div>
      </div>

      {/* Left resize handle */}
      <div
        className="absolute inset-y-0 left-0 w-1.5 cursor-col-resize opacity-0 transition-opacity group-hover:opacity-100"
        onPointerDown={(e) => {
          handleResizePointerDown(e, "left");
        }}
      />

      {/* Right resize handle */}
      <div
        className="absolute inset-y-0 right-0 w-1.5 cursor-col-resize opacity-0 transition-opacity group-hover:opacity-100"
        onPointerDown={(e) => {
          handleResizePointerDown(e, "right");
        }}
      />
    </button>
  );
});

export default BookingBlock;
