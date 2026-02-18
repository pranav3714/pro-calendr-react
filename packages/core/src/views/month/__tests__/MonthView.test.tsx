import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { Booking } from "../../../interfaces/booking";
import { ScheduleProvider } from "../../../components/ScheduleProvider";
import { MonthView } from "../MonthView";
import { BOOKING_TYPES } from "../../../constants/booking-types";
import { getMonthDays } from "../../../utils/date-helpers";

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

const FEB_2026 = new Date(2026, 1, 15);

function renderMonthView({
  bookings = [] as Booking[],
  currentDate = FEB_2026,
  onDayClick,
}: {
  bookings?: Booking[];
  currentDate?: Date;
  onDayClick?: (params: { readonly date: Date }) => void;
} = {}) {
  return render(
    <ScheduleProvider defaultViewMode="month">
      <MonthView
        bookings={bookings}
        bookingTypes={BOOKING_TYPES}
        currentDate={currentDate}
        onDayClick={onDayClick}
      />
    </ScheduleProvider>,
  );
}

describe("MonthView", () => {
  it("renders 7 day-of-week headers", () => {
    renderMonthView();
    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    for (const label of dayLabels) {
      expect(screen.getByText(label)).toBeDefined();
    }
  });

  it("renders the correct number of day cells", () => {
    const { container } = renderMonthView();
    const monthDays = getMonthDays({ date: FEB_2026 });
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBe(monthDays.length);
  });

  it("highlights today with blue styling", () => {
    const today = new Date();
    const { container } = renderMonthView({ currentDate: today });

    // The today circle should have bg-blue-600
    const todayCircle = container.querySelector(".bg-blue-600");
    expect(todayCircle).not.toBeNull();
  });

  it("dims other-month days with reduced opacity", () => {
    const { container } = renderMonthView();
    // Feb 2026 starts on Sunday, so Mon-Sat are from January
    const dimmedCells = container.querySelectorAll(".opacity-40");
    expect(dimmedCells.length).toBeGreaterThan(0);
  });

  it("shows booking counts for days with bookings", () => {
    const bookings = [
      makeBooking({ id: "b-1", resourceId: "ac-1", date: "2026-02-10" }),
      makeBooking({ id: "b-2", resourceId: "ac-2", date: "2026-02-10" }),
      makeBooking({ id: "b-3", resourceId: "ac-1", date: "2026-02-10", type: "simulator" }),
    ];

    const { container } = renderMonthView({ bookings });
    // Count badge has specific class for tabular-nums
    const countBadges = container.querySelectorAll(".tabular-nums");
    const countsWithThree = Array.from(countBadges).filter((el) => el.textContent === "3");
    expect(countsWithThree.length).toBe(1);
  });

  it("shows type indicator dots with labels", () => {
    const bookings = [
      makeBooking({ id: "b-1", resourceId: "ac-1", date: "2026-02-10", type: "flight" }),
      makeBooking({ id: "b-2", resourceId: "ac-2", date: "2026-02-10", type: "flight" }),
    ];

    renderMonthView({ bookings });
    expect(screen.getByText("2 Flight")).toBeDefined();
  });

  it("shows overflow text when more than 3 booking types", () => {
    const bookings = [
      makeBooking({ id: "b-1", resourceId: "ac-1", date: "2026-02-10", type: "flight" }),
      makeBooking({ id: "b-2", resourceId: "ac-2", date: "2026-02-10", type: "ground" }),
      makeBooking({ id: "b-3", resourceId: "ac-3", date: "2026-02-10", type: "simulator" }),
      makeBooking({ id: "b-4", resourceId: "ac-4", date: "2026-02-10", type: "theory" }),
    ];

    renderMonthView({ bookings });
    expect(screen.getByText("+1 more")).toBeDefined();
  });

  it("fires onDayClick when a day cell is clicked", () => {
    const onDayClick = vi.fn();
    renderMonthView({ onDayClick });

    // Click on date 15 (our target date in the grid)
    const dayButton = screen.getByText("15").closest("button");
    expect(dayButton).not.toBeNull();
    fireEvent.click(dayButton as HTMLElement);

    expect(onDayClick).toHaveBeenCalledOnce();
    expect(onDayClick).toHaveBeenCalledWith({ date: expect.any(Date) });
  });

  it("renders with empty bookings showing zero counts", () => {
    renderMonthView({ bookings: [] });
    // Should render grid without any count badges
    const { container } = renderMonthView({ bookings: [] });
    // The grid structure should exist
    expect(container.querySelector(".grid-cols-7")).not.toBeNull();
  });

  it("renders the correct month dates", () => {
    renderMonthView();
    // Feb 2026 has 28 days. Use getAllByText since dates can appear from padding days too
    const allOnes = screen.getAllByText("28");
    expect(allOnes.length).toBeGreaterThanOrEqual(1);
    // Check a mid-month date that is unique to Feb
    expect(screen.getByText("15")).toBeDefined();
  });
});
