import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Booking } from "../../../interfaces/booking";
import type { ResourceGroup } from "../../../interfaces/resource";
import { ScheduleProvider } from "../../../components/ScheduleProvider";
import { DayView } from "../DayView";
import { BOOKING_TYPES } from "../../../constants/booking-types";
import { LAYOUT_DEFAULTS } from "../../../constants/layout-defaults";

// Override ResizeObserver to fire callback immediately so @tanstack/react-virtual
// knows the scroll container dimensions in JSDOM
let originalResizeObserver: typeof ResizeObserver;

beforeAll(() => {
  originalResizeObserver = window.ResizeObserver;

  window.ResizeObserver = class MockResizeObserver {
    private callback: ResizeObserverCallback;

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }

    observe(target: Element) {
      // Fire callback immediately with mock dimensions
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

function renderDayView({ bookings = [] as Booking[], resourceGroups = TEST_GROUPS } = {}) {
  return render(
    <ScheduleProvider defaultViewMode="day">
      <DayView
        bookings={bookings}
        resourceGroups={resourceGroups}
        layoutConfig={LAYOUT_DEFAULTS}
        bookingTypes={BOOKING_TYPES}
      />
    </ScheduleProvider>,
  );
}

describe("DayView", () => {
  it("renders the RESOURCES label in the time header", () => {
    renderDayView();
    expect(screen.getByText("RESOURCES")).toBeDefined();
  });

  it("renders hour marks in the time header", () => {
    renderDayView();
    // Default config: dayStartHour=0, dayEndHour=24
    expect(screen.getByText("08:00")).toBeDefined();
    expect(screen.getByText("12:00")).toBeDefined();
    expect(screen.getByText("18:00")).toBeDefined();
  });

  it("renders group headers", () => {
    renderDayView();
    expect(screen.getByText("Aircraft")).toBeDefined();
    expect(screen.getByText("Instructors")).toBeDefined();
  });

  it("renders resource names", () => {
    renderDayView();
    expect(screen.getByText("CS-UMH")).toBeDefined();
    expect(screen.getByText("CS-UMG")).toBeDefined();
    expect(screen.getByText("Jose Silva")).toBeDefined();
  });

  it("renders resource subtitles", () => {
    renderDayView();
    expect(screen.getByText("Cessna 172S")).toBeDefined();
    expect(screen.getByText("CFI")).toBeDefined();
  });

  it("renders booking blocks for provided bookings", () => {
    const bookings = [
      makeBooking({ id: "b1", resourceId: "ac-1", title: "VFR Navigation" }),
      makeBooking({ id: "b2", resourceId: "inst-1", title: "IFR Training" }),
    ];

    renderDayView({ bookings });
    expect(screen.getByText("VFR Navigation")).toBeDefined();
    expect(screen.getByText("IFR Training")).toBeDefined();
  });

  it("renders empty grid when no bookings provided", () => {
    const { container } = renderDayView({ bookings: [] });
    // Should still render the grid structure without any booking buttons
    const bookingButtons = container.querySelectorAll("[data-booking-id]");
    expect(bookingButtons.length).toBe(0);
  });

  it("renders resource count badges on group headers", () => {
    renderDayView();
    // Aircraft group has 2 resources, Instructors has 1
    expect(screen.getByText("2")).toBeDefined();
    expect(screen.getByText("1")).toBeDefined();
  });

  it("shows resource avatar initials", () => {
    renderDayView();
    // Aircraft: last 3 chars → "UMH", "UMG"
    expect(screen.getByText("UMH")).toBeDefined();
    expect(screen.getByText("UMG")).toBeDefined();
    // Instructors: first letter of each word → "JS"
    expect(screen.getByText("JS")).toBeDefined();
  });
});
