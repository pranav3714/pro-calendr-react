# Codebase Concerns

**Analysis Date:** 2025-02-16

## Tech Debt

**Core Algorithm Stubs:**

- Issue: Four critical utility functions are exported but not implemented
- Files: `packages/core/src/utils/collision.ts`, `packages/core/src/utils/conflict.ts`
- Impact: Features depend on these algorithms but receive empty arrays:
  - `detectCollisions()` returns `[]` — blocks timeline event column layout (Milestone 3.3)
  - `detectConflicts()` returns `[]` — blocks conflict detection UI (Milestone 5.3)
  - These are exported and shipped in the public API, creating false expectations
- Fix approach: Implement `detectCollisions()` with interval overlap detection (Milestone 3.3), implement `detectConflicts()` with O(n log n) sort+sweep (Milestone 5.3)

**Hook Placeholders with No Implementation:**

- Issue: Three hooks are exported and importable but non-functional
- Files: `packages/core/src/hooks/use-keyboard.ts`, `packages/core/src/hooks/use-virtualization.ts`
- Impact:
  - `useKeyboard()` has empty `useEffect` (line 5-6) — keyboard shortcuts do not work
  - `useVirtualization()` returns hardcoded empty state — timeline rows/columns cannot virtualize, causing performance degradation with 500+ resources
  - No tests for these hooks; errors won't be caught until integration testing
- Fix approach: Implement `useKeyboard()` with event listener wiring (Milestone 6.2), implement `useVirtualization()` as thin wrapper around @tanstack/react-virtual (Milestone 5.1)

**Stub View Components:**

- Issue: Four complete view types are scaffolded but not implemented
- Files: `packages/core/src/views/day/DayView.tsx`, `packages/core/src/views/month/MonthView.tsx`, `packages/core/src/views/list/ListView.tsx`, `packages/core/src/views/timeline/TimelineView.tsx`
- Impact: Consumers cannot use day, month, list, or timeline views; CalendarBody only renders WeekView (line 40-41 in CalendarBody.tsx)
- Fix approach: Implement each view in order (Milestones 2.1-2.3 for standard views, Milestone 3.2 for timeline)

**Stub Interaction Components:**

- Issue: Five interaction layer components are stubs returning null
- Files: `packages/core/src/components/DragLayer.tsx`, `packages/core/src/components/DragGhost.tsx`, `packages/core/src/components/DropIndicator.tsx`, `packages/core/src/components/SelectionOverlay.tsx`, `packages/core/src/components/ContextMenu.tsx`
- Impact: Drag-drop, selection, and context menus do not work despite being in the type contract (CalendarProps)
- Fix approach: Implement in sequence (Milestones 4.1-4.2 for drag/select, Milestone 6.3 for context menu)

**Incomplete CalendarRef API:**

- Issue: CalendarRef exposes three unimplemented methods
- File: `packages/core/src/components/Calendar.tsx` (lines 82-90)
- Impact: Consumers calling `ref.zoomToFit()`, `ref.scrollToTime()`, `ref.scrollToResource()` get silent no-ops
- Fix approach: `zoomToFit()` (Milestone 7.3), `scrollToTime()` (Milestone 5), `scrollToResource()` (Milestone 3)

---

## Coverage Gaps

**Stub Functions Have Zero Test Coverage:**

- What's not tested: `detectCollisions()`, `detectConflicts()`, `DragLayer`, `DragGhost`, `DropIndicator`, `SelectionOverlay`, `ContextMenu`, `useKeyboard()`, `useVirtualization()`, `DayView`, `MonthView`, `ListView`, `TimelineView`, and timeline-related components (EventLane, TimeGrid, TimeHeader, ResourceSidebar, BusinessHoursOverlay)
- Files: All files listed above
- Current coverage: 65.95% functions (below 80% threshold) due to these stubs
- Risk: Large swaths of surface area ship with no test coverage; refactoring or fixes will break unknown behavior
- Priority: HIGH — Block any release until coverage threshold is met

**Hook Tests Missing:**

- What's not tested: `useCalendarEvents()` is implemented but not tested independently (only through WeekView integration tests)
- File: `packages/core/src/hooks/use-calendar-events.ts`
- Risk: Event filtering/grouping logic could regress silently
- Priority: MEDIUM — Add dedicated hook unit tests

