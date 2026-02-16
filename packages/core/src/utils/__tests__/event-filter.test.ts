import { describe, it, expect } from "vitest";
import { TZDate } from "@date-fns/tz";
import {
  filterEventsInRange,
  groupEventsByDate,
  groupEventsByResource,
  sortEventsByStart,
  getEventsForDay,
  partitionAllDayEvents,
} from "../event-filter";
import type { CalendarEvent } from "../../types";

function makeEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: "1",
    title: "Test",
    start: new Date(2026, 1, 14, 9, 0),
    end: new Date(2026, 1, 14, 10, 0),
    ...overrides,
  };
}

describe("filterEventsInRange", () => {
  const range = {
    start: new Date(2026, 1, 9), // Feb 9
    end: new Date(2026, 1, 15, 23, 59), // Feb 15
  };

  it("includes events fully inside range", () => {
    const events = [
      makeEvent({ start: new Date(2026, 1, 12, 9, 0), end: new Date(2026, 1, 12, 10, 0) }),
    ];
    expect(filterEventsInRange(events, range)).toHaveLength(1);
  });

  it("includes events that overlap the range start", () => {
    const events = [
      makeEvent({ start: new Date(2026, 1, 8, 22, 0), end: new Date(2026, 1, 9, 2, 0) }),
    ];
    expect(filterEventsInRange(events, range)).toHaveLength(1);
  });

  it("includes events that overlap the range end", () => {
    const events = [
      makeEvent({ start: new Date(2026, 1, 15, 22, 0), end: new Date(2026, 1, 16, 2, 0) }),
    ];
    expect(filterEventsInRange(events, range)).toHaveLength(1);
  });

  it("includes events that span the entire range", () => {
    const events = [makeEvent({ start: new Date(2026, 1, 1), end: new Date(2026, 1, 28) })];
    expect(filterEventsInRange(events, range)).toHaveLength(1);
  });

  it("excludes events entirely before range", () => {
    const events = [
      makeEvent({ start: new Date(2026, 1, 7, 9, 0), end: new Date(2026, 1, 7, 10, 0) }),
    ];
    expect(filterEventsInRange(events, range)).toHaveLength(0);
  });

  it("excludes events entirely after range", () => {
    const events = [
      makeEvent({ start: new Date(2026, 1, 20, 9, 0), end: new Date(2026, 1, 20, 10, 0) }),
    ];
    expect(filterEventsInRange(events, range)).toHaveLength(0);
  });

  it("handles ISO string dates", () => {
    const events = [
      makeEvent({ start: "2026-02-12T09:00:00.000Z", end: "2026-02-12T10:00:00.000Z" }),
    ];
    expect(filterEventsInRange(events, range)).toHaveLength(1);
  });

  it("returns empty for empty events array", () => {
    expect(filterEventsInRange([], range)).toHaveLength(0);
  });
});

describe("groupEventsByDate", () => {
  it("groups events by their start date", () => {
    const events = [
      makeEvent({ id: "1", start: new Date(2026, 1, 14, 9, 0), end: new Date(2026, 1, 14, 10, 0) }),
      makeEvent({
        id: "2",
        start: new Date(2026, 1, 14, 11, 0),
        end: new Date(2026, 1, 14, 12, 0),
      }),
      makeEvent({ id: "3", start: new Date(2026, 1, 15, 9, 0), end: new Date(2026, 1, 15, 10, 0) }),
    ];
    const groups = groupEventsByDate(events);
    expect(groups.size).toBe(2);
    expect(groups.get("2026-02-14")).toHaveLength(2);
    expect(groups.get("2026-02-15")).toHaveLength(1);
  });
});

describe("groupEventsByResource", () => {
  it("groups events by resourceIds", () => {
    const events = [
      makeEvent({ id: "1", resourceIds: ["r1"] }),
      makeEvent({ id: "2", resourceIds: ["r1", "r2"] }),
      makeEvent({ id: "3", resourceIds: ["r2"] }),
    ];
    const groups = groupEventsByResource(events);
    expect(groups.get("r1")).toHaveLength(2);
    expect(groups.get("r2")).toHaveLength(2);
  });

  it("groups events without resourceIds under __unassigned", () => {
    const events = [makeEvent({ id: "1" })];
    const groups = groupEventsByResource(events);
    expect(groups.get("__unassigned")).toHaveLength(1);
  });
});

