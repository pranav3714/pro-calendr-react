# Pitfalls Research

**Domain:** React Calendar Library (FullCalendar replacement)
**Researched:** 2026-02-16
**Confidence:** HIGH (informed by FullCalendar issues, react-big-calendar bugs, and existing codebase analysis)

## Critical Pitfalls

### Pitfall 1: Zustand Store Over-Subscription Causing Cascade Re-Renders

**What goes wrong:**
Components subscribe to the entire Zustand store (or return new objects/arrays from selectors), causing every calendar component to re-render on any state change. During drag operations, `dragState` updates at 60fps via pointer events. If the WeekView, MonthView, TimeSlotColumn, and EventBlock components all re-render on every `dragState` change, the calendar freezes.

**Why it happens:**
The current `useDrag` hook (`hooks/use-drag.ts`) destructures both `dragState` and `setDragState` from a single `useCalendarStore()` call. Any component using `useDrag()` re-renders whenever *any* store field changes, not just drag-related fields. This pattern is already present in the codebase and will compound as more state (selection, hoveredSlot, filteredResourceIds) is added.

**How to avoid:**
- Use atomic selectors: `useCalendarStore((s) => s.dragState)` instead of destructuring. The current `CalendarInner` component does this correctly; `useDrag` does not.
- For selectors returning objects/arrays, use `useShallow` from `zustand/react/shallow` to prevent referential inequality triggers.
- Split high-frequency state (dragState, hoveredSlot) from low-frequency state (currentView, currentDate) using Zustand `subscribeWithSelector` middleware or separate stores entirely.
- Never derive new arrays inside selectors without `useShallow`. Example: `useCalendarStore((s) => s.filteredResourceIds)` is safe (returns the same array ref); `useCalendarStore((s) => s.events.filter(...))` is not.

**Warning signs:**
- React DevTools Profiler shows 100+ component renders per second during drag
- Visible jank or frame drops when moving events
- `useDrag()` or `useSelection()` hooks used in components that do not need drag/selection state

**Phase to address:**
Phase 1 (foundation refactor) -- fix `useDrag` and all custom hooks to use atomic selectors before building DayView, MonthView, or drag-and-drop.

---

### Pitfall 2: Drag-and-Drop State Machine Missing Edge Cases

**What goes wrong:**
The drag system gets stuck in a "dragging" state, leaving ghost elements, corrupted event positions, or unresponsive UI. Known failure modes from FullCalendar and react-big-calendar:
1. User right-clicks during drag (contextmenu event fires, pointer capture lost)
2. User drags to browser chrome / outside viewport (pointerup never fires on the element)
3. Touch-and-hold triggers long-press OS menu on mobile, pointer sequence interrupted
4. Tab switch or window blur during drag (visibilitychange)
5. Drag starts but pointer moves less than 3px (was a click, not a drag) -- FullCalendar's `_def undefined` crash originated here
6. Drop onto scrollbar or time gutter (invalid drop zone but pointerup fires)

**Why it happens:**
Drag is implemented as a simple boolean (`dragState: DragState | null`) without a proper state machine. Transitions between idle/pending/dragging/dropping are implicit, so edge cases fall through.

**How to avoid:**
- Model drag as an explicit finite state machine: `idle -> pending -> dragging -> dropping -> idle`
- `pending` state starts on pointerdown, transitions to `dragging` only after a 3-5px movement threshold (prevents click-vs-drag ambiguity)
- Use `setPointerCapture()` on the dragged element to guarantee `pointerup` fires even when pointer leaves the element
- Listen for `blur`, `visibilitychange`, `contextmenu`, and `Escape` key as cancellation triggers that force-reset to `idle`
- Always clean up drag state in a `finally` block or cleanup function, never rely on the "happy path" alone
- Store `dragState` outside React state for high-frequency updates (use a ref + `requestAnimationFrame` for visual updates, only commit to Zustand on drop)

**Warning signs:**
- Events "snap back" but leave visual artifacts
- Calendar becomes unresponsive after a failed drag attempt
- Mobile users report frozen calendars
- E2E tests pass but manual testing reveals stuck states

**Phase to address:**
Phase 3 (Drag & Drop) -- implement as a state machine from the start. Do not bolt it on as an afterthought.

---

### Pitfall 3: Multi-Day Event Rendering in Month View Causes Layout Explosions