**Event Positioning Edge Cases Unclear:**

- What's not tested: Multi-day events, all-day overlaps, timezone conversions, events outside visible range
- Files: `packages/core/src/utils/event-position.ts`, `packages/core/src/utils/event-filter.ts`
- Risk: Edge cases in date/time math could cause misaligned or missing events in week/day views
- Priority: MEDIUM — Add edge case test suite after all views are implemented

---

## Fragile Areas

**Store + Context Split (Potential Sync Issues):**

- Files: `packages/core/src/store/calendar-store.ts`, `packages/core/src/components/CalendarContext.tsx`, `packages/core/src/components/CalendarProvider.tsx`
- Why fragile: CalendarContext holds config props (events, slots, callbacks); Zustand store holds view state (currentDate, selection, dragState). If CalendarProvider syncs props to store incorrectly, views will see stale data
- Safe modification: Always verify CalendarProvider line 91 — it syncs firstDay on prop change via exhaustive-deps disable (line 95). Ensure all view-affecting props are tracked
- Test coverage: Calendar integration tests (24 tests) cover this, but consider adding explicit prop-sync tests

**Event Position Calculation Assumes Linear Slot Layout:**

- File: `packages/core/src/utils/event-position.ts` (calculateEventPosition, calculateTimelinePosition)
- Why fragile: Uses simple arithmetic (event.start - slotMinTime, event.duration / slotDuration) without validating:
  - Event start/end are valid dates
  - Start < End
  - Times are within slot bounds
  - Daylight saving time transitions
- Safe modification: Add defensive checks before calculation; consider timezone-aware positioning for DST dates
- Test coverage: 11 event-position tests, but no DST or boundary tests

**CalendarBody View Routing Is Incomplete:**

- File: `packages/core/src/components/CalendarBody.tsx` (lines 38-45)
- Why fragile: Switch statement only handles "week", default returns null. When day/month/list views are implemented, must update this switch
- Safe modification: Add a test that verifies all CalendarViewType values are handled (currently day, month, list, timeline-\* types are missing)
- Risk: Consumers setting `defaultView="month"` get blank calendar with no error message

**Event Click Type Bridge Assumes Certain Event Shape:**

- File: `packages/core/src/components/CalendarBody.tsx` (lines 12-19)
- Why fragile: Bridges `(event, nativeEvent)` to `EventClickInfo` by accessing `nativeEvent.nativeEvent`. If React changes event wrapping, this breaks silently
- Safe modification: Add runtime check: `if (!(nativeEvent instanceof React.SyntheticEvent)) throw new Error(...)`
- Test coverage: Calendar tests check onEventClick callback fires, but not the bridge logic

---

## Performance Concerns

**EventBlock Not Memoized:**

- File: `packages/core/src/components/EventBlock.tsx`
- Problem: EventBlock is called per event in WeekView/TimeSlotColumn but not wrapped in React.memo. Parent re-renders → all events re-render
- Impact: With 200 events, every state change in the calendar (selection, drag) rerenders all EventBlocks, even if their props haven't changed
- Current performance: Week view render is <150ms target, but this will degrade significantly with more events
- Improvement path: Wrap with React.memo(EventBlock, (prev, next) => { compare event.id, isSelected, isDragging, style }). Add benchmark test

**No Memoization on useCalendarEvents Results:**

- File: `packages/core/src/hooks/use-calendar-events.ts`
- Problem: While hook uses useMemo internally, CalendarBody doesn't memoize the viewProps object passed to views
- Impact: View re-renders on every parent change, even if viewProps are identical
- Improvement path: useMemo(viewProps, [events, dateRange, ...]) in CalendarBody

**Zustand Store Selectors Not Optimized:**

- File: `packages/core/src/store/calendar-store.ts`, `packages/core/src/store/selectors.ts`
- Problem: Components using `useCalendarStore((s) => s.currentDate)` subscribe to entire store; any state change triggers re-subscription
- Impact: EventBlock selection → dragState changes → all subscribers re-render, even those only listening to currentDate
- Current issue: selectors.ts exists but is unused (zero test coverage)
- Improvement path: Use Zustand selectors in all store subscriptions to prevent unnecessary re-renders

