import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRef } from "react";
import { Calendar } from "../Calendar";
import type { CalendarRef, CalendarEvent } from "../../types";
import { useCalendarStore } from "../../store/calendar-store";

function makeEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: "1",
    title: "Test Event",
    start: new Date(2026, 1, 11, 9, 0), // Wed Feb 11
    end: new Date(2026, 1, 11, 10, 0),
    ...overrides,
  };
}

// Reset store between tests
function resetStore() {
  useCalendarStore.setState({
    currentView: "week",
    currentDate: new Date(),
    dateRange: { start: new Date(), end: new Date() },
    firstDay: 1,
    selection: null,
    dragState: null,
    hoveredSlot: null,
    filteredResourceIds: [],
  });
}

function getRef(ref: React.RefObject<CalendarRef | null>): CalendarRef {
  if (!ref.current) throw new Error("Ref not set");
  return ref.current;
}

describe("Calendar", () => {
  beforeEach(() => {
    resetStore();
  });

  it("renders without crashing", () => {
    render(<Calendar />);
    expect(screen.getByTestId("pro-calendr-react")).toBeInTheDocument();
  });

  it("renders toolbar and body", () => {
    render(<Calendar />);
    expect(screen.getByTestId("pro-calendr-react-toolbar")).toBeDefined();
    expect(screen.getByTestId("pro-calendr-react-body")).toBeDefined();
  });

  it("renders DateNavigation with Today, Prev, Next buttons", () => {
    render(<Calendar />);
    expect(screen.getByText("Today")).toBeDefined();
    expect(screen.getByText("Prev")).toBeDefined();
    expect(screen.getByText("Next")).toBeDefined();
  });

  it("renders ViewSelector with available views", () => {
    render(<Calendar views={["week", "day", "month"]} />);
    expect(screen.getByText("week")).toBeDefined();
    expect(screen.getByText("day")).toBeDefined();
    expect(screen.getByText("month")).toBeDefined();
  });

  it("navigates to previous week when Prev is clicked", () => {
    const onDateRangeChange = vi.fn();
    render(<Calendar defaultDate={new Date(2026, 1, 11)} onDateRangeChange={onDateRangeChange} />);

    fireEvent.click(screen.getByText("Prev"));

    expect(onDateRangeChange).toHaveBeenCalled();
    const range = onDateRangeChange.mock.calls[onDateRangeChange.mock.calls.length - 1][0] as {
      start: Date;
      end: Date;
    };
    // New range should be before Feb 9 (which was the start of the week for Feb 11)
    expect(range.start.getTime()).toBeLessThan(new Date(2026, 1, 9).getTime());
  });

  it("navigates to next week when Next is clicked", () => {
    const onDateRangeChange = vi.fn();
    render(<Calendar defaultDate={new Date(2026, 1, 11)} onDateRangeChange={onDateRangeChange} />);

    fireEvent.click(screen.getByText("Next"));

    expect(onDateRangeChange).toHaveBeenCalled();
    const range = onDateRangeChange.mock.calls[onDateRangeChange.mock.calls.length - 1][0] as {
      start: Date;
      end: Date;
    };
    // New range should be after Feb 15 (end of original week)
    expect(range.start.getTime()).toBeGreaterThan(new Date(2026, 1, 11).getTime());
  });

  it("navigates to today when Today is clicked", () => {
    const onDateRangeChange = vi.fn();
    render(<Calendar defaultDate={new Date(2024, 0, 1)} onDateRangeChange={onDateRangeChange} />);

    fireEvent.click(screen.getByText("Today"));

    expect(onDateRangeChange).toHaveBeenCalled();
    const range = onDateRangeChange.mock.calls[onDateRangeChange.mock.calls.length - 1][0] as {
      start: Date;
      end: Date;
    };
    const now = new Date();
    // Range should contain today
    expect(range.start.getTime()).toBeLessThanOrEqual(now.getTime());
    expect(range.end.getTime()).toBeGreaterThanOrEqual(now.getTime());
  });

  it("fires onViewChange when view is switched", () => {
    const onViewChange = vi.fn();
    render(<Calendar views={["week", "day", "month"]} onViewChange={onViewChange} />);

    fireEvent.click(screen.getByText("day"));

    expect(onViewChange).toHaveBeenCalledWith("day");
  });

  it("renders loading skeleton when loading is true", () => {
    render(<Calendar loading />);
    expect(screen.getByTestId("pro-calendr-react")).toBeDefined();
    expect(screen.queryByTestId("pro-calendr-react-body")).toBeNull();
    const skeleton = document.querySelector(".pro-calendr-react-skeleton");
    expect(skeleton).toBeDefined();
  });

  it("shows CalendarBody when not loading", () => {
    render(<Calendar />);
    expect(screen.getByTestId("pro-calendr-react-body")).toBeDefined();
    const skeleton = document.querySelector(".pro-calendr-react-skeleton");
    expect(skeleton).toBeNull();
  });

  it("renders week view by default", () => {
    render(<Calendar />);
    expect(screen.getByTestId("pro-calendr-react-week")).toBeDefined();
  });

  it("shows placeholder for unimplemented views", () => {
    render(<Calendar defaultView="month" />);
    expect(screen.getByText("month view coming soon")).toBeDefined();
  });

  it("renders events in the week view", () => {
    const events = [
      makeEvent({
        id: "e1",
        title: "Team Meeting",
        start: new Date(2026, 1, 11, 9, 0),
        end: new Date(2026, 1, 11, 10, 0),
      }),
    ];
    render(<Calendar events={events} defaultDate={new Date(2026, 1, 11)} />);
    expect(screen.getByTestId("event-e1")).toBeDefined();
  });

  it("uses custom eventContent render prop", () => {
    const events = [makeEvent({ id: "custom1", title: "Custom" })];
    render(
      <Calendar
        events={events}
        defaultDate={new Date(2026, 1, 11)}
        eventContent={({ event }) => <span data-testid="custom">{event.title}!</span>}
      />,
    );
    expect(screen.getByTestId("custom")).toBeDefined();
    expect(screen.getByText("Custom!")).toBeDefined();
  });

  it("exposes ref API - getDate and getView", () => {
    const ref = createRef<CalendarRef>();
    render(<Calendar ref={ref} defaultDate={new Date(2026, 1, 11)} />);

    const api = getRef(ref);
    expect(api.getView()).toBe("week");
    expect(api.getDate()).toBeInstanceOf(Date);
  });

  it("exposes ref API - navigateDate", () => {
    const ref = createRef<CalendarRef>();
    const onDateRangeChange = vi.fn();
    render(
      <Calendar
        ref={ref}
        defaultDate={new Date(2026, 1, 11)}
        onDateRangeChange={onDateRangeChange}
      />,
    );

    act(() => {
      getRef(ref).navigateDate("next");
    });

    expect(onDateRangeChange).toHaveBeenCalled();
  });

  it("exposes ref API - setView", () => {
    const ref = createRef<CalendarRef>();
    const onViewChange = vi.fn();
    render(<Calendar ref={ref} onViewChange={onViewChange} />);

    act(() => {
      getRef(ref).setView("day");
    });

    expect(onViewChange).toHaveBeenCalledWith("day");
    expect(getRef(ref).getView()).toBe("day");
  });

  it("exposes ref API - navigateDate with Date object", () => {
    const ref = createRef<CalendarRef>();
    const onDateRangeChange = vi.fn();
    render(
      <Calendar
        ref={ref}
        defaultDate={new Date(2026, 1, 11)}
        onDateRangeChange={onDateRangeChange}
      />,
    );

    act(() => {
      getRef(ref).navigateDate(new Date(2026, 5, 15));
    });

    expect(onDateRangeChange).toHaveBeenCalled();
  });

  it("applies custom style prop", () => {
    render(<Calendar style={{ "--cal-event-default-bg": "#ff0000" } as React.CSSProperties} />);
    const el = screen.getByTestId("pro-calendr-react");
    expect(el.style.getPropertyValue("--cal-event-default-bg")).toBe("#ff0000");
  });

  it("applies custom classNames.root", () => {
    render(<Calendar classNames={{ root: "my-calendar" }} />);
    const el = screen.getByTestId("pro-calendr-react");
    expect(el.className).toContain("my-calendar");
  });

  it("uses custom toolbar slots", () => {
    render(
      <Calendar
        toolbarLeft={<div data-testid="custom-left">Left</div>}
        toolbarRight={<div data-testid="custom-right">Right</div>}
      />,
    );
    expect(screen.getByTestId("custom-left")).toBeDefined();
    expect(screen.getByTestId("custom-right")).toBeDefined();
    // Default DateNavigation should not be rendered
    expect(screen.queryByText("Today")).toBeNull();
  });

  it("uses default toolbar when no custom slots provided", () => {
    render(<Calendar />);
    // Default DateNavigation should be rendered
    expect(screen.getByText("Today")).toBeDefined();
    expect(screen.getByText("Prev")).toBeDefined();
    expect(screen.getByText("Next")).toBeDefined();
  });

  it("respects defaultView prop", () => {
    render(<Calendar defaultView="day" />);
    expect(screen.getByText("day view coming soon")).toBeDefined();
  });

  it("respects firstDay prop", () => {
    // With firstDay=0 (Sunday), the first column header should be Sun
    render(<Calendar defaultDate={new Date(2026, 1, 11)} firstDay={0} />);
    // The week view should be rendered and the first day header should be Sunday
    const headers = screen.getAllByText(/Mon|Tue|Wed|Thu|Fri|Sat|Sun/);
    expect(headers.length).toBe(7);
    // First header should be Sun when firstDay=0
    expect(headers[0].textContent).toContain("Sun");
  });
});
