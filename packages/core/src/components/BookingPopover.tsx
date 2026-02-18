import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
    confirmed: "bg-[var(--cal-status-confirmed-bg)] text-[var(--cal-status-confirmed-text)]",
    pending: "bg-[var(--cal-status-pending-bg)] text-[var(--cal-status-pending-text)]",
    "in-progress":
      "bg-[var(--cal-status-in-progress-bg)] text-[var(--cal-status-in-progress-text)]",
    completed: "bg-[var(--cal-status-completed-bg)] text-[var(--cal-status-completed-text)]",
    cancelled: "bg-[var(--cal-status-cancelled-bg)] text-[var(--cal-status-cancelled-text)]",
  };

  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
        colorMap[status] ??
          "bg-[var(--cal-status-completed-bg)] text-[var(--cal-status-completed-text)]",
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
      <span className="text-[11px] text-[var(--cal-text-subtle)]">{label}</span>
      <span className="truncate text-[12px] text-[var(--cal-text-muted)]">{value}</span>
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
        isDanger && "text-red-500 hover:bg-red-500/10",
        !isDanger && "text-[var(--cal-text-muted)] hover:bg-[var(--cal-hover-bg)]",
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
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<Element | null>(null);
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

  useEffect(() => {
    triggerRef.current = document.activeElement;
    closeButtonRef.current?.focus();

    return () => {
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    };
  }, []);

  function handleKeyDown(e: React.KeyboardEvent): void {
    if (e.key !== "Tab") {
      return;
    }
    if (!popoverRef.current) {
      return;
    }

    const focusable = popoverRef.current.querySelectorAll<HTMLElement>(
      'button:not(:disabled), [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
      return;
    }

    if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  const timeRange = `${formatTime({ minutes: booking.startMinutes })} \u2013 ${formatTime({ minutes: booking.endMinutes })}`;
  const duration = booking.endMinutes - booking.startMinutes;
  const hasActions = onEdit ?? onDuplicate ?? onDelete;

  return (
    <div
      ref={popoverRef}
      data-popover
      role="dialog"
      aria-modal="true"
      aria-labelledby="cal-popover-title"
      onKeyDown={handleKeyDown}
      className="pro-calendr-react-popover fixed z-[40] w-72 overflow-hidden rounded-xl border border-[var(--cal-border)] bg-[var(--cal-bg)] shadow-[var(--cal-shadow-lg)]"
      style={{
        top: position ? position.y : -9999,
        left: position ? position.x : -9999,
        visibility: position ? "visible" : "hidden",
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
          <h3
            id="cal-popover-title"
            className="mt-1.5 truncate text-sm font-semibold text-[var(--cal-text)]"
          >
            {booking.title}
          </h3>
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="ml-2 rounded-md p-1 text-[var(--cal-text-subtle)] transition-colors hover:bg-[var(--cal-hover-bg)] hover:text-[var(--cal-text-muted)]"
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
        <div className="flex items-center gap-1 border-t border-[var(--cal-border-light)] px-3 py-2">
          {onEdit && <ActionButton label="Edit" onClick={onEdit} />}
          {onDuplicate && <ActionButton label="Duplicate" onClick={onDuplicate} />}
          {onDelete && <ActionButton label="Delete" onClick={onDelete} variant="danger" />}
        </div>
      )}
    </div>
  );
}