**What goes wrong:**
A 5-day event spanning Monday-Friday must render as a single continuous bar in the MonthView. If the event crosses a week boundary (e.g., Thursday to next Tuesday), it must be split into two visual segments: one ending at the end of the first week row, one starting at the beginning of the next. Calendar libraries that skip this split either:
1. Render the event only in its start-day cell (losing visual continuity)
2. Duplicate the event into every cell it touches (creating 5 separate blocks with no visual connection)
3. Use absolute positioning that breaks when rows have dynamic heights ("+2 more" overflow)

**Why it happens:**
The MonthView grid is fundamentally a 6x7 grid of week-rows. Multi-day events break the cell-per-event assumption. The current `DayCell.tsx` and `WeekRow.tsx` stubs do not account for this -- they will need a spanning event algorithm that is separate from the timed-event position logic in `event-position.ts`.

**How to avoid:**
- Pre-process events before rendering: for each multi-day event, generate "visual segments" clipped to each week row's boundaries
- Allocate "lanes" (rows within the all-day/multi-day section) using a greedy top-to-bottom packing algorithm: sort events by duration (longest first), assign each to the first lane where it fits without overlap
- Set a max visible lanes count (e.g., 3) per day cell, show "+N more" overflow
- Use CSS Grid `grid-column: span N` for spanning events within a single week row -- do not use absolute positioning
- Keep the lane allocation as a pure function in `utils/` so it is testable without rendering

**Warning signs:**
- MonthView "works" for single-day events but breaks visually for multi-day events
- All-day events overlap each other or disappear
- "+N more" popover is deferred and never implemented
- Performance degrades in months with many multi-day events

**Phase to address:**
Phase 2 (MonthView implementation) -- lane allocation algorithm must be built before the MonthView component, not after.

---

### Pitfall 4: Timezone Handling via Local Date Objects Causes Silent Data Corruption

**What goes wrong:**
All date operations use browser-local `new Date()` (as seen in `parseDate` in `date-utils.ts`). When an event is stored as `"2026-02-16T09:00:00Z"` (UTC), `new Date("2026-02-16T09:00:00Z")` yields different local times depending on the user's timezone. A 9am meeting in UTC renders at 4am in EST. Worse: when a user drags that event to 10am, the system saves the time as 10am local, not 10am in the event's original timezone. This is the exact "FULLCALENDAR SEEMS TO DO VERY WONKY THINGS HERE" bug from the project context.

DST transitions cause additional failures:
- Events at 2:30am on spring-forward day do not exist
- Events at 1:30am on fall-back day exist twice
- `addDays(date, 1)` can return a date 23 or 25 hours later across DST boundaries

**Why it happens:**
JavaScript's `Date` object is always in the system timezone. Calendar libraries typically defer timezone handling and then bolt it on late, creating inconsistencies between display, editing, and persistence.

**How to avoid:**
- Adopt a timezone-aware strategy from the start using `date-fns` v4's `TZDate` from `@date-fns/tz` (761 bytes)
- Store a `timeZone` prop on the `<Calendar>` component (IANA string, e.g., `"America/New_York"`)
- All internal date math must use `TZDate` with the calendar's timezone context, not bare `new Date()`
- `parseDate` must accept timezone context: `new TZDate(isoString, timeZone)` instead of `new Date(isoString)`
- Test with DST boundary dates: March 8 2026 (US spring forward), November 1 2026 (US fall back)
- Never use `getHours()`, `setHours()`, `getMinutes()` on bare Date objects for position calculations -- these return local time

**Warning signs:**
- Events render at wrong times for users in different timezones than the server
- Dragging an event changes its time by an offset amount (the timezone difference)
- Events "jump" by 1 hour on specific dates (DST boundaries)
- Tests pass on CI but fail locally (different CI timezone)

**Phase to address:**
Phase 1 (foundation) -- retrofit `date-utils.ts` to accept timezone context before building more views. Every view built on top of broken timezone handling must be rewritten.

---

### Pitfall 5: Event Collision/Overlap Algorithm That Does Not Handle Transitive Groups

**What goes wrong:**
Events A and B overlap. Events B and C overlap. A and C do not overlap. A naive pairwise comparison gives A and B each 50% width, and B and C each 50% width. But A, B, and C are in the same transitive collision group and should all be 33% width. Without transitive grouping, B is rendered at 50% width but its left position conflicts with A or C.

This is the single most common layout bug in calendar libraries. Google Calendar handles it correctly; most open-source implementations do not.