**No Lazy Loading or Code Splitting:**

- File: `packages/core/src/index.ts` exports all views/components eagerly
- Problem: Consumers importing the main entry point get entire bundle even if they only use week view
- Impact: Bundle contains stub code for month/day/list/timeline views (4 unimplemented views = ~5-10KB unused gzipped)
- Current bundle: Unknown, no size tracking in CI
- Improvement path: Ensure tsup multi-entry build works correctly; consumers should import `@pro-calendr-react/core/views/week` not main export

---

## Security Considerations

**No Sanitization of Event Colors/Attributes:**

- File: `packages/core/src/components/EventBlock.tsx` (lines 50-52)
- Risk: backgroundColor, textColor, borderColor from event object are injected directly into inline style without validation. Could allow XSS via CSS injection
- Current mitigation: TypeScript event.backgroundColor is typed as string (implicit), not URL | SafeColor
- Recommendations:
  - Validate colors are hex/rgb/hsl/named colors only, reject URLs and calc()
  - Consider using CSS custom properties instead of inline styles
  - Add test: `expect(() => EventBlock({ event: { ...event, backgroundColor: "url(evil.js)" } })).not.toThrow()`

**No Input Validation on Event Times:**

- Files: `packages/core/src/utils/event-filter.ts`, `packages/core/src/utils/event-position.ts`, `packages/core/src/utils/date-utils.ts`
- Risk: If external event source provides invalid ISO date strings or NaN dates, filtering/positioning could fail silently or crash
- Current mitigation: Types enforce CalendarEvent.start/end are Date | string, but no runtime validation
- Recommendations:
  - Add `validateEvent(event): event is CalendarEvent` that checks start/end are valid dates
  - Call in useCalendarEvents before filtering/grouping
  - Add test with invalid event data

**CalendarProvider Doesn't Validate Prop Changes:**

- File: `packages/core/src/components/CalendarProvider.tsx`
- Risk: If consumer changes firstDay from 0 to NaN, dateRange could become invalid
- Current mitigation: TypeScript types
- Recommendations:
  - Runtime check in setFirstDay: ensure 0 <= firstDay <= 6
  - Add invariant: dateRange.start <= dateRange.end always

---

## Scaling Limits

**Timeline View Not Implemented (Performance Unknown):**

- Problem: Timeline resource layout (ResourceSidebar.tsx, EventLane.tsx) are stubs. No way to test 500+ resource virtualization claim
- Current capacity: Unknown
- Limit: Unknown — could hit DOM node limits much sooner than 500
- Scaling path: Implement timeline (Milestone 3.2-3.3), add performance benchmarks with 100, 500, 1000 resources

**No Event Indexing for Fast Lookups:**

- File: `packages/core/src/hooks/use-calendar-events.ts`
- Problem: filterEventsInRange uses O(n) iteration. With 10K+ events, calendar switches could lag
- Current capacity: ~200 events target
- Limit: Likely degrades >1000 events
- Scaling path: Add event index (Map<dateString, eventIds>) in store after Milestone 1.4

**All-Day Event Row Always Present if Any All-Day Events:**

- File: `packages/core/src/views/week/WeekView.tsx` (lines 64-65)
- Problem: Renders all-day event row even with 1 all-day event, wasting space. With timeline + all-day rows, layout becomes unwieldy
- Current capacity: Space usage ~ok for 1-2 all-day events
- Limit: Could degrade with many resource rows + all-day row
- Scaling path: Option to collapse/hide all-day row, configurable in CalendarConfig

---

## Dependencies at Risk

**date-fns (4.1.0) — Stable, Low Risk:**

- Risk: None apparent
- Impact: Core to date math; cannot be replaced easily
- Migration plan: None needed unless performant ISO-only variant emerges

**@tanstack/react-virtual (3.11.0) — Medium Risk:**

- Risk: API surface is large; wrapping via useVirtualization is incomplete (returns empty state)
- Impact: Timeline virtualization cannot work until implemented
- Migration plan: If @tanstack/react-virtual changes API, useVirtualization wrapper absorbs breaking change

**zustand (5.0.0) — Low Risk:**

- Risk: Already at major version 5; stable API
- Impact: Store is internal; changes to store API affect only internal code
- Migration plan: Store abstraction means migration could happen without breaking consumer contracts

