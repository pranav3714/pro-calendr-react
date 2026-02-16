import { describe, it, expect } from "vitest";
import type { CalendarEvent } from "../../types";
import { buildEventSegments, allocateLanes } from "../lane-allocation";

function makeEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: "1",
    title: "Test",
    start: new Date(2026, 1, 11, 9, 0), // Wed Feb 11
    end: new Date(2026, 1, 11, 10, 0),
    ...overrides,
  };
}

// Week: Mon Feb 9 2026 (weekStart) to Sun Feb 15 2026 (weekEnd)
const weekStart = new Date(2026, 1, 9); // Mon Feb 9
const weekEnd = new Date(2026, 1, 15); // Sun Feb 15

describe("buildEventSegments", () => {
  it("maps a single-day event on Wed to left=2, right=3, span=1", () => {
    const events = [
      makeEvent({
        id: "wed",
        start: new Date(2026, 1, 11, 9, 0),
        end: new Date(2026, 1, 11, 17, 0),
      }),
    ];
    const segments = buildEventSegments(events, weekStart, weekEnd);
    expect(segments).toHaveLength(1);
    expect(segments[0].left).toBe(2);
    expect(segments[0].right).toBe(3);
    expect(segments[0].span).toBe(1);
    expect(segments[0].isStart).toBe(true);
    expect(segments[0].isEnd).toBe(true);
    expect(segments[0].event.id).toBe("wed");
  });

  it("maps a 3-day event Tue-Thu to left=1, right=4, span=3", () => {
    const events = [
      makeEvent({
        id: "tue-thu",
        start: new Date(2026, 1, 10, 9, 0), // Tue
        end: new Date(2026, 1, 12, 17, 0), // Thu
      }),
    ];
    const segments = buildEventSegments(events, weekStart, weekEnd);
    expect(segments).toHaveLength(1);
    expect(segments[0].left).toBe(1);
    expect(segments[0].right).toBe(4);
    expect(segments[0].span).toBe(3);
    expect(segments[0].isStart).toBe(true);
    expect(segments[0].isEnd).toBe(true);
  });

  it("clips an event starting Sat ending next Tue to left=5, right=7, isEnd=false", () => {
    const events = [
      makeEvent({
        id: "sat-next-tue",
        start: new Date(2026, 1, 14, 9, 0), // Sat Feb 14
        end: new Date(2026, 1, 17, 17, 0), // Tue Feb 17 (next week)
      }),
    ];
    const segments = buildEventSegments(events, weekStart, weekEnd);
    expect(segments).toHaveLength(1);
    expect(segments[0].left).toBe(5);
    expect(segments[0].right).toBe(7);
    expect(segments[0].span).toBe(2);
    expect(segments[0].isStart).toBe(true);
    expect(segments[0].isEnd).toBe(false);
  });

  it("clips an event starting prev Thu ending Tue to left=0, right=2, isStart=false", () => {
    const events = [
      makeEvent({
        id: "prev-thu-tue",
        start: new Date(2026, 1, 5, 9, 0), // Thu Feb 5 (prev week)
        end: new Date(2026, 1, 10, 17, 0), // Tue Feb 10
      }),
    ];
    const segments = buildEventSegments(events, weekStart, weekEnd);
    expect(segments).toHaveLength(1);
    expect(segments[0].left).toBe(0);
    expect(segments[0].right).toBe(2);
    expect(segments[0].span).toBe(2);
    expect(segments[0].isStart).toBe(false);
    expect(segments[0].isEnd).toBe(true);
  });

  it("excludes events entirely before the week", () => {
    const events = [
      makeEvent({
        id: "before",
        start: new Date(2026, 1, 5, 9, 0),
        end: new Date(2026, 1, 5, 17, 0),
      }),
    ];
    const segments = buildEventSegments(events, weekStart, weekEnd);
    expect(segments).toHaveLength(0);
  });

  it("excludes events entirely after the week", () => {
    const events = [
      makeEvent({
        id: "after",
        start: new Date(2026, 1, 20, 9, 0),
        end: new Date(2026, 1, 20, 17, 0),
      }),
    ];
    const segments = buildEventSegments(events, weekStart, weekEnd);
    expect(segments).toHaveLength(0);
  });

  it("sorts multi-day/all-day events before single-day events", () => {
    const events = [
      makeEvent({
        id: "single",
        start: new Date(2026, 1, 11, 9, 0),
        end: new Date(2026, 1, 11, 10, 0),
      }),
      makeEvent({
        id: "multi",
        start: new Date(2026, 1, 10, 0, 0),
        end: new Date(2026, 1, 12, 23, 59),
      }),
      makeEvent({
        id: "allday",
        start: new Date(2026, 1, 13, 0, 0),
        end: new Date(2026, 1, 13, 23, 59),
        allDay: true,
      }),
    ];
    const segments = buildEventSegments(events, weekStart, weekEnd);
    expect(segments).toHaveLength(3);
    // Multi-day (span=3) should come first, then all-day (span=1 but allDay), then single-day
    expect(segments[0].event.id).toBe("multi");
    expect(segments[1].event.id).toBe("allday");
    expect(segments[2].event.id).toBe("single");
  });

  it("handles an all-day event spanning the full week", () => {
    const events = [
      makeEvent({
        id: "full-week",
        allDay: true,
        start: new Date(2026, 1, 9, 0, 0),
        end: new Date(2026, 1, 15, 23, 59),
      }),
    ];
    const segments = buildEventSegments(events, weekStart, weekEnd);
    expect(segments).toHaveLength(1);
    expect(segments[0].left).toBe(0);
    expect(segments[0].right).toBe(7);
    expect(segments[0].span).toBe(7);
    expect(segments[0].isStart).toBe(true);
    expect(segments[0].isEnd).toBe(true);
  });
});

