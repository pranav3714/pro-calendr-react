---
phase: 02-dayview-monthview-shared-view-features
plan: 04
subsystem: ui
tags: [react, calendar, allday-events, view-routing]

# Dependency graph
requires:
  - phase: 02-02
    provides: "MonthView component with lane-based event layout"
  - phase: 02-03
    provides: "DayView component with collision layout"
provides:
  - "AllDayRow shared component for all-day event rendering"
  - "CalendarBody view routing for week, day, and month views"
  - "alldayEvent className slot in CalendarClassNames"
affects: [02-05-shared-features, toolbar, storybook]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Shared component extraction: AllDayRow used by both WeekView and DayView"
    - "View-specific props: monthViewProps excludes time-grid props, viewProps shared by time-grid views"

key-files:
  created:
    - packages/core/src/components/AllDayRow.tsx
  modified:
    - packages/core/src/views/week/WeekView.tsx
    - packages/core/src/views/day/DayView.tsx
    - packages/core/src/components/CalendarBody.tsx
    - packages/core/src/types/theme.ts
    - packages/core/src/styles/calendar.css
    - packages/core/src/components/__tests__/Calendar.test.tsx

key-decisions:
  - "AllDayRow returns null when no all-day events (conditional rendering moved inside component)"
  - "AllDayRow uses parseDate for proper date comparison instead of raw new Date() coercion"
  - "MonthView gets separate monthViewProps without time-grid props (slotDuration, slotMinTime, etc.)"
  - "DayView shares same viewProps as WeekView since both are time-grid views"

patterns-established:
  - "Shared component pattern: Extract duplicated view logic into components/ for reuse across views"
  - "View prop separation: Time-grid views (WeekView, DayView) share viewProps; non-time-grid views (MonthView) get separate props"

# Metrics
duration: 4min
completed: 2026-02-16
---

# Phase 2 Plan 4: AllDayRow Extraction & View Routing Summary

**Shared AllDayRow component eliminates duplicated all-day rendering; CalendarBody routes to Week, Day, and Month views**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-16T12:26:47Z
- **Completed:** 2026-02-16T12:31:20Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Extracted AllDayRow into a shared component used by both WeekView and DayView
- CalendarBody now routes to WeekView, DayView, or MonthView based on store's currentView
- All 190 existing tests pass with no regressions
- Build, typecheck, and lint all clean

## Task Commits

Each task was committed atomically:

1. **Task 1: Extract AllDayRow shared component** - `3b9081f` (feat)
2. **Task 2: CalendarBody view routing for Day and Month** - `41fcbad` (feat)

## Files Created/Modified
- `packages/core/src/components/AllDayRow.tsx` - Shared all-day events row component with days/allDayEvents/eventContent/onEventClick props
- `packages/core/src/views/week/WeekView.tsx` - Replaced inline all-day rendering with AllDayRow import
- `packages/core/src/views/day/DayView.tsx` - Replaced inline all-day rendering with AllDayRow import
- `packages/core/src/components/CalendarBody.tsx` - Added DayView import and routing; separated monthViewProps
- `packages/core/src/types/theme.ts` - Added alldayEvent className to CalendarClassNames
- `packages/core/src/styles/calendar.css` - Added max-height + overflow-y: auto to allday-row
- `packages/core/src/components/__tests__/Calendar.test.tsx` - Fixed stale tests expecting empty body for implemented views

## Decisions Made
- AllDayRow returns null when no all-day events, keeping the conditional rendering inside the component for cleaner parent code
- Used parseDate() for date comparison in AllDayRow (consistent with other utils, handles string dates properly)
- MonthView receives separate monthViewProps without time-grid concepts (slotDuration, slotMinTime, slotMaxTime, slotHeight)
- DayView receives identical viewProps as WeekView since both are time-grid views

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed stale Calendar tests expecting empty body for implemented views**
- **Found during:** Task 1 (AllDayRow extraction) and Task 2 (view routing)
- **Issue:** Calendar.test.tsx had tests asserting month view and day view render empty bodies, but these views are now fully implemented and routed
- **Fix:** Updated "renders empty body for unimplemented views" to verify MonthView renders; updated "respects defaultView prop" to verify DayView renders
- **Files modified:** packages/core/src/components/__tests__/Calendar.test.tsx
- **Verification:** All 190 tests pass
- **Committed in:** 3b9081f (Task 1) and 41fcbad (Task 2)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Necessary fix for stale tests. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All three views (Week, Day, Month) are now routable via CalendarBody
- AllDayRow is available as a shared component for any future views that need all-day event display
- Ready for 02-05 (shared view features like business hours, now indicator, etc.)

---
*Phase: 02-dayview-monthview-shared-view-features*
*Completed: 2026-02-16*

## Self-Check: PASSED

- All 7 files verified present
- Both task commits (3b9081f, 41fcbad) verified in git log
- AllDayRow imported by both WeekView and DayView (key_links verified)
- CalendarBody routes to DayView and MonthView (key_links verified)
- 190/190 tests passing, typecheck clean, lint clean, build succeeds
