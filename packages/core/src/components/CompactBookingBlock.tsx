import { memo, useRef } from "react";
import type { CompactBookingBlockProps } from "../interfaces/week-view-props";
import { formatTimeShort } from "../utils/time-format";
import { cn } from "../utils/cn";

const CLICK_THRESHOLD = 5;

function CompactBookingBlockInner({
  booking,
  typeConfig,
  onBookingClick,
  onDragStart,
}: CompactBookingBlockProps) {
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  function handlePointerDown(e: React.PointerEvent): void {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };

    if (onDragStart) {
      onDragStart({ e, booking });
    }
  }

  function handleClick(e: React.MouseEvent): void {
    if (!onBookingClick) {
      return;
    }

    const start = pointerStartRef.current;
    if (start) {
      const dx = Math.abs(e.clientX - start.x);
      const dy = Math.abs(e.clientY - start.y);
      if (dx + dy > CLICK_THRESHOLD) {
        return;
      }
    }

    onBookingClick({
      booking,
      anchor: { x: e.clientX, y: e.clientY },
    });
  }

  return (
    <div
      className={cn(
        "flex h-5 cursor-grab items-center gap-1 overflow-hidden rounded-sm border-l-[3px] px-1.5",
        typeConfig.border,
        typeConfig.bg,
      )}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
    >
      <span className={cn("truncate text-[10px] font-medium leading-tight", typeConfig.text)}>
        {booking.title}
      </span>
      <span className={cn("shrink-0 text-[9px] leading-tight", typeConfig.sub)}>
        {formatTimeShort({ minutes: booking.startMinutes })}
      </span>
    </div>
  );
}

function arePropsEqual(prev: CompactBookingBlockProps, next: CompactBookingBlockProps): boolean {
  return prev.booking.id === next.booking.id && prev.typeConfig === next.typeConfig;
}

export const CompactBookingBlock = memo(CompactBookingBlockInner, arePropsEqual);
