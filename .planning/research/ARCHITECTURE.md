# Architecture Research

**Domain:** High-performance React calendar library with resource/timeline views
**Researched:** 2026-02-16
**Confidence:** HIGH (based on codebase analysis + verified ecosystem patterns)

## System Overview

### Current Architecture (Established)

```
+-----------------------------------------------------------------+
|                      Consumer Application                        |
|  <Calendar events={...} resources={...} onEventDrop={...} />    |
+-----------------------------------------------------------------+
         |                                          |
         v                                          v
+------------------+                    +---------------------+
|  CalendarProvider |                    |   CalendarInner     |
|  (React Context)  |                    |   (Toolbar + Body)  |
|  - events[]       |                    |   - imperative ref  |
|  - config props   |                    |   - callback bridge |
|  - render slots   |                    +---------------------+
|  - callbacks      |                              |
+------------------+                              v
         |                              +---------------------+
         |                              |    CalendarBody     |
         v                              |    (View Router)    |
+------------------+                    |    switch(view) {}  |
|  Zustand Store   |                    +---------------------+
|  (Mutable State)  |                              |
|  - currentView    |              +-------+-------+-------+-------+
|  - currentDate    |              v       v       v       v       v
|  - dateRange      |           Week    Day    Month   List   Timeline
|  - selection      |           View    View   View    View   View
|  - dragState      |
|  - hoveredSlot    |
|  - filteredIds    |
+------------------+
```

### Target Architecture (What to Build Toward)