describe("allocateLanes", () => {
  it("returns empty lanes and overflow for empty segments", () => {
    const result = allocateLanes([], 3);
    expect(result.lanes).toEqual([]);
    expect(result.overflow).toEqual([]);
  });

  it("places a single segment in lane 0", () => {
    const segments = buildEventSegments(
      [makeEvent({ id: "a", start: new Date(2026, 1, 9, 9, 0), end: new Date(2026, 1, 9, 10, 0) })],
      weekStart,
      weekEnd,
    );
    const result = allocateLanes(segments, 3);
    expect(result.lanes).toHaveLength(1);
    expect(result.lanes[0]).toHaveLength(1);
    expect(result.lanes[0][0].event.id).toBe("a");
    expect(result.overflow).toHaveLength(0);
  });

  it("places two non-overlapping segments (Mon + Thu) in the same lane", () => {
    const segments = buildEventSegments(
      [
        makeEvent({ id: "mon", start: new Date(2026, 1, 9, 9, 0), end: new Date(2026, 1, 9, 10, 0) }),
        makeEvent({ id: "thu", start: new Date(2026, 1, 12, 9, 0), end: new Date(2026, 1, 12, 10, 0) }),
      ],
      weekStart,
      weekEnd,
    );
    const result = allocateLanes(segments, 3);
    expect(result.lanes).toHaveLength(1);
    expect(result.lanes[0]).toHaveLength(2);
    expect(result.overflow).toHaveLength(0);
  });

  it("places two overlapping segments (Mon-Wed + Tue-Thu) in separate lanes", () => {
    const segments = buildEventSegments(
      [
        makeEvent({
          id: "mon-wed",
          start: new Date(2026, 1, 9, 0, 0),
          end: new Date(2026, 1, 11, 23, 59),
        }),
        makeEvent({
          id: "tue-thu",
          start: new Date(2026, 1, 10, 0, 0),
          end: new Date(2026, 1, 12, 23, 59),
        }),
      ],
      weekStart,
      weekEnd,
    );
    const result = allocateLanes(segments, 3);
    expect(result.lanes).toHaveLength(2);
    expect(result.overflow).toHaveLength(0);
  });

  it("overflows when maxLanes exceeded (maxLanes=2 with 3 overlapping)", () => {
    const segments = buildEventSegments(
      [
        makeEvent({
          id: "a",
          start: new Date(2026, 1, 9, 0, 0),
          end: new Date(2026, 1, 11, 23, 59),
        }),
        makeEvent({
          id: "b",
          start: new Date(2026, 1, 9, 0, 0),
          end: new Date(2026, 1, 11, 23, 59),
        }),
        makeEvent({
          id: "c",
          start: new Date(2026, 1, 9, 0, 0),
          end: new Date(2026, 1, 11, 23, 59),
        }),
      ],
      weekStart,
      weekEnd,
    );
    const result = allocateLanes(segments, 2);
    expect(result.lanes).toHaveLength(2);
    expect(result.overflow).toHaveLength(1);
    expect(result.overflow[0].event.id).toBe("c");
  });

  it("places 5 non-overlapping single-day events all in lane 0", () => {
    const segments = buildEventSegments(
      [
        makeEvent({ id: "mon", start: new Date(2026, 1, 9, 9, 0), end: new Date(2026, 1, 9, 10, 0) }),
        makeEvent({ id: "tue", start: new Date(2026, 1, 10, 9, 0), end: new Date(2026, 1, 10, 10, 0) }),
        makeEvent({ id: "wed", start: new Date(2026, 1, 11, 9, 0), end: new Date(2026, 1, 11, 10, 0) }),
        makeEvent({ id: "thu", start: new Date(2026, 1, 12, 9, 0), end: new Date(2026, 1, 12, 10, 0) }),
        makeEvent({ id: "fri", start: new Date(2026, 1, 13, 9, 0), end: new Date(2026, 1, 13, 10, 0) }),
      ],
      weekStart,
      weekEnd,
    );
    const result = allocateLanes(segments, 3);
    expect(result.lanes).toHaveLength(1);
    expect(result.lanes[0]).toHaveLength(5);
    expect(result.overflow).toHaveLength(0);
  });

  it("handles complex mix: 1 spanning event + 3 single-day events with maxLanes=3", () => {
    const segments = buildEventSegments(
      [
        makeEvent({
          id: "spanning",
          start: new Date(2026, 1, 9, 0, 0),
          end: new Date(2026, 1, 13, 23, 59),
          allDay: true,
        }),
        makeEvent({
          id: "tue-1",
          start: new Date(2026, 1, 10, 9, 0),
          end: new Date(2026, 1, 10, 10, 0),
        }),
        makeEvent({
          id: "tue-2",
          start: new Date(2026, 1, 10, 11, 0),
          end: new Date(2026, 1, 10, 12, 0),
        }),
        makeEvent({
          id: "thu-1",
          start: new Date(2026, 1, 12, 9, 0),
          end: new Date(2026, 1, 12, 10, 0),
        }),
      ],
      weekStart,
      weekEnd,
    );
    const result = allocateLanes(segments, 3);
    // Spanning event in lane 0, tue-1 in lane 1, tue-2 in lane 2, thu-1 in lane 1
    expect(result.lanes.length).toBeGreaterThanOrEqual(2);
    expect(result.overflow).toHaveLength(0);
    // Spanning event should be first in lane 0
    expect(result.lanes[0][0].event.id).toBe("spanning");
  });
});
