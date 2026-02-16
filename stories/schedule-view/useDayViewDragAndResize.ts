import { useState, useCallback, useRef, useEffect, type RefObject } from "react";
import {
  type Booking,
  type HelperConfig,
  type AnchorRect,
  positionToMinutes,
  snapToGrid,
  clampMinutes,
} from "./scheduleData";
import type { RowData } from "./useDayViewResourceLayout";

// ── Types ────────────────────────────────────────────────────────────────────

export interface DragState {
  booking: Booking;
  offsetX: number;
  offsetY: number;
  startClientX: number;
  startClientY: number;
  currentX: number;
  currentY: number;
  isDragging: boolean;
  originalStart: number;
  originalEnd: number;
  originalResource: string;
}

export interface ResizeState {
  booking: Booking;
  edge: "left" | "right";
  startClientX: number;
  currentX: number;
  isResizing: boolean;
  originalStart: number;
  originalEnd: number;
}

interface UseDayViewDragAndResizeInput {
  timelineRef: RefObject<HTMLDivElement>;
  rows: RowData[];
  helperConfig: HelperConfig;
  bookings: Booking[];
  dayStartHour: number;
  dayEndHour: number;
  onBookingClick: (booking: Booking, rect: AnchorRect) => void;
  onBookingsChange: (bookings: Booking[]) => void;
}

interface UseDayViewDragAndResizeResult {
  dragState: DragState | null;
  resizeState: ResizeState | null;
  hoveredRow: string | null;
  handleDragStart: (e: React.PointerEvent, booking: Booking) => void;
  handleResizeStart: (e: React.PointerEvent, booking: Booking, edge: "left" | "right") => void;
  handlePointerMove: (e: React.PointerEvent) => void;
  handlePointerUp: (e: React.PointerEvent) => void;
}

// ── Constants ────────────────────────────────────────────────────────────────

const DRAG_THRESHOLD = 5;
const RESIZE_THRESHOLD = 3;
const MIN_DURATION = 15;

// ── Hook ─────────────────────────────────────────────────────────────────────