```
+-----------------------------------------------------------------+
|                      Consumer Application                        |
+-----------------------------------------------------------------+
         |
         v
+------------------+     +-----------------------------------------+
|  CalendarProvider |     |          Plugin Registry                 |
|  (React Context)  |---->|  - timelineBands                        |
|  immutable config |     |  - resourceDecorator                    |
|  events, resources|     |  - contextMenuItems                     |
|  render slots     |     |  - validateDrop                         |
|  callbacks        |     |  - toolbarWidgets                       |
+------------------+     +-----------------------------------------+
         |
         v
+------------------------------------------------------------------+
|                    Zustand Store (Sliced)                          |
|                                                                    |
|  +-------------+  +-------------+  +-----------+  +------------+  |
|  | Navigation  |  | Interaction |  | Resource  |  |  UI State  |  |
|  | Slice       |  | Slice       |  | Slice     |  |  Slice     |  |
|  | - view      |  | - selection |  | - filtered|  | - sidebar  |  |
|  | - date      |  | - dragState |  | - collapsed|  | - zoom    |  |
|  | - dateRange |  | - multiSel  |  | - search  |  | - compact |  |
|  | - firstDay  |  | - hovered   |  |           |  | - preview |  |
|  +-------------+  +-------------+  +-----------+  +------------+  |
|                                                                    |
+------------------------------------------------------------------+
         |
         v
+------------------------------------------------------------------+
|                      CalendarBody (View Router)                    |
+------------------------------------------------------------------+
    |            |           |          |             |
    v            v           v          v             v
+--------+  +--------+  +--------+  +--------+  +----------+
| WeekV. |  | DayV.  |  | MonthV.|  | ListV. |  | Timeline |
+--------+  +--------+  +--------+  +--------+  +----------+
    |            |           |          |             |
    |            |           |          |        +----+----+
    |            |           |          |        |         |
    v            v           v          v        v         v
+------------------------------------------------------------------+
|                    Shared Subsystems                                |
|                                                                    |
|  +------------------+  +------------------+  +-----------------+  |
|  | Drag Engine      |  | Selection Engine |  | Keyboard Nav    |  |
|  | (pointer events) |  | (pointer events) |  | (focus mgmt)    |  |
|  | snap-to-grid     |  | time-range sel.  |  | arrow keys      |  |
|  | cross-view       |  | resource-aware   |  | shortcuts       |  |
|  +------------------+  +------------------+  +-----------------+  |
|                                                                    |
|  +------------------+  +------------------+  +-----------------+  |
|  | Virtualization   |  | Collision Layout |  | Theming Engine  |  |
|  | (@tanstack/virt) |  | column packing   |  | CSS vars + cls  |  |
|  | row + col axes   |  | overlap resolve  |  | dark mode       |  |
|  +------------------+  +------------------+  +-----------------+  |
|                                                                    |
+------------------------------------------------------------------+
         |
         v
+------------------------------------------------------------------+
|                    Pure Utilities (No React)                       |
|  date-utils | event-filter | event-position | slot | snap | grid  |
|  collision  | conflict     |                                       |
+------------------------------------------------------------------+
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| `Calendar` | Top-level API, ref forwarding, prop merging | CalendarProvider, CalendarInner |
| `CalendarProvider` | Holds immutable config in React Context, syncs defaults to store | Store (write on mount), Context (provide) |
| `CalendarBody` | Routes `currentView` to the correct view component, bridges config to view props | Store (read view), Context (read config), Views |
| `WeekView` / `DayView` | Vertical time grid with day columns, event positioning | event-position utils, EventBlock, TimeSlotColumn |
| `MonthView` | 6-row grid of day cells, overflow indicators | WeekRow, DayCell, EventBlock |
| `ListView` | Chronological flat list of events grouped by date | event-filter utils |
| `TimelineView` | Horizontal time axis with resource rows | ResourceSidebar, TimeGrid, EventLane, virtualization |
| `ResourceSidebar` | Left panel showing resource names/groups, collapsible groups | Store (resource slice), Context (resources) |
| `EventBlock` | Single event rendering, density adaptation, click/drag handles | Drag engine, selection engine, density hook |
| `DragLayer` | Ghost overlay during drag operations | Store (dragState), pointer events |
| `SelectionOverlay` | Blue highlight during time-range selection | Store (selection) |
| `Zustand Store` | All mutable state: navigation, interaction, UI | All components via selectors |
| `Plugin Registry` | Aggregates plugin contributions, provides to views | Context, store |

## Recommended Project Structure

The existing structure is sound. Recommendations for additions:

```
packages/core/src/
  components/           # Shared components
    Calendar.tsx          # Top-level API
    CalendarProvider.tsx   # Context provider
    CalendarBody.tsx       # View router
    CalendarContext.tsx     # Context definition
    EventBlock.tsx         # Event rendering
    DragLayer.tsx          # Drag ghost overlay
    SelectionOverlay.tsx   # Selection highlight
    Skeleton.tsx           # Loading state
  views/
    week/                 # WeekView + sub-components
    day/                  # DayView (shares TimeSlotColumn with week)
    month/                # MonthView + DayCell + WeekRow
    list/                 # ListView
    timeline/             # TimelineView + ResourceSidebar + TimeGrid + EventLane
  hooks/
    use-calendar.ts        # Composite hook (config + store)
    use-calendar-events.ts # Event filtering/grouping
    use-date-navigation.ts # Date nav actions
    use-drag.ts            # Drag lifecycle (NEW: pointer event engine)
    use-resize.ts          # NEW: event resize via pointer events
    use-selection.ts       # Time-range selection
    use-keyboard.ts        # NEW: keyboard navigation + shortcuts
    use-virtualization.ts  # NEW: TanStack Virtual wrapper
    use-density.ts         # Event density breakpoints
    use-resources.ts       # NEW: resource filtering/grouping
    use-context-menu.ts    # NEW: right-click menu positioning
    use-multi-select.ts    # NEW: Ctrl/Shift + click selection
  store/
    calendar-store.ts      # Combined store with slices
    slices/                # NEW: organized by concern
      navigation-slice.ts   # view, date, dateRange, firstDay
      interaction-slice.ts  # selection, dragState, hoveredSlot, multiSelect
      resource-slice.ts     # filteredResourceIds, collapsedGroups, resourceSearch
      ui-slice.ts           # sidebarWidth, zoomLevel, previewPanel, compactMode
  types/                  # TypeScript types split by domain
  utils/                  # Pure functions (no React imports)
  plugins/                # Plugin factory
  headless/               # Hooks + store re-exports
  toolbar/                # Toolbar components
  styles/                 # CSS custom properties
  constants/              # Defaults, keyboard keys
