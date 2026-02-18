import { useState, useCallback } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Booking } from "../packages/core/src/interfaces/booking";
import type { ResourceGroup } from "../packages/core/src/interfaces/resource";
import type {
  BookingClickInfo,
  BookingDropInfo,
  BookingResizeInfo,
  SlotSelectInfo,
} from "../packages/core/src/interfaces/schedule-calendar-props";
import type { WeekBookingDropInfo } from "../packages/core/src/interfaces/week-view-props";
import { ScheduleCalendar } from "../packages/core/src/ScheduleCalendar";
import { formatDateKey } from "../packages/core/src/utils/format-date-key";

// ── Mock Resource Groups ────────────────────────────────────────────────────

const RESOURCE_GROUPS: ResourceGroup[] = [
  {
    id: "aircraft",
    label: "Aircraft",
    resources: [
      { id: "ac-1", title: "CS-UMH", subtitle: "Cessna 172S", groupId: "aircraft" },
      { id: "ac-2", title: "CS-UMG", subtitle: "Cessna 172S", groupId: "aircraft" },
      { id: "ac-3", title: "CS-UML", subtitle: "Piper PA-28", groupId: "aircraft" },
      { id: "ac-4", title: "CS-UMX", subtitle: "Cessna 152", groupId: "aircraft" },
      { id: "ac-5", title: "CS-UMP", subtitle: "Diamond DA40", groupId: "aircraft" },
      { id: "ac-6", title: "CS-UMR", subtitle: "Cessna 172S", groupId: "aircraft" },
    ],
  },
  {
    id: "instructors",
    label: "Instructors",
    resources: [
      { id: "inst-1", title: "Jose Silva", subtitle: "CFI / CFII", groupId: "instructors" },
      { id: "inst-2", title: "Miguel Santos", subtitle: "CFI", groupId: "instructors" },
      { id: "inst-3", title: "Ana Ferreira", subtitle: "CFI / MEI", groupId: "instructors" },
      { id: "inst-4", title: "Pedro Costa", subtitle: "CFI", groupId: "instructors" },
      { id: "inst-5", title: "Maria Oliveira", subtitle: "CFII", groupId: "instructors" },
    ],
  },
  {
    id: "simulators",
    label: "Simulators",
    resources: [
      { id: "sim-1", title: "FNPT II", subtitle: "Multi-Engine", groupId: "simulators" },
      { id: "sim-2", title: "FNPT I", subtitle: "Single-Engine", groupId: "simulators" },
      { id: "sim-3", title: "BITD", subtitle: "Basic Instrument", groupId: "simulators" },
    ],
  },
  {
    id: "rooms",
    label: "Rooms",
    resources: [
      { id: "room-1", title: "Briefing Room 1", subtitle: "Capacity: 4", groupId: "rooms" },
      { id: "room-2", title: "Briefing Room 2", subtitle: "Capacity: 4", groupId: "rooms" },
      { id: "room-3", title: "Classroom A", subtitle: "Capacity: 20", groupId: "rooms" },
      { id: "room-4", title: "Classroom B", subtitle: "Capacity: 15", groupId: "rooms" },
    ],
  },
];

// ── Date helper ─────────────────────────────────────────────────────────────

const TODAY_KEY = formatDateKey({ date: new Date() });

