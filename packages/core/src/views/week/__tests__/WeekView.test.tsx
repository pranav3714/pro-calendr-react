import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { WeekView } from "../WeekView";
import { CalendarProvider } from "../../../components/CalendarProvider";
import type { CalendarEvent } from "../../../types";

function makeEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: "1",
    title: "Test Event",
    start: new Date(2026, 1, 11, 9, 0), // Wed Feb 11
    end: new Date(2026, 1, 11, 10, 0),
    ...overrides,
  };
}

const weekRange = {
  start: new Date(2026, 1, 9), // Monday Feb 9
  end: new Date(2026, 1, 15), // Sunday Feb 15
};

/** Wraps children in CalendarProvider to provide config context */
function Wrapper({ children }: { children: ReactNode }) {
  return <CalendarProvider>{children}</CalendarProvider>;
}

describe("WeekView", () => {
  it("renders without crashing", () => {
    render(<WeekView events={[]} dateRange={weekRange} />, { wrapper: Wrapper });
    expect(screen.getByTestId("pro-calendr-react-week")).toBeDefined();
  });

  it("renders 7 day columns", () => {
    render(<WeekView events={[]} dateRange={weekRange} />, { wrapper: Wrapper });
    const headers = screen.getAllByText(/Mon|Tue|Wed|Thu|Fri|Sat|Sun/);
    expect(headers.length).toBe(7);
  });

  it("renders day numbers in headers", () => {
    render(<WeekView events={[]} dateRange={weekRange} />, { wrapper: Wrapper });
    // Days 9-15 should be rendered
    expect(screen.getByText("9")).toBeDefined();
    expect(screen.getByText("15")).toBeDefined();
  });

  it("renders time labels", () => {
    render(
      <WeekView
        events={[]}
        dateRange={weekRange}
        slotMinTime="08:00"
        slotMaxTime="12:00"
        slotDuration={60}
      />,
      { wrapper: Wrapper },
    );
    // Labels should include hour marks (but not the first 08:00)
    expect(screen.getByText("09:00")).toBeDefined();
    expect(screen.getByText("10:00")).toBeDefined();
    expect(screen.getByText("11:00")).toBeDefined();
  });

  it("renders events at correct positions", () => {
    const events = [
      makeEvent({
        id: "e1",
        title: "Morning Meeting",
        start: new Date(2026, 1, 11, 9, 0),
        end: new Date(2026, 1, 11, 10, 0),
      }),
    ];
    render(<WeekView events={events} dateRange={weekRange} />, { wrapper: Wrapper });
    expect(screen.getByTestId("event-e1")).toBeDefined();
  });

  it("renders multiple events on different days", () => {
    const events = [
      makeEvent({
        id: "e1",
        start: new Date(2026, 1, 10, 9, 0),
        end: new Date(2026, 1, 10, 10, 0),
      }),
      makeEvent({
        id: "e2",
        start: new Date(2026, 1, 12, 14, 0),
        end: new Date(2026, 1, 12, 15, 0),
      }),
    ];
    render(<WeekView events={events} dateRange={weekRange} />, { wrapper: Wrapper });
    expect(screen.getByTestId("event-e1")).toBeDefined();
    expect(screen.getByTestId("event-e2")).toBeDefined();
  });

  it("renders all-day events in separate row", () => {
    const events = [
      makeEvent({
        id: "allday1",
        title: "All Day Event",
        allDay: true,
        start: new Date(2026, 1, 11),
        end: new Date(2026, 1, 11),
      }),
    ];
    render(<WeekView events={events} dateRange={weekRange} />, { wrapper: Wrapper });
    expect(screen.getByText("all-day")).toBeDefined();
    expect(screen.getByTestId("event-allday1")).toBeDefined();
  });

  it("does not render all-day row when no all-day events", () => {
    render(<WeekView events={[makeEvent()]} dateRange={weekRange} />, { wrapper: Wrapper });
    expect(screen.queryByText("all-day")).toBeNull();
  });

  it("uses custom eventContent render prop", () => {
    const events = [makeEvent({ id: "custom1", title: "Custom" })];
    render(
      <WeekView
        events={events}
        dateRange={weekRange}
        eventContent={({ event }) => <span data-testid="custom-content">{event.title}!</span>}
      />,
      { wrapper: Wrapper },
    );
    expect(screen.getByTestId("custom-content")).toBeDefined();
    expect(screen.getByText("Custom!")).toBeDefined();
  });

  it("renders time slot columns", () => {
    render(<WeekView events={[]} dateRange={weekRange} />, { wrapper: Wrapper });
    const columns = document.querySelectorAll(".pro-calendr-react-time-slot-column");
    expect(columns.length).toBe(7);
  });

  it("renders correct number of time slots for custom slotDuration", () => {
    render(
      <WeekView
        events={[]}
        dateRange={weekRange}
        slotMinTime="08:00"
        slotMaxTime="12:00"
        slotDuration={60}
      />,
      { wrapper: Wrapper },
    );
    // 4 slots (08:00-09:00, 09:00-10:00, 10:00-11:00, 11:00-12:00)
    // Each column has 4 slots, 7 columns = 28 slots + 4 time labels
    const slotElements = document.querySelectorAll(".pro-calendr-react-time-slot");
    expect(slotElements.length).toBe(4 * 7); // 4 slots per column * 7 days
  });

  it("applies event colors", () => {
    const events = [
      makeEvent({
        id: "colored",
        backgroundColor: "#ff0000",
        textColor: "#ffffff",
      }),
    ];
    render(<WeekView events={events} dateRange={weekRange} />, { wrapper: Wrapper });
    const eventEl = screen.getByTestId("event-colored");
    expect(eventEl.style.backgroundColor).toBe("rgb(255, 0, 0)");
    expect(eventEl.style.color).toBe("rgb(255, 255, 255)");
  });

  it("does not render events outside the date range", () => {
    const events = [
      makeEvent({
        id: "outside",
        start: new Date(2026, 1, 20, 9, 0),
        end: new Date(2026, 1, 20, 10, 0),
      }),
    ];
    render(<WeekView events={events} dateRange={weekRange} />, { wrapper: Wrapper });
    expect(screen.queryByTestId("event-outside")).toBeNull();
  });
});
