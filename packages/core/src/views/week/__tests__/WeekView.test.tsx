import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Booking } from "../../../interfaces/booking";
import type { ResourceGroup } from "../../../interfaces/resource";
import { ScheduleProvider } from "../../../components/ScheduleProvider";
import { WeekView } from "../WeekView";
import { BOOKING_TYPES } from "../../../constants/booking-types";
import { LAYOUT_DEFAULTS } from "../../../constants/layout-defaults";
import { getWeekDays } from "../../../utils/date-helpers";
import { formatDateKey } from "../../../utils/format-date-key";

let originalResizeObserver: typeof ResizeObserver;

beforeAll(() => {
  originalResizeObserver = window.ResizeObserver;

  window.ResizeObserver = class MockResizeObserver {
    private callback: ResizeObserverCallback;

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }

    observe(target: Element) {
      this.callback(
        [
          {
            target,
            contentRect: {
              width: 1200,
              height: 800,
              top: 0,
              left: 0,
              bottom: 800,
              right: 1200,
              x: 0,
              y: 0,
              toJSON: () => ({}),
            },
            borderBoxSize: [{ blockSize: 800, inlineSize: 1200 }],
            contentBoxSize: [{ blockSize: 800, inlineSize: 1200 }],
            devicePixelContentBoxSize: [{ blockSize: 800, inlineSize: 1200 }],
          } as unknown as ResizeObserverEntry,
        ],
        this,
      );
    }

    unobserve = vi.fn();
    disconnect = vi.fn();
  };
});

afterAll(() => {
  window.ResizeObserver = originalResizeObserver;
});

const TEST_GROUPS: ResourceGroup[] = [
  {
    id: "aircraft",
    label: "Aircraft",
    resources: [
      { id: "ac-1", title: "CS-UMH", subtitle: "Cessna 172S", groupId: "aircraft" },
      { id: "ac-2", title: "CS-UMG", subtitle: "Piper PA-28", groupId: "aircraft" },
    ],
  },
  {
    id: "instructors",
    label: "Instructors",
    resources: [{ id: "inst-1", title: "Jose Silva", subtitle: "CFI", groupId: "instructors" }],
  },
];

function makeBooking(overrides: Partial<Booking> & { id: string; resourceId: string }): Booking {
  return {
    type: "flight",
    title: "Test Flight",
    startMinutes: 480,
    endMinutes: 540,
    status: "confirmed",
    ...overrides,
  };
}

function getWeekDateKeys(): string[] {
  return getWeekDays({ date: new Date() }).map((day) => formatDateKey({ date: day }));
}

function renderWeekView({ bookings = [] as Booking[], resourceGroups = TEST_GROUPS } = {}) {
  return render(
    <ScheduleProvider defaultViewMode="week">
      <WeekView
        bookings={bookings}
        resourceGroups={resourceGroups}
        layoutConfig={LAYOUT_DEFAULTS}
        bookingTypes={BOOKING_TYPES}
      />
    </ScheduleProvider>,
  );
}

describe("WeekView", () => {
  it("renders 7 day column headers", () => {
    renderWeekView();
    const dayAbbrevs = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    for (const abbrev of dayAbbrevs) {
      expect(screen.getByText(abbrev)).toBeDefined();
    }
  });

  it("renders the Resources label", () => {
    renderWeekView();
    expect(screen.getByText("Resources")).toBeDefined();
  });

  it("renders group headers", () => {
    renderWeekView();
    expect(screen.getByText("Aircraft")).toBeDefined();
    expect(screen.getByText("Instructors")).toBeDefined();
  });

  it("renders resource names in the sidebar", () => {
    renderWeekView();
    expect(screen.getByText("CS-UMH")).toBeDefined();
    expect(screen.getByText("CS-UMG")).toBeDefined();
    expect(screen.getByText("Jose Silva")).toBeDefined();
  });

  it("renders compact booking blocks in cells", () => {
    const dateKeys = getWeekDateKeys();
    const bookings = [
      makeBooking({ id: "b-1", resourceId: "ac-1", date: dateKeys[0], title: "VFR Navigation" }),
      makeBooking({ id: "b-2", resourceId: "inst-1", date: dateKeys[2], title: "IFR Training" }),
    ];

    renderWeekView({ bookings });
    expect(screen.getByText("VFR Navigation")).toBeDefined();
    expect(screen.getByText("IFR Training")).toBeDefined();
  });

  it("shows overflow indicator when more than 2 bookings in a cell", () => {
    const dateKeys = getWeekDateKeys();
    const bookings = [
      makeBooking({ id: "b-1", resourceId: "ac-1", date: dateKeys[0], title: "Flight A" }),
      makeBooking({
        id: "b-2",
        resourceId: "ac-1",
        date: dateKeys[0],
        title: "Flight B",
        startMinutes: 600,
        endMinutes: 720,
      }),
      makeBooking({
        id: "b-3",
        resourceId: "ac-1",
        date: dateKeys[0],
        title: "Flight C",
        startMinutes: 780,
        endMinutes: 900,
      }),
    ];

    renderWeekView({ bookings });
    expect(screen.getByText("+1 more")).toBeDefined();
  });

  it("renders with empty bookings", () => {
    const { container } = renderWeekView({ bookings: [] });
    // Should still render the grid structure
    expect(container.querySelector(".grid-cols-7")).not.toBeNull();
  });

  it("renders resource count badges", () => {
    renderWeekView();
    expect(screen.getByText("2")).toBeDefined();
    expect(screen.getByText("1")).toBeDefined();
  });

  it("renders resource avatars", () => {
    renderWeekView();
    expect(screen.getByText("UMH")).toBeDefined();
    expect(screen.getByText("UMG")).toBeDefined();
    expect(screen.getByText("JS")).toBeDefined();
  });

  it("shows booking start time in compact blocks", () => {
    const dateKeys = getWeekDateKeys();
    const bookings = [
      makeBooking({ id: "b-1", resourceId: "ac-1", date: dateKeys[0], startMinutes: 480 }),
    ];

    renderWeekView({ bookings });
    expect(screen.getByText("8:00")).toBeDefined();
  });

  it("renders with multiple resource groups", () => {
    const groups: ResourceGroup[] = [
      ...TEST_GROUPS,
      {
        id: "rooms",
        label: "Rooms",
        resources: [{ id: "room-1", title: "Briefing Room 1", groupId: "rooms" }],
      },
    ];

    renderWeekView({ resourceGroups: groups });
    expect(screen.getByText("Rooms")).toBeDefined();
    expect(screen.getByText("Briefing Room 1")).toBeDefined();
  });
});