// ── Initial Bookings ────────────────────────────────────────────────────────

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "b-1",
    resourceId: "ac-1",
    type: "flight",
    title: "VFR Navigation",
    student: "Carlos Mendes",
    instructor: "Jose Silva",
    startMinutes: 480,
    endMinutes: 600,
    status: "confirmed",
    date: TODAY_KEY,
  },
  {
    id: "b-2",
    resourceId: "ac-1",
    type: "flight",
    title: "IFR Training",
    student: "Ana Costa",
    instructor: "Miguel Santos",
    startMinutes: 660,
    endMinutes: 780,
    status: "confirmed",
    date: TODAY_KEY,
  },
  {
    id: "b-3",
    resourceId: "ac-2",
    type: "flight",
    title: "Solo XC",
    student: "Pedro Lima",
    startMinutes: 540,
    endMinutes: 720,
    status: "pending",
    date: TODAY_KEY,
  },
  {
    id: "b-4",
    resourceId: "ac-3",
    type: "flight",
    title: "Night Flight",
    student: "Sofia Reis",
    instructor: "Ana Ferreira",
    startMinutes: 1080,
    endMinutes: 1200,
    status: "confirmed",
    date: TODAY_KEY,
  },
  {
    id: "b-5",
    resourceId: "ac-4",
    type: "flight",
    title: "Circuits",
    student: "Hugo Martins",
    instructor: "Pedro Costa",
    startMinutes: 480,
    endMinutes: 540,
    status: "in-progress",
    date: TODAY_KEY,
  },
  {
    id: "b-6",
    resourceId: "ac-4",
    type: "maintenance",
    title: "100h Inspection",
    startMinutes: 600,
    endMinutes: 960,
    status: "confirmed",
    date: TODAY_KEY,
  },
  {
    id: "b-7",
    resourceId: "ac-5",
    type: "flight",
    title: "Stall Recovery",
    student: "Rita Nunes",
    instructor: "Jose Silva",
    startMinutes: 840,
    endMinutes: 960,
    status: "confirmed",
    date: TODAY_KEY,
  },
  {
    id: "b-8",
    resourceId: "ac-6",
    type: "flight",
    title: "Area Solo",
    student: "Diogo Alves",
    startMinutes: 600,
    endMinutes: 720,
    status: "pending",
    date: TODAY_KEY,
  },
  {
    id: "b-9",
    resourceId: "inst-1",
    type: "briefing",
    title: "Pre-flight Brief",
    student: "Rita Nunes",
    startMinutes: 780,
    endMinutes: 840,
    status: "confirmed",
    date: TODAY_KEY,
  },
  {
    id: "b-10",
    resourceId: "inst-2",
    type: "flight",
    title: "IFR Dual",
    student: "Ana Costa",
    aircraft: "CS-UMH",
    startMinutes: 660,
    endMinutes: 780,
    status: "confirmed",
    date: TODAY_KEY,
  },
  {
    id: "b-11",
    resourceId: "inst-3",
    type: "ground",
    title: "Met Briefing",
    startMinutes: 540,
    endMinutes: 600,
    status: "confirmed",
    date: TODAY_KEY,
  },
  {
    id: "b-12",
    resourceId: "inst-4",
    type: "theory",
    title: "Navigation Theory",
    startMinutes: 600,
    endMinutes: 720,
    status: "confirmed",
    date: TODAY_KEY,
  },
  {
    id: "b-13",
    resourceId: "inst-5",
    type: "exam",
    title: "PPL Progress Check",
    student: "Marco Sousa",
    startMinutes: 540,
    endMinutes: 660,
    status: "confirmed",
    date: TODAY_KEY,
  },
  {
    id: "b-14",
    resourceId: "sim-1",
    type: "simulator",
    title: "IR Approaches",
    student: "Joao Pinto",
    instructor: "Maria Oliveira",
    startMinutes: 480,
    endMinutes: 600,
    status: "confirmed",
    date: TODAY_KEY,
  },
  {
    id: "b-15",
    resourceId: "sim-1",
    type: "simulator",
    title: "GNSS Approaches",
    student: "Ana Costa",
    startMinutes: 660,
    endMinutes: 780,
    status: "pending",
    date: TODAY_KEY,
  },
  {
    id: "b-16",
    resourceId: "sim-2",
    type: "simulator",
    title: "Basic IF",
    student: "Hugo Martins",
    startMinutes: 720,
    endMinutes: 840,
    status: "confirmed",
    date: TODAY_KEY,
  },
  {
    id: "b-17",
    resourceId: "room-1",
    type: "briefing",
    title: "Morning Brief",
    startMinutes: 450,
    endMinutes: 480,
    status: "completed",
    date: TODAY_KEY,
  },
  {
    id: "b-18",
    resourceId: "room-3",
    type: "ground",
    title: "Air Law",
    startMinutes: 540,
    endMinutes: 660,
    status: "confirmed",
    date: TODAY_KEY,
  },
  {
    id: "b-19",
    resourceId: "room-3",
    type: "theory",
    title: "Performance",
    startMinutes: 720,
    endMinutes: 840,
    status: "confirmed",
    date: TODAY_KEY,
  },
  {
    id: "b-20",
    resourceId: "room-4",
    type: "ground",
    title: "Human Factors",
    startMinutes: 540,
    endMinutes: 660,
    status: "confirmed",
    date: TODAY_KEY,
  },
  {
    id: "b-21",
    resourceId: "room-4",
    type: "exam",
    title: "ATPL Theory Exam",
    startMinutes: 780,
    endMinutes: 960,
    status: "confirmed",
    date: TODAY_KEY,
  },
];

// ── Interactive wrapper ─────────────────────────────────────────────────────

let nextId = 200;

