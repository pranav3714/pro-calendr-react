import { memo, useRef } from "react";
import type { MouseEvent } from "react";
import type { BookingBlockProps } from "../interfaces/shared-component-props";
import type { Booking } from "../interfaces/booking";
import type { BookingTypeConfig } from "../interfaces/booking-type";
import { cn } from "../utils/cn";
import { formatTime } from "../utils/time-format";
import { PlaneIcon } from "./icons/PlaneIcon";
import { UserIcon } from "./icons/UserIcon";
import { ClockIcon } from "./icons/ClockIcon";

const CLICK_THRESHOLD = 5;
const NARROW_WIDTH = 80;
const TINY_WIDTH = 50;

interface ShouldShowPlaneIconParams {
  readonly isTiny: boolean;
  readonly bookingType: string;
}

function shouldShowPlaneIcon({ isTiny, bookingType }: ShouldShowPlaneIconParams): boolean {
  if (isTiny) {
    return false;
  }
  return bookingType === "flight";
}

interface TitleRowProps {
  readonly booking: Booking;
  readonly typeConfig: BookingTypeConfig;
  readonly isTiny: boolean;
}

function TitleRow({ booking, typeConfig, isTiny }: TitleRowProps) {
  return (
    <div className="flex min-w-0 items-center gap-1">
      {shouldShowPlaneIcon({ isTiny, bookingType: booking.type }) && <PlaneIcon />}
      <span className={cn("truncate text-[11px] font-semibold leading-tight", typeConfig.text)}>
        {booking.title}
      </span>
    </div>
  );
}

interface DetailsRowProps {
  readonly booking: Booking;
  readonly typeConfig: BookingTypeConfig;
  readonly isTiny: boolean;
}

function DetailsRow({ booking, typeConfig, isTiny }: DetailsRowProps) {
  const duration = booking.endMinutes - booking.startMinutes;

  return (
    <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
      {booking.student && (
        <span className={cn("flex items-center gap-0.5 truncate text-[10px]", typeConfig.sub)}>
          <UserIcon />
          {booking.student.split(" ")[0]}
        </span>
      )}
      {!isTiny && (
        <span className={cn("flex items-center gap-0.5 truncate text-[10px]", typeConfig.sub)}>
          <ClockIcon />
          {duration}m
        </span>
      )}
    </div>
  );
}

interface StatusDotProps {
  readonly status: Booking["status"];
}

function StatusDot({ status }: StatusDotProps) {
  if (status !== "pending") {
    return null;
  }
  return (
    <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-400 ring-2 ring-amber-100" />
  );
}

function BookingBlockInner({
  booking,
  left,
  width,
  top,
  height,
  typeConfig,
  onClick,
}: BookingBlockProps) {
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const isNarrow = width < NARROW_WIDTH;
  const isTiny = width < TINY_WIDTH;

  const timeStr = `${formatTime({ minutes: booking.startMinutes })} \u2013 ${formatTime({ minutes: booking.endMinutes })}`;

  function handlePointerDown(e: React.PointerEvent): void {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
  }

  function handleClick(e: MouseEvent<HTMLButtonElement>): void {
    e.stopPropagation();

    if (pointerStartRef.current) {
      const dx = Math.abs(e.clientX - pointerStartRef.current.x);
      const dy = Math.abs(e.clientY - pointerStartRef.current.y);
      if (dx + dy > CLICK_THRESHOLD) {
        return;
      }
    }

    if (!onClick) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    onClick({
      booking,
      anchor: { x: rect.left + rect.width / 2, y: rect.bottom },
    });
  }

  return (
    <button
      data-booking-id={booking.id}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      className={cn(
        "absolute overflow-hidden rounded-md border-l-[3px]",
        "transition-all duration-150 hover:z-30 hover:shadow-lg",
        "select-none text-left focus:outline-none focus:ring-2",
        typeConfig.border,
        typeConfig.bg,
        typeConfig.ring,
      )}
      style={{ left, width, top, height }}
      title={`${booking.title} \u00B7 ${timeStr}`}
    >
      <div className="flex h-full min-w-0 flex-col justify-center gap-0 px-2 py-1">
        <TitleRow booking={booking} typeConfig={typeConfig} isTiny={isTiny} />
        {!isNarrow && <DetailsRow booking={booking} typeConfig={typeConfig} isTiny={isTiny} />}
      </div>

      <StatusDot status={booking.status} />
    </button>
  );
}

function arePropsEqual(
  prev: Readonly<BookingBlockProps>,
  next: Readonly<BookingBlockProps>,
): boolean {
  return (
    prev.booking.id === next.booking.id &&
    prev.left === next.left &&
    prev.width === next.width &&
    prev.top === next.top &&
    prev.height === next.height
  );
}

export const BookingBlock = memo(BookingBlockInner, arePropsEqual);
