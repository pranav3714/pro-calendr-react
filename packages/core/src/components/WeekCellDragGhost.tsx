import type { Booking } from "../interfaces/booking";
import type { BookingTypeConfig } from "../interfaces/booking-type";
import { cn } from "../utils/cn";

interface WeekCellDragGhostProps {
  readonly booking: Booking;
  readonly typeConfig: BookingTypeConfig;
  readonly position: { readonly x: number; readonly y: number };
}

export function WeekCellDragGhost({ booking, typeConfig, position }: WeekCellDragGhostProps) {
  return (
    <div
      className={cn(
        "pro-calendr-react-drag-ghost fixed flex h-5 items-center gap-1 overflow-hidden rounded-sm border border-dashed px-1.5 opacity-80 shadow-md",
        typeConfig.border,
        typeConfig.bg,
      )}
      style={{
        left: position.x - 70,
        top: position.y - 10,
        width: 140,
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      <span className={cn("truncate text-[10px] font-medium", typeConfig.text)}>
        {booking.title}
      </span>
    </div>
  );
}
