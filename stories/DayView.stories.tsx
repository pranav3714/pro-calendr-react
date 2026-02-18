import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Booking } from "../packages/core/src/interfaces/booking";
import type { ResourceGroup } from "../packages/core/src/interfaces/resource";
import { ScheduleProvider } from "../packages/core/src/components/ScheduleProvider";
import { DayView } from "../packages/core/src/views/day/DayView";
import { BOOKING_TYPES } from "../packages/core/src/constants/booking-types";
import { LAYOUT_DEFAULTS } from "../packages/core/src/constants/layout-defaults";

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

// ── Mock Bookings ───────────────────────────────────────────────────────────

const MOCK_BOOKINGS: Booking[] = [
  // Aircraft bookings
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
  },
  {
    id: "b-6",
    resourceId: "ac-4",
    type: "maintenance",
    title: "100h Inspection",
    startMinutes: 600,
    endMinutes: 960,
    status: "confirmed",
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
  },

  // Instructor bookings
  {
    id: "b-9",
    resourceId: "inst-1",
    type: "flight",
    title: "VFR Nav (Dual)",
    student: "Carlos Mendes",
    aircraft: "CS-UMH",
    startMinutes: 480,
    endMinutes: 600,
    status: "confirmed",
    linkedResourceIds: ["ac-1"],
  },
  {
    id: "b-10",
    resourceId: "inst-1",
    type: "briefing",
    title: "Pre-flight Brief",
    student: "Rita Nunes",
    startMinutes: 780,
    endMinutes: 840,
    status: "confirmed",
  },
  {
    id: "b-11",
    resourceId: "inst-2",
    type: "flight",
    title: "IFR Training (Dual)",
    student: "Ana Costa",
    aircraft: "CS-UMH",
    startMinutes: 660,
    endMinutes: 780,
    status: "confirmed",
  },
  {
    id: "b-12",
    resourceId: "inst-3",
    type: "ground",
    title: "Met Briefing",
    startMinutes: 540,
    endMinutes: 600,
    status: "confirmed",
  },
  {
    id: "b-13",
    resourceId: "inst-3",
    type: "flight",
    title: "Night Flight (Dual)",
    student: "Sofia Reis",
    aircraft: "CS-UML",
    startMinutes: 1080,
    endMinutes: 1200,
    status: "confirmed",
  },
  {
    id: "b-14",
    resourceId: "inst-4",
    type: "flight",
    title: "Circuits (Dual)",
    student: "Hugo Martins",
    aircraft: "CS-UMX",
    startMinutes: 480,
    endMinutes: 540,
    status: "in-progress",
  },
  {
    id: "b-15",
    resourceId: "inst-4",
    type: "theory",
    title: "Navigation Theory",
    startMinutes: 600,
    endMinutes: 720,
    status: "confirmed",
  },
  {
    id: "b-16",
    resourceId: "inst-5",
    type: "exam",
    title: "PPL Progress Check",
    student: "Marco Sousa",
    startMinutes: 540,
    endMinutes: 660,
    status: "confirmed",
  },

  // Simulator bookings
  {
    id: "b-17",
    resourceId: "sim-1",
    type: "simulator",
    title: "IR Approaches",
    student: "Joao Pinto",
    instructor: "Maria Oliveira",
    startMinutes: 480,
    endMinutes: 600,
    status: "confirmed",
  },
  {
    id: "b-18",
    resourceId: "sim-1",
    type: "simulator",
    title: "GNSS Approaches",
    student: "Ana Costa",
    instructor: "Jose Silva",
    startMinutes: 660,
    endMinutes: 780,
    status: "pending",
  },
  {
    id: "b-19",
    resourceId: "sim-2",
    type: "simulator",
    title: "Basic IF",
    student: "Hugo Martins",
    startMinutes: 720,
    endMinutes: 840,
    status: "confirmed",
  },
  {
    id: "b-20",
    resourceId: "sim-3",
    type: "simulator",
    title: "Partial Panel",
    student: "Rita Nunes",
    startMinutes: 480,
    endMinutes: 570,
    status: "confirmed",
  },

  // Room bookings
  {
    id: "b-21",
    resourceId: "room-1",
    type: "briefing",
    title: "Morning Brief",
    startMinutes: 450,
    endMinutes: 480,
    status: "completed",
  },
  {
    id: "b-22",
    resourceId: "room-1",
    type: "briefing",
    title: "Debrief XC",
    student: "Pedro Lima",
    startMinutes: 750,
    endMinutes: 810,
    status: "confirmed",
  },
  {
    id: "b-23",
    resourceId: "room-2",
    type: "briefing",
    title: "Pre-flight Brief",
    student: "Sofia Reis",
    startMinutes: 1020,
    endMinutes: 1080,
    status: "confirmed",
  },
  {
    id: "b-24",
    resourceId: "room-3",
    type: "ground",
    title: "Air Law",
    startMinutes: 540,
    endMinutes: 660,
    status: "confirmed",
  },
  {
    id: "b-25",
    resourceId: "room-3",
    type: "theory",
    title: "Performance",
    startMinutes: 720,
    endMinutes: 840,
    status: "confirmed",
  },
  {
    id: "b-26",
    resourceId: "room-4",
    type: "ground",
    title: "Human Factors",
    startMinutes: 540,
    endMinutes: 660,
    status: "confirmed",
  },
  {
    id: "b-27",
    resourceId: "room-4",
    type: "exam",
    title: "ATPL Theory Exam",
    startMinutes: 780,
    endMinutes: 960,
    status: "confirmed",
  },
];