```

### Structure Rationale

- **`store/slices/`:** The current single-file store will not scale to handle navigation + interaction + resources + UI state. Slices keep each concern testable and prevent the store file from exceeding 200+ lines. Use Zustand's slices pattern (spread into single `create()` call) so middleware applies once at the top level.
- **`hooks/use-resize.ts` (new):** Event resize is mechanically similar to drag but semantically different (changes duration, not position). Separating keeps each hook focused.
- **`hooks/use-resources.ts` (new):** Resource filtering, grouping by `groupId`, collapse state management. Used by TimelineView and ResourceSidebar.
- **Views share sub-components:** DayView should reuse WeekView's `TimeSlotColumn` and `EventBlock`. Do not duplicate. Import from `../../components/` or from `../week/` (same build entry since both are "views").

## Architectural Patterns

### Pattern 1: Zustand Store Slicing with Fine-Grained Selectors

**What:** Split the monolithic store into domain slices (navigation, interaction, resource, UI) composed into a single store. Every component subscribes via atomic selectors that return primitives or use `useShallow` for object returns.

**When to use:** Always. This is the foundation for preventing re-render cascades.

**Trade-offs:** Slightly more boilerplate (slice types, combine function) but dramatically reduces coupling between unrelated state domains. A drag operation updating `dragState` will not re-render components that only subscribe to `currentView`.

**Example:**
```typescript
// store/slices/navigation-slice.ts
import type { StateCreator } from "zustand";
import type { CalendarStore } from "../calendar-store";

export interface NavigationSlice {
  currentView: CalendarViewType;
  currentDate: Date;
  dateRange: { start: Date; end: Date };
  firstDay: number;
  setView: (view: CalendarViewType) => void;
  setDate: (date: Date) => void;
  navigateDate: (direction: "prev" | "next" | "today") => void;
}

export const createNavigationSlice: StateCreator<
  CalendarStore,
  [],
  [],
  NavigationSlice
> = (set, get) => ({
  currentView: "week",
  currentDate: new Date(),
  dateRange: { start: new Date(), end: new Date() },
  firstDay: 1,
  setView: (view) => {
    const { currentDate, firstDay } = get();
    const dateRange = getDateRange(currentDate, view, firstDay);
    set({ currentView: view, dateRange });
  },
  // ...
});

// store/calendar-store.ts
export type CalendarStore = NavigationSlice &
  InteractionSlice &
  ResourceSlice &
  UISlice;

export const useCalendarStore = create<CalendarStore>()((...a) => ({
  ...createNavigationSlice(...a),
  ...createInteractionSlice(...a),
  ...createResourceSlice(...a),
  ...createUISlice(...a),
}));

// Component usage — atomic selectors
const currentView = useCalendarStore((s) => s.currentView);
const setView = useCalendarStore((s) => s.setView);