const useDayViewDragAndResize = ({
  timelineRef,
  rows,
  helperConfig,
  bookings,
  dayStartHour,
  dayEndHour,
  onBookingClick,
  onBookingsChange,
}: UseDayViewDragAndResizeInput): UseDayViewDragAndResizeResult => {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const rafId = useRef<number | null>(null);

  // Clean up RAF on unmount
  useEffect(() => {
    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  const findHoveredRow = useCallback(
    (clientY: number): string | null => {
      if (!timelineRef.current) return null;
      const rect = timelineRef.current.getBoundingClientRect();
      const relY = clientY - rect.top + timelineRef.current.scrollTop;

      for (const row of rows) {
        if (relY >= row.y && relY < row.y + row.rowHeight) {
          return row.resource.id;
        }
      }
      return null;
    },
    [timelineRef, rows],
  );

  const handleDragStart = useCallback((e: React.PointerEvent, booking: Booking) => {
    e.preventDefault();

    setDragState({
      booking,
      offsetX: 0,
      offsetY: 0,
      startClientX: e.clientX,
      startClientY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      isDragging: false,
      originalStart: booking.startMinutes,
      originalEnd: booking.endMinutes,
      originalResource: booking.resourceId,
    });
  }, []);

  const handleResizeStart = useCallback(
    (e: React.PointerEvent, booking: Booking, edge: "left" | "right") => {
      e.preventDefault();
      e.stopPropagation();

      setResizeState({
        booking,
        edge,
        startClientX: e.clientX,
        currentX: e.clientX,
        isResizing: false,
        originalStart: booking.startMinutes,
        originalEnd: booking.endMinutes,
      });
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState && !resizeState) return;

      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }

      rafId.current = requestAnimationFrame(() => {
        if (resizeState) {
          const dx = Math.abs(e.clientX - resizeState.startClientX);
          const isResizing = resizeState.isResizing || dx >= RESIZE_THRESHOLD;
          setResizeState((prev) => (prev ? { ...prev, currentX: e.clientX, isResizing } : null));
        } else if (dragState) {
          const dx = Math.abs(e.clientX - dragState.startClientX);
          const dy = Math.abs(e.clientY - dragState.startClientY);
          const isDragging = dragState.isDragging || dx + dy >= DRAG_THRESHOLD;

          const newHoveredRow = findHoveredRow(e.clientY);
          if (newHoveredRow !== hoveredRow) {
            setHoveredRow(newHoveredRow);
          }

          setDragState((prev) =>
            prev ? { ...prev, currentX: e.clientX, currentY: e.clientY, isDragging } : null,
          );
        }
        rafId.current = null;
      });
    },
    [dragState, resizeState, hoveredRow, findHoveredRow],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }

      if (resizeState) {
        if (resizeState.isResizing) {
          const deltaX = e.clientX - resizeState.startClientX;
          const deltaMinutes = positionToMinutes(deltaX, {
            dayStartHour: 0,
            hourWidth: helperConfig.hourWidth,
          });

          let newStart = resizeState.originalStart;
          let newEnd = resizeState.originalEnd;

          if (resizeState.edge === "left") {
            newStart = snapToGrid(resizeState.originalStart + deltaMinutes);
            newStart = clampMinutes(newStart, helperConfig);
            if (newEnd - newStart < MIN_DURATION) {
              newStart = newEnd - MIN_DURATION;
            }
          } else {
            newEnd = snapToGrid(resizeState.originalEnd + deltaMinutes);
            newEnd = clampMinutes(newEnd, helperConfig);
            if (newEnd - newStart < MIN_DURATION) {
              newEnd = newStart + MIN_DURATION;
            }
          }

          const updated = bookings.map((b) =>
            b.id === resizeState.booking.id
              ? { ...b, startMinutes: newStart, endMinutes: newEnd }
              : b,
          );
          onBookingsChange(updated);
        }
        setResizeState(null);
        return;
      }

      if (dragState) {
        if (!dragState.isDragging) {
          // Was a click, not a drag
          const target = e.target as HTMLElement;
          const rect = target.getBoundingClientRect();
          const anchorRect: AnchorRect = {
            top: rect.top,
            bottom: rect.bottom,
            left: rect.left,
            right: rect.right,
            width: rect.width,
            height: rect.height,
          };
          onBookingClick(dragState.booking, anchorRect);
        } else {
          // Commit the drop
          const deltaX = e.clientX - dragState.startClientX;
          const deltaMinutes = positionToMinutes(deltaX, {
            dayStartHour: 0,
            hourWidth: helperConfig.hourWidth,
          });
          const duration = dragState.originalEnd - dragState.originalStart;

          let newStart = snapToGrid(dragState.originalStart + deltaMinutes);
          newStart = clampMinutes(newStart, helperConfig);
          let newEnd = newStart + duration;

          if (newEnd > dayEndHour * 60) {
            newEnd = dayEndHour * 60;
            newStart = newEnd - duration;
          }

          const targetResource = hoveredRow ?? dragState.originalResource;

          const updated = bookings.map((b) =>
            b.id === dragState.booking.id
              ? { ...b, startMinutes: newStart, endMinutes: newEnd, resourceId: targetResource }
              : b,
          );
          onBookingsChange(updated);
        }
        setDragState(null);
        setHoveredRow(null);
      }
    },
    [
      dragState,
      resizeState,
      hoveredRow,
      helperConfig,
      bookings,
      dayStartHour,
      dayEndHour,
      onBookingClick,
      onBookingsChange,
    ],
  );

  return {
    dragState,
    resizeState,
    hoveredRow,
    handleDragStart,
    handleResizeStart,
    handlePointerMove,
    handlePointerUp,
  };
};

export default useDayViewDragAndResize;
