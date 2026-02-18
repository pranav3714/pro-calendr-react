import { useState, useCallback, useMemo } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Booking } from "../packages/core/src/interfaces/booking";
import type { ResourceGroup } from "../packages/core/src/interfaces/resource";
import type { WeekBookingDropInfo } from "../packages/core/src/interfaces/week-view-props";
import type { PopoverAnchor } from "../packages/core/src/interfaces/popover-state";
import { ScheduleProvider } from "../packages/core/src/components/ScheduleProvider";
import { WeekView } from "../packages/core/src/views/week/WeekView";
import { BOOKING_TYPES } from "../packages/core/src/constants/booking-types";
import { LAYOUT_DEFAULTS } from "../packages/core/src/constants/layout-defaults";
import { getWeekDays } from "../packages/core/src/utils/date-helpers";
import { formatDateKey } from "../packages/core/src/utils/format-date-key";

const RESOURCE_GROUPS: ResourceGroup[] = [
  {
    id: "aircraft",
    label: "Aircraft",
    resources: [
      { id: "ac-1", title: "CS-UMH", subtitle: "Cessna 172S", groupId: "aircraft" },
      { id: "ac-2", title: "CS-UMG", subtitle: "Cessna 172S", groupId: "aircraft" },
      { id: "ac-3", title: "CS-UML", subtitle: "Piper PA-28", groupId: "aircraft" },
    ],
  },
  {
    id: "instructors",
    label: "Instructors",
    resources: [
      { id: "inst-1", title: "Jose Silva", subtitle: "CFI / CFII", groupId: "instructors" },
      { id: "inst-2", title: "Miguel Santos", subtitle: "CFI", groupId: "instructors" },
      { id: "inst-3", title: "Ana Ferreira", subtitle: "CFI / MEI", groupId: "instructors" },
    ],
  },
  {
    id: "simulators",
    label: "Simulators",
    resources: [
      { id: "sim-1", title: "FNPT II", subtitle: "Multi-Engine", groupId: "simulators" },
      { id: "sim-2", title: "FNPT I", subtitle: "Single-Engine", groupId: "simulators" },
    ],
  },
  {
    id: "rooms",
    label: "Rooms",
    resources: [
      { id: "room-1", title: "Briefing Room 1", subtitle: "Capacity: 4", groupId: "rooms" },
      { id: "room-2", title: "Classroom A", subtitle: "Capacity: 20", groupId: "rooms" },
    ],
  },
];

function generateWeekBookings(): Booking[] {
  const weekDays = getWeekDays({ date: new Date() });
  const bookings: Booking[] = [];
  let nextId = 1;

  const templates: { type: string; title: string; resourceId: string; student?: string }[] = [
    { type: "flight", title: "VFR Navigation", resourceId: "ac-1", student: "Carlos Mendes" },
    { type: "flight", title: "IFR Training", resourceId: "ac-2", student: "Ana Costa" },
    { type: "simulator", title: "IR Approaches", resourceId: "sim-1", student: "Joao Pinto" },
    { type: "ground", title: "Air Law", resourceId: "room-1" },
    { type: "briefing", title: "Pre-flight Brief", resourceId: "inst-1", student: "Rita Nunes" },
    { type: "theory", title: "Navigation Theory", resourceId: "room-2" },
    { type: "exam", title: "PPL Progress Check", resourceId: "inst-2", student: "Marco Sousa" },
    { type: "maintenance", title: "100h Inspection", resourceId: "ac-3" },
    { type: "flight", title: "Solo XC", resourceId: "ac-1", student: "Pedro Lima" },
    { type: "simulator", title: "GNSS Approaches", resourceId: "sim-2", student: "Hugo Martins" },
    { type: "briefing", title: "Morning Brief", resourceId: "inst-3" },
    { type: "flight", title: "Night Flight", resourceId: "ac-2", student: "Sofia Reis" },
  ];

  for (const day of weekDays) {
    const dateKey = formatDateKey({ date: day });
    const dayIndex = weekDays.indexOf(day);
    const bookingCount = 4 + (dayIndex % 3);

    for (let i = 0; i < bookingCount; i++) {
      const template = templates[(dayIndex * 3 + i) % templates.length];
      const startHour = 7 + i * 2 + (dayIndex % 2);
      bookings.push({
        id: `wb-${String(nextId++)}`,
        resourceId: template.resourceId,
        date: dateKey,
        type: template.type,
        title: template.title,
        student: template.student,
        startMinutes: startHour * 60,
        endMinutes: (startHour + 1 + (i % 2)) * 60,
        status: i === 0 ? "pending" : "confirmed",
      });
    }
  }

  return bookings;
}

function InteractiveWeekView() {
  const initialBookings = useMemo(() => generateWeekBookings(), []);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [log, setLog] = useState<string[]>([]);

  const addLog = useCallback((message: string) => {
    setLog((prev) => [message, ...prev].slice(0, 20));
  }, []);

  const handleBookingClick = useCallback(
    ({ booking, anchor }: { readonly booking: Booking; readonly anchor: PopoverAnchor }) => {
      addLog(
        `Click: "${booking.title}" at (${String(Math.round(anchor.x))}, ${String(Math.round(anchor.y))})`,
      );
    },
    [addLog],
  );

  const handleBookingDrop = useCallback(
    ({ info }: { readonly info: WeekBookingDropInfo }) => {
      addLog(
        `Drop: "${info.bookingId}" from ${info.originalDate}/${info.originalResourceId} → ${info.newDate}/${info.newResourceId}`,
      );
      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== info.bookingId) {
            return b;
          }
          return {
            ...b,
            resourceId: info.newResourceId,
            date: info.newDate,
          };
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

  return (
    <div className="pro-calendr-react flex h-screen flex-col">
      <div className="flex flex-1 flex-col overflow-hidden">
        <ScheduleProvider defaultViewMode="week">
          <WeekView
            bookings={bookings}
            resourceGroups={RESOURCE_GROUPS}
            layoutConfig={LAYOUT_DEFAULTS}
            bookingTypes={BOOKING_TYPES}
            onBookingClick={handleBookingClick}
            onBookingDrop={handleBookingDrop}
            onBookingDelete={handleBookingDelete}
          />
        </ScheduleProvider>
      </div>

      <div className="h-48 shrink-0 overflow-auto border-t border-gray-200 bg-gray-50 p-3">
        <div className="mb-1 text-xs font-semibold text-gray-500">Event Log</div>
        {log.length === 0 && (
          <div className="text-xs text-gray-400">
            Interact with the calendar — click bookings, drag between cells
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

const meta: Meta<typeof InteractiveWeekView> = {
  title: "WeekView/Interactive",
  component: InteractiveWeekView,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof InteractiveWeekView>;

export const Default: Story = {};
