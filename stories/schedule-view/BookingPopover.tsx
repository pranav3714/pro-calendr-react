import React, { useEffect, useRef, useState } from "react";
import { type Booking, type AnchorRect, BOOKING_TYPES, formatTime } from "./scheduleData";

// ── Status Styles ───────────────────────────────────────────────────────────

const STATUS_STYLES = {
  confirmed: { label: "Confirmed", className: "bg-emerald-100 text-emerald-700" },
  pending: { label: "Pending", className: "bg-amber-100 text-amber-700" },
} as const;

// ── Props ───────────────────────────────────────────────────────────────────

interface BookingPopoverProps {
  booking: Booking;
  anchorRect: AnchorRect;
  onClose: () => void;
  onEdit?: (booking: Booking) => void;
  onDelete?: (booking: Booking) => void;
  onDuplicate?: (booking: Booking) => void;
}

// ── Inline SVG Icons ────────────────────────────────────────────────────────

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className ?? "h-4 w-4"} viewBox="0 0 16 16" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm.75-10.25a.75.75 0 0 0-1.5 0v3.5c0 .199.079.39.22.53l2 2a.75.75 0 1 0 1.06-1.06l-1.78-1.78V4.75Z"
      clipRule="evenodd"
    />
  </svg>
);

const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className ?? "h-4 w-4"} viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
  </svg>
);

const PersonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className ?? "h-4 w-4"} viewBox="0 0 16 16" fill="currentColor">
    <path d="M11.5 6.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0ZM3 14s-1 0-1-1 1-5 6-5 6 4 6 5-1 1-1 1H3Z" />
  </svg>
);

const PlaneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className ?? "h-4 w-4"} viewBox="0 0 16 16" fill="currentColor">
    <path d="M6.428 1.151C6.708.591 7.213 0 8 0s1.292.592 1.572 1.151l.162.318c.1.196.2.41.267.544a4 4 0 0 0 .45.674l3.725 4.478a.5.5 0 0 1-.044.682l-.535.535a.5.5 0 0 1-.575.1L9.64 6.67a.5.5 0 0 0-.658.26L8.5 8.083l2.9 4.348a.5.5 0 0 1-.076.612l-.535.535a.5.5 0 0 1-.584.1L6.5 11.8l-.5 2.7a.5.5 0 0 1-.4.4l-.7.1a.5.5 0 0 1-.556-.378L3.5 11.5l-1-.5a.5.5 0 0 1-.1-.584l1.878-3.705a.5.5 0 0 1 .26-.658L6.67 5.64a.5.5 0 0 0 .1-.575L5.233 1.69c-.1-.196-.2-.41-.267-.544a4 4 0 0 0-.45-.674l-.162-.318z" />
  </svg>
);

const ChatIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className ?? "h-4 w-4"} viewBox="0 0 16 16" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M1 8.74v4.51a.75.75 0 0 0 1.28.53l2.72-2.72H11a4 4 0 0 0 0-8H5a4 4 0 0 0-4 4v1.69ZM4.25 6a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5H5A.75.75 0 0 1 4.25 6ZM5 8.25a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5H5Z"
      clipRule="evenodd"
    />
  </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className ?? "h-4 w-4"} viewBox="0 0 16 16" fill="currentColor">
    <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
  </svg>
);

// ── Component ───────────────────────────────────────────────────────────────

const BookingPopover: React.FC<BookingPopoverProps> = React.memo(function BookingPopover({
  booking,
  anchorRect,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
}: BookingPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const type = BOOKING_TYPES[booking.type] ?? BOOKING_TYPES.flight;
  const statusStyle = STATUS_STYLES[booking.status];

  const duration = booking.endMinutes - booking.startMinutes;
  const hours = Math.floor(duration / 60);
  const mins = duration % 60;
  const durationStr =
    hours > 0
      ? mins > 0
        ? `${String(hours)}h ${String(mins)}m`
        : `${String(hours)}h`
      : `${String(mins)}m`;

  // ── Positioning ─────────────────────────────────────────────────────────

  useEffect(() => {
    const popoverEl = popoverRef.current;
    if (!popoverEl) return;

    const popoverRect = popoverEl.getBoundingClientRect();
    const gap = 8;

    // Prefer below
    let top = anchorRect.bottom + gap;
    if (top + popoverRect.height > window.innerHeight) {
      // Fall back to above
      top = anchorRect.top - popoverRect.height - gap;
    }

    // Center horizontally on anchor, clamped to viewport
    let left = anchorRect.left + anchorRect.width / 2 - popoverRect.width / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - popoverRect.width - 8));

    setPosition({ top, left });
  }, [anchorRect]);

  // ── Close on outside click ──────────────────────────────────────────────

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [onClose]);

  // ── Close on Escape ─────────────────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <>
      {/* Keyframe animation */}
      <style>{`
        @keyframes popoverIn {
          from {
            opacity: 0;
            transform: translateY(4px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      {/* Transparent backdrop */}
      <div className="fixed inset-0" style={{ zIndex: 60 }} />

      {/* Popover card */}
      <div
        ref={popoverRef}
        className="w-80 rounded-xl border border-gray-200 bg-white shadow-2xl"
        style={{
          position: "fixed",
          zIndex: 61,
          top: position.top,
          left: position.left,
          animation: "popoverIn 150ms ease-out",
        }}
      >
        {/* Color header bar */}
        <div className={`h-[1.5px] ${type.headerBg} rounded-t-xl`} />

        {/* Header section */}
        <div className="relative px-4 pb-2 pt-3">
          {/* Close button */}
          <button
            type="button"
            className="absolute right-2 top-2 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            onClick={onClose}
          >
            <CloseIcon className="h-4 w-4" />
          </button>

          {/* Type badge + status badge */}
          <div className="mb-1.5 flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${type.badge}`}
            >
              {type.label}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusStyle.className}`}
            >
              {statusStyle.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="pr-6 text-base font-semibold text-gray-900">{booking.title}</h3>
        </div>

        {/* Details section */}
        <div className="space-y-2 px-4 pb-3">
          {/* Time */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ClockIcon className="h-4 w-4 shrink-0 text-gray-400" />
            <span>
              {formatTime(booking.startMinutes)} &ndash; {formatTime(booking.endMinutes)}
            </span>
            <span className="text-xs text-gray-400">({durationStr})</span>
          </div>

          {/* Student */}
          {booking.student && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <UserIcon className="h-4 w-4 shrink-0 text-gray-400" />
              <span>{booking.student}</span>
            </div>
          )}

          {/* Instructor */}
          {booking.instructor && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <PersonIcon className="h-4 w-4 shrink-0 text-gray-400" />
              <span>{booking.instructor}</span>
            </div>
          )}

          {/* Aircraft */}
          {booking.aircraft && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <PlaneIcon className="h-4 w-4 shrink-0 text-gray-400" />
              <span>{booking.aircraft}</span>
            </div>
          )}

          {/* Notes */}
          {booking.notes && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <ChatIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <span className="italic">{booking.notes}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Action buttons */}
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100"
              onClick={() => onEdit?.(booking)}
            >
              Edit
            </button>
            <button
              type="button"
              className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100"
              onClick={() => onDuplicate?.(booking)}
            >
              Duplicate
            </button>
          </div>
          <button
            type="button"
            className="rounded-md px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
            onClick={() => onDelete?.(booking)}
          >
            Delete
          </button>
        </div>
      </div>
    </>
  );
});

export default BookingPopover;