// When you need multiple values — useShallow
import { useShallow } from "zustand/react/shallow";
const { selection, dragState } = useCalendarStore(
  useShallow((s) => ({ selection: s.selection, dragState: s.dragState }))
);
```

### Pattern 2: Pointer-Events-Based Drag Engine

**What:** Build drag and drop using native pointer events (pointerdown, pointermove, pointerup) instead of HTML5 Drag and Drop API or react-dnd. Use `setPointerCapture` to lock pointer to the initiating element.

**When to use:** For all drag operations: event move, event resize, time-range selection, external drag-in.

**Trade-offs:** More implementation work than using react-dnd, but eliminates a dependency, works identically on touch and mouse, avoids HTML5 DnD's quirks (ghost images, drop zone registration), and gives full control over the visual feedback. Critical for a library that must work on tablets.

**Example:**
```typescript
// hooks/use-drag.ts
export function useDrag(options: DragOptions) {
  const originRef = useRef<DragOrigin | null>(null);
  const rafRef = useRef<number>(0);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return; // left click only
    e.currentTarget.setPointerCapture(e.pointerId);

    originRef.current = {
      eventId: options.eventId,
      startX: e.clientX,
      startY: e.clientY,
      pointerId: e.pointerId,
    };
  }, [options.eventId]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!originRef.current) return;

    // Throttle via rAF — max 60fps updates
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const snapped = snapToGrid(e.clientY, options.slotHeight);
      const newDate = pixelToTime(snapped, options.slotMinTime, options.slotDuration);
      store.setState({ dragState: { /* ... */ } });
    });
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    cancelAnimationFrame(rafRef.current);
    // Commit drag — call onEventDrop
    originRef.current = null;
    store.setState({ dragState: null });
  }, []);

  return { handlePointerDown, handlePointerMove, handlePointerUp };
}
```

**Key detail:** Use `requestAnimationFrame` to throttle store updates during drag. Without this, pointermove fires at 120Hz+ on modern displays, causing excessive re-renders. Only the DragLayer component should subscribe to `dragState`; other components should be shielded from these high-frequency updates.

### Pattern 3: Dual-Axis Virtualization for Timeline

**What:** Use `@tanstack/react-virtual` with two virtualizer instances (vertical for resource rows, horizontal for time columns) sharing a single scroll container. Only DOM nodes for visible resources and time slots are rendered.

**When to use:** TimelineView when `resources.length > ~30` or time range spans > 1 week at hourly granularity.

**Trade-offs:** Adds complexity to the scroll container setup (position: relative container, absolutely-positioned virtual items). Events must be filtered per-resource per-visible-time-range, not globally. But enables smooth 60fps scrolling with 100+ resources and 1000+ events.

**Example:**
```typescript
// views/timeline/TimelineView.tsx
import { useVirtualizer } from "@tanstack/react-virtual";