describe("sortEventsByStart", () => {
  it("sorts by start time ascending", () => {
    const events = [
      makeEvent({ id: "2", start: new Date(2026, 1, 14, 11, 0) }),
      makeEvent({ id: "1", start: new Date(2026, 1, 14, 9, 0) }),
      makeEvent({ id: "3", start: new Date(2026, 1, 14, 10, 0) }),
    ];
    const sorted = sortEventsByStart(events);
    expect(sorted.map((e) => e.id)).toEqual(["1", "3", "2"]);
  });

  it("sorts longer events first when same start time", () => {
    const events = [
      makeEvent({
        id: "short",
        start: new Date(2026, 1, 14, 9, 0),
        end: new Date(2026, 1, 14, 10, 0),
      }),
      makeEvent({
        id: "long",
        start: new Date(2026, 1, 14, 9, 0),
        end: new Date(2026, 1, 14, 12, 0),
      }),
    ];
    const sorted = sortEventsByStart(events);
    expect(sorted[0].id).toBe("long");
  });

  it("does not mutate original array", () => {
    const events = [
      makeEvent({ id: "2", start: new Date(2026, 1, 14, 11, 0) }),
      makeEvent({ id: "1", start: new Date(2026, 1, 14, 9, 0) }),
    ];
    const sorted = sortEventsByStart(events);
    expect(sorted).not.toBe(events);
    expect(events[0].id).toBe("2"); // original unchanged
  });
});

describe("getEventsForDay", () => {
  const day = new Date(2026, 1, 14);

  it("includes events on the day", () => {
    const events = [
      makeEvent({ start: new Date(2026, 1, 14, 9, 0), end: new Date(2026, 1, 14, 10, 0) }),
    ];
    expect(getEventsForDay(events, day)).toHaveLength(1);
  });

  it("includes multi-day events spanning the day", () => {
    const events = [
      makeEvent({ start: new Date(2026, 1, 13, 22, 0), end: new Date(2026, 1, 15, 2, 0) }),
    ];
    expect(getEventsForDay(events, day)).toHaveLength(1);
  });

  it("excludes events on other days", () => {
    const events = [
      makeEvent({ start: new Date(2026, 1, 15, 9, 0), end: new Date(2026, 1, 15, 10, 0) }),
    ];
    expect(getEventsForDay(events, day)).toHaveLength(0);
  });
});

describe("partitionAllDayEvents", () => {
  it("separates all-day from timed events", () => {
    const events = [
      makeEvent({ id: "1", allDay: true }),
      makeEvent({ id: "2", allDay: false }),
      makeEvent({ id: "3" }),
    ];
    const { allDay, timed } = partitionAllDayEvents(events);
    expect(allDay).toHaveLength(1);
    expect(allDay[0].id).toBe("1");
    expect(timed).toHaveLength(2);
  });
});

// ─── Timezone-aware event filter tests ──────────────────────────────────────

describe("filterEventsInRange with TZDate", () => {
  it("correctly includes events when using TZDate range boundaries", () => {
    const range = {
      start: new TZDate(2026, 1, 9, 0, 0, 0, "America/New_York"),
      end: new TZDate(2026, 1, 15, 23, 59, 59, "America/New_York"),
    };
    const events = [
      makeEvent({
        start: new TZDate(2026, 1, 12, 9, 0, 0, "America/New_York"),
        end: new TZDate(2026, 1, 12, 10, 0, 0, "America/New_York"),
      }),
    ];
    expect(filterEventsInRange(events, range)).toHaveLength(1);
  });

  it("excludes events outside TZDate range", () => {
    const range = {
      start: new TZDate(2026, 1, 9, 0, 0, 0, "America/New_York"),
      end: new TZDate(2026, 1, 15, 23, 59, 59, "America/New_York"),
    };
    const events = [
      makeEvent({
        start: new TZDate(2026, 1, 20, 9, 0, 0, "America/New_York"),
        end: new TZDate(2026, 1, 20, 10, 0, 0, "America/New_York"),
      }),
    ];
    expect(filterEventsInRange(events, range)).toHaveLength(0);
  });
});

describe("getEventsForDay with TZDate", () => {
  it("includes events on the TZDate day", () => {
    const day = new TZDate(2026, 1, 14, 0, 0, 0, "America/New_York");
    const events = [
      makeEvent({
        start: new TZDate(2026, 1, 14, 9, 0, 0, "America/New_York"),
        end: new TZDate(2026, 1, 14, 10, 0, 0, "America/New_York"),
      }),
    ];
    expect(getEventsForDay(events, day)).toHaveLength(1);
  });

  it("excludes events on other TZDate days", () => {
    const day = new TZDate(2026, 1, 14, 0, 0, 0, "America/New_York");
    const events = [
      makeEvent({
        start: new TZDate(2026, 1, 15, 9, 0, 0, "America/New_York"),
        end: new TZDate(2026, 1, 15, 10, 0, 0, "America/New_York"),
      }),
    ];
    expect(getEventsForDay(events, day)).toHaveLength(0);
  });
});
