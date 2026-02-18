import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { Booking } from "../../interfaces/booking";
import type { ResourceGroup } from "../../interfaces/resource";
import { ScheduleCalendar } from "../../ScheduleCalendar";
import { BOOKING_TYPES } from "../../constants/booking-types";

// ── Helpers ─────────────────────────────────────────────────────────────────

const TEST_GROUPS: ResourceGroup[] = [
  {
    id: "aircraft",
    label: "Aircraft",
    resources: [
      { id: "ac-1", title: "CS-UMH", subtitle: "Cessna 172S", groupId: "aircraft" },
      { id: "ac-2", title: "CS-UMG", subtitle: "Cessna 172S", groupId: "aircraft" },
    ],
  },
  {
    id: "instructors",
    label: "Instructors",
    resources: [{ id: "inst-1", title: "Jose Silva", subtitle: "CFI", groupId: "instructors" }],
  },
];

function makeBooking(overrides: Partial<Booking> & { id: string }): Booking {
  return {
    resourceId: "ac-1",
    type: "flight",
    title: "Test Flight",
    startMinutes: 480,
    endMinutes: 540,
    status: "confirmed",
    date: "2026-02-18",
    ...overrides,
  };
}

const TEST_BOOKINGS: Booking[] = [
  makeBooking({ id: "b-1", type: "flight", title: "VFR Nav" }),
  makeBooking({ id: "b-2", type: "ground", title: "Met Brief", resourceId: "inst-1" }),
  makeBooking({
    id: "b-3",
    type: "simulator",
    title: "IR Approaches",
    resourceId: "ac-2",
    startMinutes: 600,
    endMinutes: 720,
  }),
];

function renderScheduleCalendar({
  bookings = TEST_BOOKINGS,
  defaultViewMode,
  onDateChange,
  onViewModeChange,
}: {
  bookings?: Booking[];
  defaultViewMode?: "day" | "week" | "month";
  onDateChange?: (params: { readonly date: Date }) => void;
  onViewModeChange?: (params: { readonly mode: string }) => void;
} = {}) {
  return render(
    <ScheduleCalendar
      bookings={bookings}
      resourceGroups={TEST_GROUPS}
      title="Schedule"
      defaultViewMode={defaultViewMode}
      onDateChange={onDateChange}
      onViewModeChange={onViewModeChange}
    />,
  );
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe("ScheduleCalendar", () => {
  it("renders the title", () => {
    renderScheduleCalendar();
    expect(screen.getByText("Schedule")).toBeDefined();
  });

  it("renders the legend footer with booking type labels", () => {
    renderScheduleCalendar();
    expect(screen.getByText("Legend")).toBeDefined();
    expect(screen.getByText("Flight")).toBeDefined();
    expect(screen.getByText("Ground School")).toBeDefined();
    expect(screen.getByText("Simulator")).toBeDefined();
  });

  it("renders view mode toggle buttons", () => {
    renderScheduleCalendar();
    expect(screen.getByText("Day")).toBeDefined();
    expect(screen.getByText("Week")).toBeDefined();
    expect(screen.getByText("Month")).toBeDefined();
  });

  it("renders the Today navigation button", () => {
    renderScheduleCalendar();
    expect(screen.getByText("Today")).toBeDefined();
  });

  it("renders filter button", () => {
    renderScheduleCalendar();
    expect(screen.getByText("Filter")).toBeDefined();
  });

  it("renders stats bar in day view", () => {
    renderScheduleCalendar({ defaultViewMode: "day" });
    expect(screen.getByText("3 bookings")).toBeDefined();
  });

  it("does not render stats bar in week view", () => {
    renderScheduleCalendar({ defaultViewMode: "week" });
    expect(screen.queryByText("3 bookings")).toBeNull();
  });

  it("does not render stats bar in month view", () => {
    renderScheduleCalendar({ defaultViewMode: "month" });
    expect(screen.queryByText("3 bookings")).toBeNull();
  });

  it("switches to week view when Week button is clicked", () => {
    const onViewModeChange = vi.fn();
    renderScheduleCalendar({ onViewModeChange });

    fireEvent.click(screen.getByText("Week"));

    expect(onViewModeChange).toHaveBeenCalledWith({ mode: "week" });
  });

  it("switches to month view when Month button is clicked", () => {
    const onViewModeChange = vi.fn();
    renderScheduleCalendar({ onViewModeChange });

    fireEvent.click(screen.getByText("Month"));

    expect(onViewModeChange).toHaveBeenCalledWith({ mode: "month" });
  });

  it("fires onDateChange when navigating", () => {
    const onDateChange = vi.fn();
    renderScheduleCalendar({ onDateChange });

    fireEvent.click(screen.getByLabelText("Next"));

    expect(onDateChange).toHaveBeenCalledTimes(1);
    expect(onDateChange.mock.calls[0][0]).toHaveProperty("date");
  });

  it("fires onDateChange when clicking Today", () => {
    const onDateChange = vi.fn();
    renderScheduleCalendar({ onDateChange });

    fireEvent.click(screen.getByText("Today"));

    expect(onDateChange).toHaveBeenCalledTimes(1);
  });

  it("applies dark mode data-theme attribute", () => {
    const { container } = render(
      <ScheduleCalendar bookings={[]} resourceGroups={TEST_GROUPS} darkMode={true} />,
    );

    const root = container.firstElementChild;
    expect(root?.getAttribute("data-theme")).toBe("dark");
  });

  it("does not set data-theme when darkMode is false", () => {
    const { container } = render(<ScheduleCalendar bookings={[]} resourceGroups={TEST_GROUPS} />);

    const root = container.firstElementChild;
    expect(root?.getAttribute("data-theme")).toBeNull();
  });

  it("renders all booking type labels in the legend", () => {
    renderScheduleCalendar();
    for (const config of Object.values(BOOKING_TYPES)) {
      expect(screen.getByText(config.label)).toBeDefined();
    }
  });

  it("renders empty state without errors", () => {
    renderScheduleCalendar({ bookings: [] });
    expect(screen.getByText("0 bookings")).toBeDefined();
  });
});
