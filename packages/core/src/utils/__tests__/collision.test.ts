import { describe, it, expect } from "vitest";
import { layoutCollisions } from "../collision";
import type { CollisionResult } from "../collision";
import type { CalendarEvent } from "../../types";

// Use fixed dates: 2026-02-09 is a Monday
function makeEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: "1",
    title: "Test",
    start: new Date(2026, 1, 9, 9, 0),
    end: new Date(2026, 1, 9, 10, 0),
    ...overrides,
  };
}

/** Helper to find the result for a specific event by ID */
function findResult(results: CollisionResult[], id: string): CollisionResult {
  const result = results.find((r) => r.event.id === id);
  if (!result) throw new Error(`No result found for event id="${id}"`);
  return result;
}

describe("layoutCollisions", () => {
  it("returns empty array for empty input", () => {
    const results = layoutCollisions([]);
    expect(results).toEqual([]);
  });

  it("assigns single event to column 0 with totalColumns 1", () => {
    const event = makeEvent({ id: "a" });
    const results = layoutCollisions([event]);

    expect(results).toHaveLength(1);
    expect(results[0].event).toBe(event);
    expect(results[0].column).toBe(0);
    expect(results[0].totalColumns).toBe(1);
  });

  it("assigns non-overlapping events each to column 0 with totalColumns 1", () => {
    const eventA = makeEvent({
      id: "a",
      start: new Date(2026, 1, 9, 9, 0),
      end: new Date(2026, 1, 9, 10, 0),
    });
    const eventB = makeEvent({
      id: "b",
      start: new Date(2026, 1, 9, 11, 0),
      end: new Date(2026, 1, 9, 12, 0),
    });
    const results = layoutCollisions([eventA, eventB]);

    expect(results).toHaveLength(2);
    const a = findResult(results, "a");
    const b = findResult(results, "b");
    expect(a.column).toBe(0);
    expect(a.totalColumns).toBe(1);
    expect(b.column).toBe(0);
    expect(b.totalColumns).toBe(1);
  });

  it("assigns two overlapping events to different columns", () => {
    const eventA = makeEvent({
      id: "a",
      start: new Date(2026, 1, 9, 9, 0),
      end: new Date(2026, 1, 9, 10, 30),
    });
    const eventB = makeEvent({
      id: "b",
      start: new Date(2026, 1, 9, 10, 0),
      end: new Date(2026, 1, 9, 11, 0),
    });
    const results = layoutCollisions([eventA, eventB]);

    expect(results).toHaveLength(2);
    const a = findResult(results, "a");
    const b = findResult(results, "b");
    expect(a.column).toBe(0);
    expect(b.column).toBe(1);
    expect(a.totalColumns).toBe(2);
    expect(b.totalColumns).toBe(2);
  });

  it("handles transitive overlap: A-B overlap, B-C overlap, A-C do not", () => {
    // A: 9:00-10:00, B: 9:30-10:30, C: 10:15-11:00
    // A overlaps B (9:30-10:00), B overlaps C (10:15-10:30), A does NOT overlap C
    const eventA = makeEvent({
      id: "a",
      start: new Date(2026, 1, 9, 9, 0),
      end: new Date(2026, 1, 9, 10, 0),
    });
    const eventB = makeEvent({
      id: "b",
      start: new Date(2026, 1, 9, 9, 30),
      end: new Date(2026, 1, 9, 10, 30),
    });
    const eventC = makeEvent({
      id: "c",
      start: new Date(2026, 1, 9, 10, 15),
      end: new Date(2026, 1, 9, 11, 0),
    });
    const results = layoutCollisions([eventA, eventB, eventC]);

    expect(results).toHaveLength(3);
    const a = findResult(results, "a");
    const b = findResult(results, "b");
    const c = findResult(results, "c");

    // All three in the same transitive group
    expect(a.totalColumns).toBe(2);
    expect(b.totalColumns).toBe(2);
    expect(c.totalColumns).toBe(2);

    // A and C don't overlap, so C can reuse A's column
    expect(a.column).toBe(0);
    expect(b.column).toBe(1);
    expect(c.column).toBe(0); // reuses column 0 since A ended before C started
  });

  it("handles multiple independent collision groups", () => {
    // Group 1: overlapping 9:00-10:30 and 10:00-11:00
    const eventA = makeEvent({
      id: "a",
      start: new Date(2026, 1, 9, 9, 0),
      end: new Date(2026, 1, 9, 10, 30),
    });
    const eventB = makeEvent({
      id: "b",
      start: new Date(2026, 1, 9, 10, 0),
      end: new Date(2026, 1, 9, 11, 0),
    });
    // Group 2: overlapping 14:00-15:30, 14:30-15:00, 15:00-16:00
    const eventC = makeEvent({
      id: "c",
      start: new Date(2026, 1, 9, 14, 0),
      end: new Date(2026, 1, 9, 15, 30),
    });
    const eventD = makeEvent({
      id: "d",
      start: new Date(2026, 1, 9, 14, 30),
      end: new Date(2026, 1, 9, 15, 0),
    });
    const eventE = makeEvent({
      id: "e",
      start: new Date(2026, 1, 9, 15, 0),
      end: new Date(2026, 1, 9, 16, 0),
    });

    const results = layoutCollisions([eventA, eventB, eventC, eventD, eventE]);

    // Group 1 has 2 columns
    const a = findResult(results, "a");
    const b = findResult(results, "b");
    expect(a.totalColumns).toBe(2);
    expect(b.totalColumns).toBe(2);

    // Group 2 has 2 columns (C overlaps D, C overlaps E transitively; D doesn't overlap E)
    const c = findResult(results, "c");
    const d = findResult(results, "d");
    const e = findResult(results, "e");
    expect(c.totalColumns).toBe(2);
    expect(d.totalColumns).toBe(2);
    expect(e.totalColumns).toBe(2);
  });

  it("sorts by start time ascending, then duration descending", () => {
    // Shorter event starts at same time as longer event
    const longEvent = makeEvent({
      id: "long",
      start: new Date(2026, 1, 9, 9, 0),
      end: new Date(2026, 1, 9, 12, 0),
    });
    const shortEvent = makeEvent({
      id: "short",
      start: new Date(2026, 1, 9, 9, 0),
      end: new Date(2026, 1, 9, 10, 0),
    });

    // Pass short first to verify sorting puts long first
    const results = layoutCollisions([shortEvent, longEvent]);

    const long = findResult(results, "long");
    const short = findResult(results, "short");
    // Longer event should get column 0
    expect(long.column).toBe(0);
    expect(short.column).toBe(1);
  });

  it("handles events with zero duration", () => {
    const event = makeEvent({
      id: "zero",
      start: new Date(2026, 1, 9, 9, 0),
      end: new Date(2026, 1, 9, 9, 0), // same start and end
    });
    const results = layoutCollisions([event]);

    expect(results).toHaveLength(1);
    expect(results[0].column).toBe(0);
    expect(results[0].totalColumns).toBe(1);
  });

  it("handles three fully overlapping events", () => {
    const eventA = makeEvent({
      id: "a",
      start: new Date(2026, 1, 9, 9, 0),
      end: new Date(2026, 1, 9, 10, 0),
    });
    const eventB = makeEvent({
      id: "b",
      start: new Date(2026, 1, 9, 9, 0),
      end: new Date(2026, 1, 9, 10, 0),
    });
    const eventC = makeEvent({
      id: "c",
      start: new Date(2026, 1, 9, 9, 0),
      end: new Date(2026, 1, 9, 10, 0),
    });

    const results = layoutCollisions([eventA, eventB, eventC]);

    expect(results).toHaveLength(3);
    const a = findResult(results, "a");
    const b = findResult(results, "b");
    const c = findResult(results, "c");

    // All in same group with 3 columns
    expect(a.totalColumns).toBe(3);
    expect(b.totalColumns).toBe(3);
    expect(c.totalColumns).toBe(3);

    // Each in a different column
    const columns = new Set([a.column, b.column, c.column]);
    expect(columns.size).toBe(3);
    expect(columns).toContain(0);
    expect(columns).toContain(1);
    expect(columns).toContain(2);
  });

  it("handles events that touch at boundaries (end === start) as non-overlapping", () => {
    const eventA = makeEvent({
      id: "a",
      start: new Date(2026, 1, 9, 9, 0),
      end: new Date(2026, 1, 9, 10, 0),
    });
    const eventB = makeEvent({
      id: "b",
      start: new Date(2026, 1, 9, 10, 0), // starts exactly when A ends
      end: new Date(2026, 1, 9, 11, 0),
    });

    const results = layoutCollisions([eventA, eventB]);

    const a = findResult(results, "a");
    const b = findResult(results, "b");

    // They don't overlap (strict < comparison), so separate groups
    expect(a.column).toBe(0);
    expect(a.totalColumns).toBe(1);
    expect(b.column).toBe(0);
    expect(b.totalColumns).toBe(1);
  });

  it("handles string date inputs", () => {
    const eventA = makeEvent({
      id: "a",
      start: "2026-02-09T09:00:00",
      end: "2026-02-09T10:30:00",
    });
    const eventB = makeEvent({
      id: "b",
      start: "2026-02-09T10:00:00",
      end: "2026-02-09T11:00:00",
    });

    const results = layoutCollisions([eventA, eventB]);

    const a = findResult(results, "a");
    const b = findResult(results, "b");
    expect(a.column).toBe(0);
    expect(b.column).toBe(1);
    expect(a.totalColumns).toBe(2);
    expect(b.totalColumns).toBe(2);
  });

  it("does not mutate the input events array", () => {
    const events = [
      makeEvent({
        id: "b",
        start: new Date(2026, 1, 9, 10, 0),
        end: new Date(2026, 1, 9, 11, 0),
      }),
      makeEvent({
        id: "a",
        start: new Date(2026, 1, 9, 9, 0),
        end: new Date(2026, 1, 9, 10, 0),
      }),
    ];
    const originalOrder = events.map((e) => e.id);
    layoutCollisions(events);
    expect(events.map((e) => e.id)).toEqual(originalOrder);
  });
});
