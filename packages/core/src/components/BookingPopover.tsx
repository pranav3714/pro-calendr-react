import { useLayoutEffect, useRef, useState } from "react";
import type { BookingPopoverProps } from "../interfaces/ghost-props";
import type { PopoverPositionResult } from "../interfaces/popover-position";
import { computePopoverPosition } from "../utils/compute-popover-position";
import { formatTime } from "../utils/time-format";
import { cn } from "../utils/cn";

const POPOVER_GAP = 8;

interface StatusBadgeProps {
  readonly status: string;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const colorMap: Record<string, string> = {
    confirmed: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    "in-progress": "bg-blue-100 text-blue-700",
    completed: "bg-gray-100 text-gray-600",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
        colorMap[status] ?? "bg-gray-100 text-gray-600",
      )}
    >
      {status}
    </span>
  );
}

interface DetailItemProps {
  readonly label: string;
  readonly value: string;
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[11px] text-gray-400">{label}</span>
      <span className="truncate text-[12px] text-gray-700">{value}</span>
    </div>
  );
}

interface ActionButtonProps {
  readonly label: string;
  readonly onClick: () => void;
  readonly variant?: "danger" | "default";
}

function ActionButton({ label, onClick, variant }: ActionButtonProps) {
  const isDanger = variant === "danger";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors",
        isDanger && "text-red-600 hover:bg-red-50",
        !isDanger && "text-gray-600 hover:bg-gray-100",
      )}
    >
      {label}
    </button>
  );
}

export function BookingPopover({
  booking,
  typeConfig,
  anchor,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
}: BookingPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<PopoverPositionResult | null>(null);

  useLayoutEffect(() => {
    if (!popoverRef.current) {
      return;
    }

    const popoverWidth = popoverRef.current.offsetWidth;
    const popoverHeight = popoverRef.current.offsetHeight;

    const result = computePopoverPosition({
      anchorX: anchor.x,
      anchorY: anchor.y,
      popoverWidth,
      popoverHeight,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      gap: POPOVER_GAP,
    });

    setPosition(result);
  }, [anchor]);

  const timeRange = `${formatTime({ minutes: booking.startMinutes })} \u2013 ${formatTime({ minutes: booking.endMinutes })}`;
  const duration = booking.endMinutes - booking.startMinutes;
  const hasActions = onEdit ?? onDuplicate ?? onDelete;

  return (
    <div
      ref={popoverRef}
      data-popover
      className="pro-calendr-react-popover fixed z-[40] w-72 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"
      style={{
        top: position ? position.y : -9999,
        left: position ? position.x : -9999,
        visibility: position ? "visible" : "hidden",
        animation: "pro-calendr-react-fade-in 0.15s ease-out both",
      }}
    >
      {/* Color header bar */}
      <div className={cn("h-1.5 rounded-t-xl", typeConfig.headerBg)} />

      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", typeConfig.badge)}
            >
              {typeConfig.label}
            </span>
            <StatusBadge status={booking.status} />
          </div>
          <h3 className="mt-1.5 truncate text-sm font-semibold text-gray-900">{booking.title}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-2 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 3l8 8M11 3l-8 8" />
          </svg>
        </button>
      </div>

      {/* Details */}
      <div className="space-y-1.5 px-4 pb-3 pt-3">
        <DetailItem label="Time" value={`${timeRange} (${String(duration)}m)`} />
        {booking.student && <DetailItem label="Student" value={booking.student} />}
        {booking.instructor && <DetailItem label="Instructor" value={booking.instructor} />}
        {booking.aircraft && <DetailItem label="Aircraft" value={booking.aircraft} />}
        {booking.notes && <DetailItem label="Notes" value={booking.notes} />}
      </div>

      {/* Actions */}
      {hasActions && (
        <div className="flex items-center gap-1 border-t border-gray-100 px-3 py-2">
          {onEdit && <ActionButton label="Edit" onClick={onEdit} />}
          {onDuplicate && <ActionButton label="Duplicate" onClick={onDuplicate} />}
          {onDelete && <ActionButton label="Delete" onClick={onDelete} variant="danger" />}
        </div>
      )}
    </div>
  );
}
