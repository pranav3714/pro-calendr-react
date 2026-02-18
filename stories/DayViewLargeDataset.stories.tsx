import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Booking } from "../packages/core/src/interfaces/booking";
import type { Resource, ResourceGroup } from "../packages/core/src/interfaces/resource";
import { ScheduleProvider } from "../packages/core/src/components/ScheduleProvider";
import { DayView } from "../packages/core/src/views/day/DayView";
import { BOOKING_TYPES } from "../packages/core/src/constants/booking-types";
import { LAYOUT_DEFAULTS } from "../packages/core/src/constants/layout-defaults";

// ── Seeded pseudo-random generator for deterministic data ───────────────────

function createSeededRandom(params: { seed: number }) {
  let current = params.seed;
  return function next() {
    current = (current * 16807 + 0) % 2147483647;
    return (current - 1) / 2147483646;
  };
}

// ── Large dataset generators ────────────────────────────────────────────────

const GROUP_NAMES = [
  "Aircraft",
  "Instructors",
  "Simulators",
  "Rooms",
  "Helicopters",
  "Maintenance",
  "Ground School",
  "Examiners",
  "Dispatch",
  "Hangars",
];

const BOOKING_TYPE_KEYS = [
  "flight",
  "maintenance",
  "briefing",
  "ground",
  "simulator",
  "theory",
  "exam",
];

const STATUS_OPTIONS: Booking["status"][] = ["confirmed", "pending", "in-progress"];

function generateLargeResourceGroups(params: {
  groupCount: number;
  resourcesPerGroup: number;
}): ResourceGroup[] {
  const groups: ResourceGroup[] = [];

  for (let g = 0; g < params.groupCount; g++) {
    const groupId = `group-${String(g)}`;
    const resources: Resource[] = [];

    for (let r = 0; r < params.resourcesPerGroup; r++) {
      resources.push({
        id: `res-${String(g)}-${String(r)}`,
        title: `${GROUP_NAMES[g % GROUP_NAMES.length]} ${String(r + 1).padStart(3, "0")}`,
        subtitle: `${GROUP_NAMES[g % GROUP_NAMES.length]} Unit`,
        groupId,
      });
    }

    groups.push({
      id: groupId,
      label: GROUP_NAMES[g % GROUP_NAMES.length],
      resources,
    });
  }

  return groups;
}

function generateLargeBookingSet(params: {
  resourceGroups: readonly ResourceGroup[];
  bookingsPerResource: number;
  seed: number;
}): Booking[] {
  const random = createSeededRandom({ seed: params.seed });
  const bookings: Booking[] = [];
  let id = 0;

  for (const group of params.resourceGroups) {
    for (const resource of group.resources) {
      for (let b = 0; b < params.bookingsPerResource; b++) {
        const startMinutes = Math.floor(random() * 720) + 360;
        const duration = Math.floor(random() * 150) + 30;
        const typeIndex = id % BOOKING_TYPE_KEYS.length;
        const statusIndex = id % STATUS_OPTIONS.length;

        bookings.push({
          id: `bk-${String(id)}`,
          resourceId: resource.id,
          type: BOOKING_TYPE_KEYS[typeIndex],
          title: `${BOOKING_TYPE_KEYS[typeIndex]} ${String(id)}`,
          startMinutes,
          endMinutes: startMinutes + duration,
          status: STATUS_OPTIONS[statusIndex],
        });

        id++;
      }
    }
  }

  return bookings;
}

// ── Pre-generated data (deterministic) ──────────────────────────────────────

const LARGE_GROUPS = generateLargeResourceGroups({
  groupCount: 10,
  resourcesPerGroup: 50,
});

const LARGE_BOOKINGS = generateLargeBookingSet({
  resourceGroups: LARGE_GROUPS,
  bookingsPerResource: 4,
  seed: 42,
});

// ── Story ───────────────────────────────────────────────────────────────────

function LargeDatasetWrapper(props: { bookings: Booking[]; resourceGroups: ResourceGroup[] }) {
  return (
    <div
      className="pro-calendr-react"
      style={{ height: "100vh", display: "flex", flexDirection: "column" }}
    >
      <div className="bg-blue-50 px-4 py-2 text-sm text-blue-700">
        {props.resourceGroups.reduce((sum, g) => sum + g.resources.length, 0)} resources |{" "}
        {props.bookings.length} bookings — scroll to verify 60fps
      </div>
      <ScheduleProvider defaultViewMode="day">
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

const meta: Meta<typeof LargeDatasetWrapper> = {
  title: "DayView/LargeDataset",
  component: LargeDatasetWrapper,
};

export default meta;

type Story = StoryObj<typeof LargeDatasetWrapper>;

export const FiveHundredResources: Story = {
  args: {
    bookings: LARGE_BOOKINGS,
    resourceGroups: LARGE_GROUPS,
  },
};

export const OneHundredResources: Story = {
  args: {
    bookings: generateLargeBookingSet({
      resourceGroups: generateLargeResourceGroups({ groupCount: 5, resourcesPerGroup: 20 }),
      bookingsPerResource: 4,
      seed: 123,
    }),
    resourceGroups: generateLargeResourceGroups({ groupCount: 5, resourcesPerGroup: 20 }),
  },
};