function TimelineView({ resources, events, dateRange }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: resources.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  const colVirtualizer = useVirtualizer({
    horizontal: true,
    count: timeSlotCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => SLOT_WIDTH,
    overscan: 3,
  });

  return (
    <div className="timeline-container" style={{ display: "flex" }}>
      {/* Fixed resource sidebar (not virtualized horizontally) */}
      <ResourceSidebar
        virtualRows={rowVirtualizer.getVirtualItems()}
        resources={resources}
        totalHeight={rowVirtualizer.getTotalSize()}
      />
      {/* Scrollable time grid (virtualized both axes) */}
      <div ref={scrollRef} style={{ overflow: "auto", flex: 1 }}>
        <div style={{
          height: rowVirtualizer.getTotalSize(),
          width: colVirtualizer.getTotalSize(),
          position: "relative",
        }}>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => (
            <EventLane
              key={resources[virtualRow.index].id}
              resource={resources[virtualRow.index]}
              events={eventsByResource.get(resources[virtualRow.index].id)}
              virtualRow={virtualRow}
              virtualCols={colVirtualizer.getVirtualItems()}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Pattern 4: Collision Layout Algorithm (Column Packing)

**What:** A sweep-line algorithm that groups overlapping events into collision groups, assigns each event a column index and total column count, then calculates horizontal position as `left = columnIndex / totalColumns` and `width = 1 / totalColumns`.

**When to use:** WeekView and DayView for timed events that overlap. The existing `EventStack` placeholder should implement this.

**Trade-offs:** O(n log n) sort + O(n) sweep is efficient. The visual output matches Google Calendar / Outlook behavior where overlapping events share horizontal space equally within their collision group.

**Example:**
```typescript
// utils/collision.ts
export interface LayoutedEvent {
  event: CalendarEvent;
  column: number;
  totalColumns: number;
}

export function layoutEvents(events: CalendarEvent[]): LayoutedEvent[] {
  const sorted = [...events].sort((a, b) =>
    parseDate(a.start).getTime() - parseDate(b.start).getTime()
  );

  const columns: CalendarEvent[][] = [];
  const result: LayoutedEvent[] = [];

  for (const event of sorted) {
    const eventStart = parseDate(event.start);
    // Find first column where event doesn't overlap the last event
    let placed = false;
    for (let col = 0; col < columns.length; col++) {
      const lastInCol = columns[col][columns[col].length - 1];
      if (parseDate(lastInCol.end) <= eventStart) {
        columns[col].push(event);
        placed = true;
        break;
      }
    }
    if (!placed) {
      columns.push([event]);
    }
  }

  // Assign column index + total to each event
  const totalColumns = columns.length;
  for (let col = 0; col < columns.length; col++) {
    for (const event of columns[col]) {
      result.push({ event, column: col, totalColumns });
    }
  }

  return result;
}
```

**Refinement needed:** The basic algorithm above gives all events in a group the same width. Google Calendar uses a more sophisticated approach where events only share width with the events they actually overlap, not the entire group. This is a phase 2 enhancement -- start with uniform column widths.

### Pattern 5: Keyboard Navigation via Roving Tabindex

**What:** Use the roving tabindex pattern where only one interactive element within the calendar grid has `tabIndex={0}` at a time. Arrow keys move focus between time slots, days, and events. The focused element is tracked in state, and `tabIndex` is derived per-cell.

**When to use:** For all views. Required for WCAG 2.2 AA compliance.

**Trade-offs:** Must coordinate with drag and selection systems (Escape cancels drag, Enter confirms selection). Need to manage focus across view transitions (when switching from week to month, focused date should remain focused in new view).

**Example:**
```typescript
// hooks/use-keyboard.ts
export function useKeyboardNavigation(config: KeyboardConfig) {
  const focusedCell = useCalendarStore((s) => s.focusedCell);
  const setFocusedCell = useCalendarStore((s) => s.setFocusedCell);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          setFocusedCell(moveFocus(focusedCell, "right"));
          break;
        case "ArrowLeft":
          e.preventDefault();
          setFocusedCell(moveFocus(focusedCell, "left"));
          break;
        case "ArrowDown":
          e.preventDefault();
          setFocusedCell(moveFocus(focusedCell, "down"));
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedCell(moveFocus(focusedCell, "up"));
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          activateCell(focusedCell);
          break;
        case "Escape":
          cancelActiveInteraction();
          break;
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [focusedCell]);
}
```

## Data Flow

### Primary Data Flow

```
Consumer Props (events[], resources[], callbacks)
    |
    v
CalendarProvider
    |-- writes config to React Context (immutable per render)
    |-- syncs defaultView/defaultDate to Zustand store (mount only)
    |
    v
CalendarBody reads:
    |-- Context: events, config, render slots, callbacks
    |-- Store: currentView, dateRange
    |
    v
View Component (e.g., WeekView) receives merged props:
    |-- events (from context, filtered by dateRange)
    |-- dateRange (from store)
    |-- config (slotDuration, etc. from context)
    |
    v
Pure Utils compute:
    |-- event-filter: which events are visible
    |-- event-position: pixel coordinates for each event
    |-- collision: overlap layout columns
    |
    v
Sub-components render:
    |-- TimeSlotColumn / DayCell / EventLane
    |-- EventBlock (each event)
```

### Interaction Data Flow (Drag Example)

```
User pointerdown on EventBlock
    |
    v
useDrag hook captures pointer
    |-- stores origin in ref (no re-render)
    |-- sets dragState in Zustand store
    |
    v
User pointermove
    |-- rAF-throttled update to store.dragState.current
    |-- ONLY DragLayer re-renders (ghost position)
    |-- drop target cells check via bounding-box overlap
    |
    v
User pointerup
    |-- snap final position to grid
    |-- validate drop (plugin system + consumer validateDrop)
    |
    v
If valid:
    |-- Call consumer's onEventDrop({ event, oldStart, newStart, revert })
    |-- Clear dragState
    |
If invalid:
    |-- Animate revert
    |-- Clear dragState
```

### Resource Data Flow

```
Consumer provides:
    resources: CalendarResource[]
    resourceGroups?: CalendarResourceGroup[]
    |
    v
CalendarProvider stores in Context
    |
    v
TimelineView:
    |-- groups resources by groupId
    |-- sorts by group.order, then resource.order
    |-- applies filteredResourceIds from store
    |-- applies collapsedGroups from store
    |
    v
ResourceSidebar renders:
    |-- group headers (collapsible)
    |-- resource labels (customizable via resourceLabel render slot)
    |
    v
EventLane per resource:
    |-- filters events by resourceIds.includes(resource.id)
    |-- positions events horizontally by time
    |-- handles drag-to-resource (changing resourceIds on drop)
```

### Key Data Flow Rules

1. **Props flow down through Context, never through the store.** Events, resources, callbacks, and render slots are in CalendarContext because they come from the consumer and change by reference on every parent render. Putting them in Zustand would cause stale closure issues.
2. **Mutable internal state flows through Zustand store.** View, date, selection, drag, focus -- these are internal and need to be accessed from anywhere in the tree without prop drilling.
3. **Pure utilities have zero React imports.** All computation (date math, event filtering, collision layout, position calculation) is in `utils/` as pure functions. This makes them independently testable and usable from the headless entry point.
4. **Views never import from other views.** Each view is a separate build entry point. Shared sub-components live in `components/`. Exception: DayView may import `TimeSlotColumn` from `../week/` since they share the same `views/*` entry boundary (verify tsup config).

## Anti-Patterns

### Anti-Pattern 1: Subscribing to Entire Store

**What people do:** `const store = useCalendarStore()` or `const { currentView, dragState, selection, ... } = useCalendarStore()`
**Why it's wrong:** Component re-renders on ANY store change. During a drag operation, `dragState` updates at 60fps, causing every subscribed component to re-render 60 times/second.
**Do this instead:** Atomic selectors: `const currentView = useCalendarStore(s => s.currentView)`. For multiple values, use `useShallow`: `useCalendarStore(useShallow(s => ({ a: s.a, b: s.b })))`.

### Anti-Pattern 2: Putting Events in the Store

**What people do:** Store `events[]` in Zustand so any component can access them.
**Why it's wrong:** Events come from consumer props and change by reference every render. Zustand would need constant syncing, and stale closures in callbacks would reference old event arrays.
**Do this instead:** Keep events in React Context (CalendarProvider). Components access via `useCalendarConfig().events`. This follows React's natural prop-flow model.

### Anti-Pattern 3: Synchronous Store Updates During Drag

**What people do:** Call `store.setState({ dragState: ... })` directly in every pointermove handler.
**Why it's wrong:** On a 120Hz display, this fires 120 times/second. Each setState triggers a React re-render cycle. Even with atomic selectors, the DragLayer component renders 120 times/second.
**Do this instead:** Throttle via `requestAnimationFrame`. Store the "pending" position in a ref, and only commit to Zustand store inside the rAF callback. This caps at 60fps and batches updates.

### Anti-Pattern 4: View-to-View Imports

**What people do:** Import `TimeSlotColumn` from `views/week/` inside `views/day/DayView.tsx`.
**Why it's wrong:** tsup builds each view as a separate entry point. Cross-view imports create circular dependencies or force both views into the same bundle, defeating tree-shaking.
**Do this instead:** Extract shared components to `components/` (e.g., `components/TimeSlotColumn.tsx`). Both WeekView and DayView import from `../../components/`. If the component is truly view-specific, duplicate it.

### Anti-Pattern 5: Monolithic Event Processing

**What people do:** Filter, sort, group, and layout events in a single pass inside the view component.
**Why it's wrong:** Can't memoize intermediate results. When only `dateRange` changes, you redo collision layout even though event data hasn't changed.
**Do this instead:** Chain memoized steps: `filterEventsInRange` (memoized on events + dateRange) -> `groupEventsByDate` (memoized on filtered result) -> `layoutEvents` per day (memoized on day's events). The existing `useCalendarEvents` hook already does steps 1-2 correctly.

## Scaling Considerations

Context is "events rendered" not "users" since this is a client-side library.

| Concern | 50 events | 500 events | 5000+ events |
|---------|-----------|------------|--------------|
| Event filtering | Direct iteration, no optimization needed | `useMemo` on filter result (already done) | Pre-index events by date bucket in a Map; filter by date key lookup O(1) instead of O(n) |
| Collision layout | Run on every render, negligible cost | Memoize per-day layout results | Same memoization; algorithm is O(n log n) per day which stays fast |
| DOM nodes | All rendered | All rendered; ~500 DOM nodes is fine | Virtualize event list per column/lane; only render events in viewport |
| Timeline resources | Not applicable | Render all rows | Virtualize rows with TanStack Virtual; only render visible resource lanes |
| Timeline time axis | Not applicable | Render all columns | Virtualize columns; overscan 3-5 slots for smooth scrolling |
| Drag performance | No concern | No concern | rAF throttling essential; use refs for intermediate state, only commit final position to store |
| Month view cells | 42 cells always | 42 cells; events per cell may overflow | "+N more" overflow indicator already planned; cap rendered events per cell at 3-4 |

### Scaling Priorities

1. **First bottleneck (most likely): Timeline with many resources.** At 100+ resources, rendering all rows causes jank during scroll. Solution: row virtualization with `@tanstack/react-virtual`. This is the highest-priority performance feature.
2. **Second bottleneck: Drag on high-refresh-rate displays.** At 120Hz+, unthrottled pointer event handlers cause excessive renders. Solution: rAF throttling + ref-based intermediate state.
3. **Third bottleneck: Large event datasets in week/day view.** At 500+ visible events, collision layout and DOM node count matter. Solution: memoize layout results; consider virtualizing events within each day column if count exceeds ~100 per day (rare in practice).

## Integration Points

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Context <-> Store | Provider writes defaults on mount; components read both independently | Never sync continuously -- Context is source of truth for consumer data, Store for internal state |
| View <-> Shared Hooks | Views call hooks (useDrag, useSelection, useKeyboard) for behavior | Hooks return event handlers; views attach to DOM elements |
| View <-> Pure Utils | Views call utils for computation (event-position, collision, slot) | Utils are pure functions, no side effects, no React imports |
| Store <-> Plugins | Plugin `validateDrop` is called from drag engine; plugin `contextMenuItems` called from context menu hook | Plugins are passive -- they provide functions, not state. They don't subscribe to store |
| Views <-> EventBlock | Views render EventBlock with position props; EventBlock handles its own click/drag/density | EventBlock is the leaf interaction node -- it initiates drags and handles clicks |

### Consumer Integration Points

| Integration | Pattern | Notes |
|-------------|---------|-------|
| Events data | `events` prop on `<Calendar>` | Consumer owns event data; library is read-only. Mutations happen via callbacks (onEventDrop, onEventResize) and consumer updates their own state |
| Resources data | `resources` + `resourceGroups` props | Same pattern: consumer-owned data, library renders it |
| Callbacks | `onEventDrop`, `onEventResize`, `onSelect`, etc. | Library calls with info object including `revert()` function. Consumer can call revert to undo |
| Render slots | `eventContent`, `resourceLabel`, `toolbarLeft`, etc. | Consumer provides render functions; library calls them with props objects. Null = default rendering |
| Plugins | `plugins` prop, array of `CalendarPlugin` | Additive only. Plugins extend (timeline bands, context menu items), never override core behavior |
| Theming | CSS custom properties `--cal-*` OR `classNames` prop | Two paths: CSS vars for simple theming, className overrides for full control. Both work simultaneously |
| Imperative API | `CalendarRef` via `React.forwardRef` | For programmatic control: `ref.current.navigateDate("next")`, `ref.current.scrollToResource("r1")` |

## Build Order Implications

Dependencies between architectural components dictate implementation order:

```
1. Store Slicing (foundation — everything depends on fine-grained selectors)
   |
   +-- 2a. Collision Layout (EventStack needs this before views look correct)
   |
   +-- 2b. DayView (reuses WeekView patterns, trivial once shared components extracted)
   |
   +-- 2c. MonthView (independent; different layout model)
   |
   +-- 2d. ListView (simplest view; just filtered/grouped event list)
   |
   +-- 3a. Drag Engine (pointer events + snap + rAF throttle)
   |       |
   |       +-- 3b. Event Resize (same engine, different semantics)
   |       |
   |       +-- 4a. Drop Validation (plugin integration)
   |
   +-- 3c. Selection Engine (pointer events for time-range selection)
   |
   +-- 3d. Keyboard Navigation (roving tabindex + shortcuts)
   |
   +-- 5a. Resource System (types exist; need grouping, filtering, collapse state)
   |       |
   |       +-- 5b. TimelineView (depends on resource system + virtualization)
   |               |
   |               +-- 5c. Drag-to-Resource (cross-resource drag in timeline)
   |
   +-- 5d. Virtualization (TanStack Virtual wrapper; primarily for timeline)
   |
   +-- 6a. Theming Layer (CSS vars already exist; need classNames integration)
   |
   +-- 6b. Context Menu System
   |
   +-- 6c. Multi-Select (Ctrl/Shift click, batch actions)
   |
   +-- 7. Plugin System Enhancement (current createPlugin is pass-through; need registry)
```

**Key dependency chains:**
- Timeline requires Resource System + Virtualization
- Drag-to-Resource requires Drag Engine + Resource System
- All views benefit from Store Slicing (do first)
- Collision Layout unlocks visual correctness for week/day views

## Sources

- Zustand Slices Pattern: [Zustand Official Docs](https://zustand.docs.pmnd.rs/guides/slices-pattern) -- HIGH confidence
- Zustand useShallow: [Zustand Official Docs](https://zustand.docs.pmnd.rs/hooks/use-shallow) -- HIGH confidence
- Zustand Fine-Grained Selectors: [DeepWiki pmndrs/zustand](https://deepwiki.com/pmndrs/zustand/2.3-selectors-and-re-rendering) -- MEDIUM confidence
- Zustand Multiple Stores Discussion: [GitHub Discussion #2496](https://github.com/pmndrs/zustand/discussions/2496) -- MEDIUM confidence
- TanStack Virtual Grid: [TanStack Virtual Docs](https://tanstack.com/virtual/latest/docs/introduction) -- HIGH confidence
- TanStack Virtual Performance: [Medium - TanStack Virtual Optimizes 1000s of Items](https://medium.com/@sanjivchaudhary416/from-lag-to-lightning-how-tanstack-virtual-optimizes-1000s-of-items-smoothly-24f0998dc444) -- MEDIUM confidence
- Pointer Events Drag: [Medium - Drag and Drop Using Pointer Events](https://medium.com/@aswathyraj/how-i-built-drag-and-drop-in-react-without-libraries-using-pointer-events-a0f96843edb7) -- MEDIUM confidence
- FullCalendar Architecture: [FullCalendar Timeline View Docs](https://fullcalendar.io/docs/timeline-view) -- HIGH confidence
- react-big-calendar DnD Architecture: [GitHub jquense/react-big-calendar](https://github.com/jquense/react-big-calendar/tree/master/src/addons/dragAndDrop) -- MEDIUM confidence
- Calendar Collision Layout: [GitHub react-big-calendar Issue #1530](https://github.com/jquense/react-big-calendar/issues/1530) -- MEDIUM confidence
- WAI-ARIA Calendar Patterns: [React Aria Calendar Docs](https://react-spectrum.adobe.com/react-aria/Calendar.html) -- HIGH confidence
- CSS Custom Properties Theming: [CSS-Tricks Dark Mode](https://css-tricks.com/easy-dark-mode-and-multiple-color-themes-in-react/) -- MEDIUM confidence
- Codebase analysis: direct reading of all source files in `packages/core/src/` -- HIGH confidence

---
*Architecture research for: @pro-calendr-react/core calendar library*
*Researched: 2026-02-16*