**react peer dependency (^18.0.0 || ^19.0.0) — Low Risk:**

- Risk: Broad range allows React 18 and 19, but code not tested against both
- Impact: Unknown if Calendar works with React 19
- Migration plan: Add React 19 to test matrix in CI

---

## Missing Critical Features Blocking Adoption

**All Views Except Week Are Not Implemented:**

- Problem: Month/day/list/timeline views are stubs
- Blocks: Consumers must use week-only calendars; cannot evaluate full product
- Roadmap status: Milestones 2, 3 not started

**No Drag-Drop, Selection, or Context Menus:**

- Problem: All interaction components return null
- Blocks: Calendar is read-only; no way to create/edit events
- Roadmap status: Milestones 4.1-4.3 not started

**No Keyboard Navigation or Shortcuts:**

- Problem: useKeyboard hook is empty
- Blocks: Keyboard-only users cannot navigate calendar
- Roadmap status: Milestone 6.2 not started

**No Accessibility Audit:**

- Problem: ARIA attributes present in EventBlock (role="button", tabIndex) but no comprehensive audit
- Blocks: Cannot claim WCAG 2.1 AA compliance
- Roadmap status: Milestone 8.1 not started; prerequisites (all views, interactions) incomplete

---

## Type Definition / Implementation Mismatches

**CalendarConfig Props Not Fully Connected:**

- File: `packages/core/src/types/config.ts` defines 40+ config options; not all are wired to components
- Example: `conflictDetection?: ConflictDetectionConfig` is defined but no conflict detection UI uses it
- Risk: Consumers set config expecting behavior that doesn't exist
- Fix: Audit each config option, ensure it's used or marked @deprecated

**ConflictDetectionConfig Defined But Unused:**

- File: `packages/core/src/types/config.ts` (lines 77-84)
- Risk: Consumers enable conflictDetection, get no UI feedback
- Fix: Implement detectConflicts() and wire to UI (Milestone 5.3)

**Milestone TODO Comments in Production Code:**

- Files: `packages/core/src/components/Calendar.tsx` (lines 82-90)
- Risk: Visible in bundled code; indicates unfinished API surface
- Fix: After implementing milestones, remove comments or mark as @beta

---

## Testing Concerns

**Test Coverage Below Threshold (65.95% vs 80% required):**

- Root cause: Stub components and functions with zero test coverage
- Current status: CI will reject builds that don't meet 80% functions/statements/lines, 75% branches
- Fix: Add tests for all stub implementations as features are built, or disable thresholds temporarily (not recommended)

**WeekView Integration Tests Fragile to CSS Changes:**

- File: `packages/core/src/views/week/__tests__/WeekView.test.tsx`
- Risk: Tests check classNames (data-testid) and CSS Grid layout; CSS refactoring breaks tests
- Improvement: Add snapshot tests or component behavior tests instead of CSS class assertions

**No E2E Tests:**

- Risk: No browser-based tests; interactions (drag, click, keyboard) only testable manually
- Roadmap: E2E testing not listed in milestones
- Recommendation: Add E2E suite after Milestone 4 (interactions) complete, use Playwright or Cypress

---

## Deployment & Build Concerns

**Multi-Entry Build Correctness Unknown:**

- Files: `packages/core/src/index.ts`, `packages/core/src/views/*/index.ts`, `packages/core/src/headless/index.ts`
- Risk: tsup configured to generate separate entry points for tree-shaking, but no verification that imports work across all entry points
- Current status: No test validates `import { Calendar } from '@pro-calendr-react/core/views/week'` works
- Fix: Add integration test that imports from each public entry point, renders component

**No Bundle Size Tracking:**

- Risk: Cannot verify <50KB gzipped target is met
- Current status: Build produces dist files, but no size assertion in CI
- Fix: Add size check to CI: `if (dist/index.js.gz > 50KB) fail()`

**CSS Build via PostCSS Separate from tsup:**

- File: `packages/core/package.json` line 105 uses separate build:css script
- Risk: If developer forgets to run `pnpm build`, gets stale CSS
- Current mitigation: build script chains build:css
- Improvement: Integrate PostCSS into tsup config to avoid separate step

---

_Concerns audit: 2025-02-16_