// ── Overlapping bookings for testing lane stacking ──────────────────────────

const OVERLAP_BOOKINGS: Booking[] = [
  ...MOCK_BOOKINGS,
  // Add overlapping bookings on ac-1
  {
    id: "b-ov-1",
    resourceId: "ac-1",
    type: "maintenance",
    title: "Avionics Check",
    startMinutes: 500,
    endMinutes: 580,
    status: "confirmed",
  },
  {
    id: "b-ov-2",
    resourceId: "ac-1",
    type: "briefing",
    title: "Pre-flight Brief",
    startMinutes: 510,
    endMinutes: 560,
    status: "confirmed",
  },
  // Triple overlap on inst-1
  {
    id: "b-ov-3",
    resourceId: "inst-1",
    type: "ground",
    title: "Radio Ops",
    startMinutes: 490,
    endMinutes: 570,
    status: "confirmed",
  },
  {
    id: "b-ov-4",
    resourceId: "inst-1",
    type: "theory",
    title: "Met Theory",
    startMinutes: 500,
    endMinutes: 590,
    status: "pending",
  },
];

// ── Stories ─────────────────────────────────────────────────────────────────

function DayViewWrapper(props: {
  bookings: Booking[];
  resourceGroups: ResourceGroup[];
  defaultViewMode?: "day" | "week" | "month";
}) {
  return (
    <div
      className="pro-calendr-react"
      style={{ height: "100vh", display: "flex", flexDirection: "column" }}
    >
      <ScheduleProvider defaultViewMode={props.defaultViewMode ?? "day"}>
        <DayView
          bookings={props.bookings}
          resourceGroups={props.resourceGroups}
          layoutConfig={LAYOUT_DEFAULTS}
          bookingTypes={BOOKING_TYPES}
          onBookingClick={({ booking, anchor }) => {
            console.log("Booking clicked:", booking.title, "at", anchor);
          }}
        />
      </ScheduleProvider>
    </div>
  );
}

const meta: Meta<typeof DayViewWrapper> = {
  title: "DayView",
  component: DayViewWrapper,
};

export default meta;

type Story = StoryObj<typeof DayViewWrapper>;

export const Default: Story = {
  args: {
    bookings: MOCK_BOOKINGS,
    resourceGroups: RESOURCE_GROUPS,
  },
};

export const ManyOverlaps: Story = {
  args: {
    bookings: OVERLAP_BOOKINGS,
    resourceGroups: RESOURCE_GROUPS,
  },
};

export const EmptyDay: Story = {
  args: {
    bookings: [],
    resourceGroups: RESOURCE_GROUPS,
  },
};