**Why it happens:**
The current `collision.ts` is a stub (`TODO: interval overlap algorithm`). Developers typically implement simple O(n^2) pairwise comparisons that detect direct overlaps but miss transitive chains. The algorithm also needs to handle "columns within groups" -- events in the same group may not all overlap with each other, so they can share columns.

**How to avoid:**
1. Sort events by start time, then by end time (descending for ties)
2. Build collision groups using a sweep-line or union-find algorithm: if event B overlaps with any event already in group G, B joins G
3. Within each group, assign columns greedily: place each event in the first column where it does not overlap with existing events in that column
4. The width of each event = container width / max columns used in the group
5. Left offset = column index * event width
6. Implement this as a pure function returning `{ event, column, totalColumns }[]` -- no DOM dependency
7. Test with the A-B-C transitive case, the "staircase" pattern (4+ events overlapping in a chain), and zero-duration events

**Warning signs:**
- Events visually overlap (rendered on top of each other) in week/day view
- Short events (15 min) are too narrow when next to long events
- Layout changes when unrelated events are added to the same day

**Phase to address:**
Phase 2 (DayView, which shares the time-grid with WeekView) -- collision algorithm must be implemented and tested before any view that shows timed events side-by-side.

---

### Pitfall 6: Virtualization Breaks Scroll Position, Drag Targets, and Keyboard Navigation

**What goes wrong:**
Virtualizing resource rows in TimelineView means only visible rows exist in the DOM. This breaks:
1. **Drag-and-drop:** User drags an event to a resource row that is not in the DOM. The drop target does not exist, so the drop fails silently or snaps back.
2. **Scroll position:** Virtualizer calculates total height from estimated row heights. If rows have dynamic heights (collapsed groups, events stacking), scroll position drifts over time ("jittery scrolling").
3. **Keyboard navigation:** Arrow-down from the last visible row should scroll to reveal the next row. Without coordination between keyboard handler and virtualizer, focus is lost.
4. **Search/filter:** "Jump to resource" must scroll the virtualizer to the target row. Scrolling to a non-rendered row requires knowing its pixel offset without rendering it.

**Why it happens:**
Virtualization is treated as a rendering optimization that can be added transparently. In reality, it changes the contract of the entire component: elements that "exist" in data may not exist in the DOM, breaking any code that assumes DOM presence.

**How to avoid:**
- Use `@tanstack/react-virtual`'s `scrollToIndex()` for programmatic scrolling (search, keyboard nav, drag auto-scroll)
- For drag targets: maintain a "virtual drop zone" map that maps pixel coordinates to resource IDs without requiring DOM elements. Use the virtualizer's `measureElement` to calculate row offsets.
- For keyboard navigation: integrate with the virtualizer so that moving focus past the last visible row calls `scrollToIndex(nextIndex)` before attempting to focus
- Measure dynamic row heights with `measureElement` callback; avoid `estimateSize` drift by using a reasonable default (48px) and updating after measurement
- Test with 500+ resources: scroll to bottom, drag an event, verify drop works on the correct resource

**Warning signs:**
- Scroll position "jumps" after expanding/collapsing a resource group
- Drag-and-drop works for visible resources but fails for off-screen resources
- Keyboard navigation gets "stuck" at the edge of the visible area
- `scrollToResource()` API scrolls to the wrong position

**Phase to address:**
Phase 5 (Virtualization) -- but the architecture for virtual drop zones and keyboard coordination must be planned in Phase 3 (Drag & Drop) and Phase 4 (Keyboard Navigation).

---

### Pitfall 7: CSS Custom Properties Without Fallback Chains Break Consumer Overrides

**What goes wrong:**
The current styles use CSS custom properties (`--cal-border`, `--cal-event-default-bg`, etc.) inline in JSX. If a consumer sets `--cal-border` but the library later adds a new property `--cal-border-light` that was not documented, the consumer's calendar has inconsistent borders. Worse: if a consumer uses Tailwind's `dark:` modifier but the library uses `.dark` parent class, dark mode breaks.

FullCalendar's "25+ !important overrides" problem stems from exactly this: the library's CSS specificity is too high, and custom properties are not designed as a coherent theming API.

**Why it happens:**
CSS custom properties are added ad-hoc as components need them, without a centralized design token system. Different contributors add different variable names. Specificity creeps up as bug fixes add more specific selectors.

