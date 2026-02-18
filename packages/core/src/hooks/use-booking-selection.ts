import { useCallback, useEffect, useMemo } from "react";
import type {
  UseBookingSelectionParams,
  UseBookingSelectionResult,
} from "../interfaces/interaction-hook-params";
import type { Booking } from "../interfaces/booking";
import type { PopoverAnchor } from "../interfaces/popover-state";
import { useScheduleStore } from "./use-schedule-store";

function findBookingById({
  bookings,
  bookingId,
}: {
  readonly bookings: readonly Booking[];
  readonly bookingId: string | null;
}): Booking | null {
  if (!bookingId) {
    return null;
  }
  return bookings.find((b) => b.id === bookingId) ?? null;
}

export function useBookingSelection({
  bookings,
  bookingTypes,
  onBookingClick,
  onBookingDelete,
  onBookingDuplicate,
  onBookingEdit,
}: UseBookingSelectionParams): UseBookingSelectionResult {
  const selectedBookingId = useScheduleStore({ selector: (s) => s.selectedBookingId });
  const popoverAnchor = useScheduleStore({ selector: (s) => s.popoverAnchor });
  const selectBooking = useScheduleStore({ selector: (s) => s.selectBooking });
  const clearSelection = useScheduleStore({ selector: (s) => s.clearSelection });

  const selectedBooking = useMemo(
    () => findBookingById({ bookings, bookingId: selectedBookingId }),
    [bookings, selectedBookingId],
  );

  const selectedBookingTypeConfig = useMemo(() => {
    if (!selectedBooking) {
      return null;
    }
    return bookingTypes[selectedBooking.type] ?? null;
  }, [selectedBooking, bookingTypes]);

  const handleBookingClick = useCallback(
    ({ booking, anchor }: { readonly booking: Booking; readonly anchor: PopoverAnchor }) => {
      if (selectedBookingId === booking.id) {
        clearSelection();
        return;
      }

      selectBooking({ bookingId: booking.id, anchor });

      if (onBookingClick) {
        onBookingClick({ booking, anchor });
      }
    },
    [selectedBookingId, selectBooking, clearSelection, onBookingClick],
  );

  const dismissPopover = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  const onEdit = useMemo(() => {
    if (!onBookingEdit || !selectedBookingId) {
      return undefined;
    }
    return () => {
      onBookingEdit({ bookingId: selectedBookingId });
      clearSelection();
    };
  }, [onBookingEdit, selectedBookingId, clearSelection]);

  const onDuplicate = useMemo(() => {
    if (!onBookingDuplicate || !selectedBookingId) {
      return undefined;
    }
    return () => {
      onBookingDuplicate({ bookingId: selectedBookingId });
      clearSelection();
    };
  }, [onBookingDuplicate, selectedBookingId, clearSelection]);

  const onDelete = useMemo(() => {
    if (!onBookingDelete || !selectedBookingId) {
      return undefined;
    }
    return () => {
      onBookingDelete({ bookingId: selectedBookingId });
      clearSelection();
    };
  }, [onBookingDelete, selectedBookingId, clearSelection]);

  useEffect(() => {
    if (!selectedBookingId) {
      return;
    }

    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === "Escape") {
        clearSelection();
      }
    }

    function handleMouseDown(e: MouseEvent): void {
      const target = e.target as HTMLElement;
      const isInsidePopover = target.closest("[data-popover]") !== null;
      const isInsideBookingBlock = target.closest("[data-booking-id]") !== null;

      if (!isInsidePopover && !isInsideBookingBlock) {
        clearSelection();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [selectedBookingId, clearSelection]);

  return {
    handleBookingClick,
    selectedBooking,
    selectedBookingTypeConfig,
    popoverAnchor,
    dismissPopover,
    onEdit,
    onDuplicate,
    onDelete,
  };
}
