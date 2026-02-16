---
phase: 05-resources-listview
plan: 02
subsystem: ui
tags: [react, list-view, date-grouping, event-rendering, css-custom-properties]

# Dependency graph
requires:
  - phase: 01-foundation-theming
    provides: CalendarStore, CalendarProvider, CalendarConfig, CalendarClassNames, cn utility
  - phase: 05-01
    provides: Resource data layer, CalendarConfig resource props, listView classNames slots
provides:
  - ListView component with date grouping, empty state, and eventContent render slot
  - ListDateGroup component with sticky date headers
  - ListEventRow component with color dot, time range, click/keyboard handling
  - CalendarBody "list" routing case
  - List view CSS structural styles using --cal-* variables
affects: [06-timeline-view, storybook-stories, list-view-enhancements]

# Tech tracking
tech-stack:
  added: []
  patterns: [date-grouped-list-rendering, event-color-dot-pattern, keyboard-accessible-list-rows]

key-files:
  created:
    - packages/core/src/views/list/ListView.tsx
    - packages/core/src/views/list/ListDateGroup.tsx
    - packages/core/src/views/list/ListEventRow.tsx
  modified:
    - packages/core/src/views/list/index.ts
    - packages/core/src/components/CalendarBody.tsx
    - packages/core/src/styles/calendar.css

key-decisions:
  - "Used backgroundColor (not color) from CalendarEvent type with extendedProps.color fallback for event dot coloring"
  - "ListDateGroup parses YYYY-MM-DD key via component extraction (split + new Date) to avoid timezone offset issues with new Date(string)"
  - "ListEventRow uses keyboard onKeyDown for Enter/Space to trigger onEventClick for accessibility"
  - "Empty state renders without role=list (no semantic list when empty) but shares the same container class"

patterns-established:
  - "List view component decomposition: root ListView > ListDateGroup > ListEventRow for separation of concerns"
  - "Date key parsing: split YYYY-MM-DD and construct Date from components to avoid UTC offset pitfalls"

# Metrics
duration: 2min
completed: 2026-02-17
---

# Phase 5 Plan 2: ListView Component Summary

**ListView with date-grouped event rows, sticky headers, color dots, click/keyboard handlers, eventContent slot, and CalendarBody routing with --cal-* CSS**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-16T20:21:01Z
- **Completed:** 2026-02-16T20:23:44Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Built ListView component that filters, sorts, and groups events by date with empty state messaging
- Created ListDateGroup with sticky date headers formatted as "EEEE, MMMM d, yyyy"
- Created ListEventRow with color dot, formatted time range (respecting hour12), title, and eventContent render slot
- Wired "list" case into CalendarBody renderView switch with correct props
- Added 10 CSS rules for list view using --cal-* variables including hover, focus-visible, and sticky header states

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement ListView, ListDateGroup, and ListEventRow components** - `ea2590f` (feat)
2. **Task 2: Wire ListView into CalendarBody and add list view CSS** - `6acad3e` (feat)

## Files Created/Modified
- `packages/core/src/views/list/ListView.tsx` - Root list view with filter/sort/group pipeline and empty state
- `packages/core/src/views/list/ListDateGroup.tsx` - Date group section with sticky header and event row mapping
- `packages/core/src/views/list/ListEventRow.tsx` - Event row with color dot, time, title, click/keyboard handling
- `packages/core/src/views/list/index.ts` - Updated exports for all three list components
- `packages/core/src/components/CalendarBody.tsx` - Added ListView import and "list" case in renderView switch
- `packages/core/src/styles/calendar.css` - Added list view CSS (sticky headers, event rows, dots, empty state)

## Decisions Made
- Used `backgroundColor` from CalendarEvent type (not `color` which doesn't exist on the type) with `extendedProps.color` as fallback for the event color dot
- ListDateGroup parses the YYYY-MM-DD dateKey by splitting into components and constructing a Date to avoid timezone offset issues that occur with `new Date("YYYY-MM-DD")`
- ListEventRow uses tabIndex={0} with onKeyDown for Enter/Space to trigger onEventClick, matching Phase 4 keyboard accessibility patterns
- Empty state renders without `role="list"` since an empty list has no semantic list meaning

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Used backgroundColor instead of non-existent color property**
- **Found during:** Task 1 (ListEventRow implementation)
- **Issue:** Plan specified `event.color ?? event.extendedProps?.color` but CalendarEvent type has `backgroundColor`, not `color`
- **Fix:** Used `event.backgroundColor ?? event.extendedProps?.color` to match actual type definition
- **Files modified:** packages/core/src/views/list/ListEventRow.tsx
- **Verification:** pnpm typecheck passes
- **Committed in:** ea2590f (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Necessary type correction. No scope creep.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All five view types (week, day, month, list, timeline-stub) are now routable via CalendarBody
- ListView components exported via views/list entry point for tree-shaking
- Resource data layer from 05-01 available for resource-aware views in Phase 6
- Phase 5 complete, ready for Phase 6 (Timeline View)

## Self-Check: PASSED

- All 7 files verified present on disk
- Commit ea2590f verified in git log
- Commit 6acad3e verified in git log
- pnpm typecheck: passed
- pnpm lint: passed (0 errors)
- pnpm build: passed (views/list entry point produced)
- pnpm test:ci: 200/200 tests passed (coverage threshold pre-existing issue)

---
*Phase: 05-resources-listview*
*Completed: 2026-02-17*