**How to avoid:**
- Define ALL custom properties in a single `styles/tokens.css` file with a clear naming convention: `--cal-{category}-{property}` (e.g., `--cal-surface-bg`, `--cal-border-default`, `--cal-text-primary`)
- Every property must have a fallback: `var(--cal-border-default, #e5e7eb)`
- Use a flat specificity model: all component styles are single-class selectors (`.pro-calendr-react-event`) -- no nesting, no element selectors, no IDs
- Dark mode via `[data-theme="dark"]` on the calendar root, not `.dark` on an arbitrary parent
- Document the complete list of custom properties in a theme reference
- Never use `!important` in the library CSS

**Warning signs:**
- Consumer reports "I set the variable but nothing changed"
- Dark mode partially works (some elements dark, some light)
- Specificity wars in bug fixes (adding `.pro-calendr-react > .pro-calendr-react-body > .pro-calendr-react-event` to override a style)
- CSS custom property count exceeds 50 without documentation

**Phase to address:**
Phase 1 (foundation) -- establish the token system before building more components that introduce ad-hoc variables.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Inline styles in JSX (current pattern in WeekView, TimeSlotColumn) | Fast iteration, no CSS file management | Cannot be overridden by consumers, no dark mode support, duplicated values, poor performance at scale (style recalculation) | Never for shipping; acceptable during prototyping only |
| `new Date(isoString)` for timezone handling | Works in single-timezone dev environment | Silent data corruption in production with mixed timezones; requires rewrite of every view | Never -- use TZDate from day one |
| Passing entire `config` object through context | Simple prop threading | Every consumer of `useCalendarConfig()` re-renders on any config change (events array, callbacks, everything) | MVP only; split into stable config (slotDuration, views) and volatile data (events) context |
| Computing event positions during render | No need for pre-computation step | Recalculated on every re-render even when events have not changed; blocks main thread with 1000+ events | MVP with < 100 events; must memoize or move to worker for production |
| Single global Zustand store | Simple state access from anywhere | Multiple `<Calendar>` instances on the same page share state; breaks when dashboards embed two calendars | Until multi-instance support is needed; then use store-per-instance via context |

## Integration Gotchas

