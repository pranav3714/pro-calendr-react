import { useState, useCallback } from "react";
import type { Booking } from "../packages/core/src/interfaces/booking";
import type {
  BookingDropInfo,
  BookingResizeInfo,
  SlotSelectInfo,
} from "../packages/core/src/interfaces/schedule-calendar-props";
import type { PopoverAnchor } from "../packages/core/src/interfaces/popover-state";
import { ScheduleProvider } from "../packages/core/src/components/ScheduleProvider";
import { DayView } from "../packages/core/src/views/day/DayView";
import { BOOKING_TYPES } from "../packages/core/src/constants/booking-types";
import { LAYOUT_DEFAULTS } from "../packages/core/src/constants/layout-defaults";
import { RESOURCE_GROUPS, INITIAL_BOOKINGS } from "./mock-data";

interface LogEntry {
  readonly id: number;
  readonly time: string;
  readonly type: "click" | "drop" | "resize" | "delete" | "duplicate" | "edit" | "slot";
  readonly message: string;
}

let nextBookingId = 100;
let nextLogId = 0;

function formatNow(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const TYPE_BADGE_COLORS: Record<string, string> = {
  click: "bg-blue-100 text-blue-700",
  drop: "bg-green-100 text-green-700",
  resize: "bg-amber-100 text-amber-700",
  delete: "bg-red-100 text-red-700",
  duplicate: "bg-violet-100 text-violet-700",
  edit: "bg-slate-100 text-slate-700",
  slot: "bg-teal-100 text-teal-700",
};

export function App() {
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((type: LogEntry["type"], message: string) => {
    setLogs((prev) =>
      [{ id: nextLogId++, time: formatNow(), type, message }, ...prev].slice(0, 50),
    );
  }, []);

  const handleBookingClick = useCallback(
    ({
      booking,
      anchor: _anchor,
    }: {
      readonly booking: Booking;
      readonly anchor: PopoverAnchor;
    }) => {
      addLog("click", `Clicked "${booking.title}" (${booking.type})`);
    },
    [addLog],
  );

  const handleBookingDrop = useCallback(
    ({ info }: { readonly info: BookingDropInfo }) => {
      const moved = info.originalResourceId !== info.newResourceId;
      const resourceNote = moved ? ` → resource ${info.newResourceId}` : "";
      addLog(
        "drop",
        `Moved "${info.bookingId}"${resourceNote} to ${formatMinutes(info.newStartMinutes)}–${formatMinutes(info.newEndMinutes)}`,
      );
      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== info.bookingId) {
            return b;
          }
          return {
            ...b,
            resourceId: info.newResourceId,
            startMinutes: info.newStartMinutes,
            endMinutes: info.newEndMinutes,
          };
        }),
      );
    },
    [addLog],
  );

  const handleBookingResize = useCallback(
    ({ info }: { readonly info: BookingResizeInfo }) => {
      addLog(
        "resize",
        `Resized "${info.bookingId}" (${info.edge} edge) → ${formatMinutes(info.newStartMinutes)}–${formatMinutes(info.newEndMinutes)}`,
      );
      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== info.bookingId) {
            return b;
          }
          return {
            ...b,
            startMinutes: info.newStartMinutes,
            endMinutes: info.newEndMinutes,
          };
        }),
      );
    },
    [addLog],
  );

  const handleBookingDelete = useCallback(
    ({ bookingId }: { readonly bookingId: string }) => {
      const booking = bookings.find((b) => b.id === bookingId);
      addLog("delete", `Deleted "${booking?.title ?? bookingId}"`);
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    },
    [addLog, bookings],
  );

  const handleBookingDuplicate = useCallback(
    ({ bookingId }: { readonly bookingId: string }) => {
      setBookings((prev) => {
        const original = prev.find((b) => b.id === bookingId);
        if (!original) {
          return prev;
        }
        const duplicate: Booking = {
          ...original,
          id: `b-dup-${String(nextBookingId++)}`,
          startMinutes: original.startMinutes + 30,
          endMinutes: original.endMinutes + 30,
          status: "pending",
        };
        addLog(
          "duplicate",
          `Duplicated "${original.title}" → ${formatMinutes(duplicate.startMinutes)}–${formatMinutes(duplicate.endMinutes)}`,
        );
        return [...prev, duplicate];
      });
    },
    [addLog],
  );

  const handleBookingEdit = useCallback(
    ({ bookingId }: { readonly bookingId: string }) => {
      const booking = bookings.find((b) => b.id === bookingId);
      addLog("edit", `Edit requested for "${booking?.title ?? bookingId}"`);
    },
    [addLog, bookings],
  );

  const handleSlotSelect = useCallback(
    ({ info }: { readonly info: SlotSelectInfo }) => {
      addLog(
        "slot",
        `Selected slot on ${info.resourceId}: ${formatMinutes(info.startMinutes)}–${formatMinutes(info.endMinutes)}`,
      );
    },
    [addLog],
  );

  const handleReset = useCallback(() => {
    setBookings(INITIAL_BOOKINGS);
    setLogs([]);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            P
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Pro Calendar Demo</h1>
            <p className="text-xs text-gray-500">
              Interactive Day View — drag, resize, click, select
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            {String(bookings.length)} bookings
          </span>
          <button
            onClick={handleReset}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Reset Data
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex min-h-0 flex-1">
        {/* Calendar */}
        <div className="pro-calendr-react flex min-w-0 flex-1 flex-col">
          <ScheduleProvider defaultViewMode="day">
            <DayView
              bookings={bookings}
              resourceGroups={RESOURCE_GROUPS}
              layoutConfig={LAYOUT_DEFAULTS}
              bookingTypes={BOOKING_TYPES}
              onBookingClick={handleBookingClick}
              onBookingDrop={handleBookingDrop}
              onBookingResize={handleBookingResize}
              onBookingDelete={handleBookingDelete}
              onBookingDuplicate={handleBookingDuplicate}
              onBookingEdit={handleBookingEdit}
              onSlotSelect={handleSlotSelect}
            />
          </ScheduleProvider>
        </div>

        {/* Event log sidebar */}
        <aside className="flex w-80 shrink-0 flex-col border-l border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-700">Event Log</h2>
            <button
              onClick={() => {
                setLogs([]);
              }}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          </div>

          <div className="flex-1 overflow-auto px-4 py-2">
            {logs.length === 0 && (
              <div className="py-8 text-center">
                <div className="mb-2 text-2xl">&#128071;</div>
                <p className="text-sm text-gray-400">Interact with the calendar</p>
                <ul className="mt-3 space-y-1 text-left text-xs text-gray-400">
                  <li>&#8226; Click a booking to open popover</li>
                  <li>&#8226; Drag a booking to move it</li>
                  <li>&#8226; Drag edges to resize</li>
                  <li>&#8226; Click empty space to select slot</li>
                  <li>&#8226; Press Escape to cancel</li>
                </ul>
              </div>
            )}

            {logs.map((entry) => (
              <div
                key={entry.id}
                className="mb-2 rounded-md border border-gray-100 bg-gray-50 px-3 py-2"
              >
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${TYPE_BADGE_COLORS[entry.type] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {entry.type}
                  </span>
                  <span className="text-[10px] text-gray-400">{entry.time}</span>
                </div>
                <p className="text-xs text-gray-600">{entry.message}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