function InteractiveScheduleCalendar({ darkMode }: { readonly darkMode?: boolean }) {
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [log, setLog] = useState<string[]>([]);

  const addLog = useCallback((message: string) => {
    setLog((prev) => [message, ...prev].slice(0, 30));
  }, []);

  const handleBookingClick = useCallback(
    ({ info }: { readonly info: BookingClickInfo }) => {
      addLog(`Click: "${info.booking.title}"`);
    },
    [addLog],
  );

  const handleBookingDrop = useCallback(
    ({ info }: { readonly info: BookingDropInfo }) => {
      addLog(
        `Day Drop: "${info.bookingId}" → ${info.newResourceId} ${String(info.newStartMinutes)}-${String(info.newEndMinutes)}`,
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

  const handleWeekBookingDrop = useCallback(
    ({ info }: { readonly info: WeekBookingDropInfo }) => {
      addLog(`Week Drop: "${info.bookingId}" → ${info.newResourceId} on ${info.newDate}`);
      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== info.bookingId) {
            return b;
          }
          return { ...b, resourceId: info.newResourceId, date: info.newDate };
        }),
      );
    },
    [addLog],
  );

  const handleBookingResize = useCallback(
    ({ info }: { readonly info: BookingResizeInfo }) => {
      addLog(
        `Resize (${info.edge}): "${info.bookingId}" → ${String(info.newStartMinutes)}-${String(info.newEndMinutes)}`,
      );
      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== info.bookingId) {
            return b;
          }
          return { ...b, startMinutes: info.newStartMinutes, endMinutes: info.newEndMinutes };
        }),
      );
    },
    [addLog],
  );

  const handleBookingDelete = useCallback(
    ({ bookingId }: { readonly bookingId: string }) => {
      addLog(`Delete: "${bookingId}"`);
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    },
    [addLog],
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
          id: `b-dup-${String(nextId++)}`,
          startMinutes: original.startMinutes + 30,
          endMinutes: original.endMinutes + 30,
          status: "pending",
        };
        addLog(`Duplicate: "${original.title}" → "${duplicate.id}"`);
        return [...prev, duplicate];
      });
    },
    [addLog],
  );

  const handleBookingEdit = useCallback(
    ({ bookingId }: { readonly bookingId: string }) => {
      addLog(`Edit: "${bookingId}" (no-op)`);
    },
    [addLog],
  );

  const handleSlotSelect = useCallback(
    ({ info }: { readonly info: SlotSelectInfo }) => {
      addLog(
        `Slot select: ${info.resourceId}, ${String(info.startMinutes)}-${String(info.endMinutes)}`,
      );
    },
    [addLog],
  );

  const handleDateChange = useCallback(
    ({ date }: { readonly date: Date }) => {
      addLog(`Date changed: ${date.toLocaleDateString()}`);
    },
    [addLog],
  );

  const handleViewModeChange = useCallback(
    ({ mode }: { readonly mode: string }) => {
      addLog(`View mode: ${mode}`);
    },
    [addLog],
  );

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1 overflow-hidden">
        <ScheduleCalendar
          bookings={bookings}
          resourceGroups={RESOURCE_GROUPS}
          title="Schedule"
          darkMode={darkMode}
          onBookingClick={handleBookingClick}
          onBookingDrop={handleBookingDrop}
          onWeekBookingDrop={handleWeekBookingDrop}
          onBookingResize={handleBookingResize}
          onBookingDelete={handleBookingDelete}
          onBookingDuplicate={handleBookingDuplicate}
          onBookingEdit={handleBookingEdit}
          onSlotSelect={handleSlotSelect}
          onDateChange={handleDateChange}
          onViewModeChange={handleViewModeChange}
        />
      </div>

      <div className="h-40 shrink-0 overflow-auto border-t border-gray-200 bg-gray-50 p-3">
        <div className="mb-1 text-xs font-semibold text-gray-500">Event Log</div>
        {log.length === 0 && (
          <div className="text-xs text-gray-400">
            Interact with the calendar — switch views, navigate dates, filter, drag, resize
          </div>
        )}
        {log.map((entry, i) => (
          <div key={`${entry}-${String(i)}`} className="font-mono text-xs text-gray-600">
            {entry}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Story config ────────────────────────────────────────────────────────────

const meta: Meta<typeof InteractiveScheduleCalendar> = {
  title: "ScheduleCalendar",
  component: InteractiveScheduleCalendar,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof InteractiveScheduleCalendar>;

export const Default: Story = {};

export const DarkMode: Story = {
  args: {
    darkMode: true,
  },
};