Common mistakes when connecting to external services and consuming the library.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Consumer event arrays | Passing a new array reference on every render (`events={data.filter(...)}`) causing full calendar re-render | Document that consumers should `useMemo` their event arrays; internally, compare events by ID/hash not reference |
| Consumer callbacks | Passing inline arrow functions as `onEventDrop`, `onEventClick` causing child re-renders | Use `useCallback` for all handler props internally; document this requirement for consumers |
| SSR / Next.js | Calendar renders with system timezone on server, client timezone on hydration, causing hydration mismatch | Use `suppressHydrationWarning` on time-displaying elements; defer timezone-dependent rendering to client with `useEffect` |
| React StrictMode | Double-mount triggers store initialization twice, scroll position resets, drag state inconsistencies (known FullCalendar issue #192) | Ensure all `useEffect` cleanup functions properly reset state; test with StrictMode enabled in development |
| External drag sources | Using HTML5 Drag API (`draggable` attribute) which does not work on touch and cannot be styled during drag | Use Pointer Events for all drag interactions; accept external events via a drop zone API, not HTML5 drag |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Re-filtering events on every render (current `getEventsForDay` in WeekView calls `events.filter()` per day, per render) | Increasing lag as event count grows; 7 filter passes * N events per render | Pre-compute an event-by-date index (`Map<dateKey, CalendarEvent[]>`) once when events change, pass indexed results to day columns | 200+ events visible in a week |
| Creating new Date objects in render path (`typeof e.start === "string" ? new Date(e.start) : e.start` in WeekView line 77-79) | GC pressure, inconsistent references, breaks `React.memo` | Normalize all event dates once on input (in CalendarProvider), store as Date objects internally | 500+ events with frequent re-renders |
| CSS Grid `repeat(N, 1fr)` with many columns in TimelineView | Browser layout engine recalculates all column widths on any change; timeline-year with 365 columns causes multi-second layout | Use fixed-width columns with horizontal scroll; only render columns in viewport via virtualization | 30+ columns (timeline-month, timeline-year) |
| `toISOString()` as React key (current pattern in WeekView day iteration) | String allocation on every render; not stable across timezone changes | Use date index or formatted date string as key; compute once and cache | Not a scaling issue but a correctness issue across timezones |
| Registering pointer event listeners on every event element | N event listeners for N visible events; mousemove handlers fire on all of them during drag | Use event delegation: single listener on the grid container, determine target event via `data-event-id` attribute on closest ancestor | 100+ visible events |

## UX Pitfalls

Common user experience mistakes in calendar domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Click-vs-drag ambiguity: pointerdown starts drag immediately | Users cannot click events to view details; every click starts a drag animation | Require 3-5px movement threshold before initiating drag; use `pending` state in drag state machine |
| No visual feedback during drag | User does not know if event will land in a valid slot, or what the new time will be | Show a semi-transparent "preview" element at the snap-to grid position; display the target time in a tooltip |
| Auto-scroll only at edges of calendar, not viewport | When calendar is embedded in a scrollable page, dragging to the edge of the calendar does not scroll the page | Implement auto-scroll that detects both calendar container edges AND viewport edges |
| Keyboard navigation without visible focus indicator | Screen reader users and keyboard-only users cannot tell which cell is focused | Use a visible focus ring (2px solid outline) on the focused cell; follow WCAG 2.4.7 |
| Context menu replaces browser context menu globally | Users lose access to "Copy", "Paste", "Inspect Element" | Only intercept right-click on events and time slots; allow default context menu on empty calendar areas |
| "+N more" overflow in MonthView not clickable | Users see there are more events but cannot access them | "+N more" must open a popover or expand the cell to show all events |
| Time slot selection with no visual feedback | User clicks and drags to select a time range but nothing visible happens until mouseup | Show a highlighted selection range in real-time during drag, with start/end times displayed |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **WeekView:** Often missing multi-day timed events that span midnight (event starts at 10pm, ends at 2am next day) -- verify events crossing midnight render in both day columns
- [ ] **MonthView:** Often missing week-spanning event continuity -- verify a 10-day event renders as connected bars across two week rows
- [ ] **DayView:** Often missing collision layout for overlapping events -- verify three overlapping 1-hour events each render at 33% width
- [ ] **TimelineView:** Often missing synchronized scroll between resource sidebar and time grid -- verify horizontal scroll of time grid does not desync from sidebar, and vertical scroll of sidebar does not desync from grid
- [ ] **Drag & Drop:** Often missing edge-of-container auto-scroll -- verify dragging to bottom of week view scrolls the time grid down
- [ ] **Drag & Drop:** Often missing cross-resource drag in timeline -- verify an event dragged from Resource A to Resource B updates resourceIds
- [ ] **Keyboard Navigation:** Often missing focus trap within calendar -- verify Tab from last element wraps to first, Escape closes popover/context menu
- [ ] **Selection:** Often missing multi-day selection in MonthView -- verify clicking Monday and dragging to Wednesday selects 3 days
- [ ] **Timezone:** Often missing DST boundary handling -- verify events at 2:30am on spring-forward day render correctly (or show error)
- [ ] **Accessibility:** Often missing ARIA live regions for view changes -- verify screen readers announce "Now showing March 2026" when navigating
- [ ] **All-day events:** Often missing proper ordering -- verify events are sorted by duration (longest first) so short events do not push long events to a new row

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Zustand over-subscription (cascade re-renders) | LOW | Refactor hooks to use atomic selectors; add `useShallow` where needed; no API changes required |
| Drag state machine missing (stuck states) | MEDIUM | Replace boolean drag state with explicit state machine; requires touching all drag-related components but no API changes |
| Multi-day event layout (MonthView) | HIGH | Requires building lane allocation algorithm from scratch; may require rethinking MonthView data flow entirely |
| Timezone handling (local Date objects) | HIGH | Must retrofit `TZDate` throughout `date-utils.ts`, all views, all position calculations, and all tests. Every `new Date()` is a potential bug site. |
| Collision algorithm (transitive groups) | MEDIUM | Replace stub in `collision.ts` with proper sweep-line algorithm; views only need to consume the output differently |
| Virtualization breaking interactions | HIGH | Requires architectural changes to drag, keyboard, and scroll systems to be virtualization-aware; cannot be added after the fact without significant refactoring |
| CSS specificity / theming | MEDIUM | Audit all styles, extract to token system, flatten specificity; time-consuming but mechanical work |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Zustand over-subscription | Phase 1 (Foundation) | React DevTools Profiler: no component re-renders > 2x during idle; < 16ms render time during drag |
| Drag state machine | Phase 3 (Drag & Drop) | Test matrix: pointerup outside viewport, right-click during drag, tab switch, Escape key, touch-and-hold -- all must return to idle state |
| Multi-day event layout | Phase 2 (MonthView) | Visual test: 14-day event spanning 3 week rows renders as 3 connected segments with correct lane allocation |
| Timezone handling | Phase 1 (Foundation) | Test suite runs in UTC, EST, and PST (set `TZ` env var); event at "2026-03-08T02:30:00-05:00" renders correctly on DST boundary day |
| Collision algorithm | Phase 2 (DayView/WeekView) | Test: 5 events in transitive chain all render at 20% width; "staircase" pattern of 4 events uses correct column assignment |
| Virtualization interactions | Phase 5 (Virtualization) | Test with 500 resources: drag event from row 1 to row 450, keyboard-navigate from row 1 to row 500, search jumps to row 300 |
| CSS theming | Phase 1 (Foundation) | Consumer test: set 5 custom properties, verify all affected elements update; dark mode toggle test |
| Event array reference instability | Phase 1 (Foundation) | Performance test: parent re-renders 100x with same events data; calendar body renders only once |
| Single global store | Phase 6+ (Multi-instance) | Render two `<Calendar>` components on same page; navigating one does not affect the other |
| SSR hydration mismatch | Phase 6+ (SSR Support) | Next.js app with calendar: no hydration warnings in console; first paint matches server render |

## Sources

- [FullCalendar React re-rendering issues (Issue #57)](https://github.com/fullcalendar/fullcalendar-react/issues/57)
- [FullCalendar eventRender re-rendering on every change (Issue #32)](https://github.com/fullcalendar/fullcalendar-react/issues/32)
- [FullCalendar resource timeline performance (Issue #5673)](https://github.com/fullcalendar/fullcalendar/issues/5673)
- [FullCalendar resource timeline virtual rendering request (Issue #7322)](https://github.com/fullcalendar/fullcalendar/issues/7322)
- [FullCalendar scroll synchronization issues (Issue #4889, #4890)](https://github.com/fullcalendar/fullcalendar/issues/4889)
- [FullCalendar StrictMode scroll bug (Issue #192)](https://github.com/fullcalendar/fullcalendar-react/issues/192)
- [FullCalendar state issues root cause (Issue #7066)](https://github.com/fullcalendar/fullcalendar/issues/7066)
- [react-big-calendar drag stuck in drag state (Issue #1902)](https://github.com/jquense/react-big-calendar/issues/1902)
- [react-big-calendar all-day drag/drop failure (Issue #2601)](https://github.com/jquense/react-big-calendar/issues/2601)
- [react-big-calendar auto-scroll during drag (PR #2230)](https://github.com/jquense/react-big-calendar/pull/2230)
- [react-big-calendar touch screen drag bug (PR #1066)](https://github.com/jquense/react-big-calendar/pull/1066)
- [react-big-calendar horizontal scroll during drag (Issue #2465)](https://github.com/jquense/react-big-calendar/issues/2465)
- [react-big-calendar concurrent events overlap (Issue #1397)](https://github.com/jquense/react-big-calendar/issues/1397)
- [Zustand re-render prevention with useShallow](https://zustand.docs.pmnd.rs/guides/prevent-rerenders-with-use-shallow)
- [Zustand unexpected re-renders (Discussion #2642)](https://github.com/pmndrs/zustand/discussions/2642)
- [TkDodo: Working with Zustand -- selector best practices](https://tkdodo.eu/blog/working-with-zustand)
- [date-fns DST issues (Issue #1788, #1682, #1657)](https://github.com/date-fns/date-fns/issues/1788)
- [date-fns-tz DST offset bug (Issue #227)](https://github.com/marnusw/date-fns-tz/issues/227)
- [date-fns v4 TZDate announcement](https://blog.date-fns.org/v40-with-time-zone-support/)
- [TanStack Virtual documentation](https://tanstack.com/virtual/latest)
- [Calendar event overlap algorithm (Saturn Cloud)](https://saturncloud.io/blog/visualization-of-calendar-events-algorithm-to-layout-events-with-maximum-width/)
- [CSS Grid calendar layout (Snook.ca)](https://snook.ca/archives/html_and_css/calendar-css-grid)
- [React Aria Calendar accessibility](https://react-spectrum.adobe.com/react-aria/Calendar.html)
- [Pointer Events drag-and-drop in React](https://medium.com/@leonardobrunolima/react-tips-drag-and-drop-using-point-events-2ba33cf7653e)
- [High-performance input handling (Nolan Lawson)](https://nolanlawson.com/2019/08/11/high-performance-input-handling-on-the-web/)
- Project context: FullCalendar known issues from Aviatize migration notes

---
*Pitfalls research for: React Calendar Library (@pro-calendr-react/core)*
*Researched: 2026-02-16*
