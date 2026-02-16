---
phase: 04-keyboard-navigation-accessibility
plan: 01
subsystem: ui
tags: [react, accessibility, keyboard-navigation, roving-tabindex, wcag, zustand, css]

# Dependency graph
requires:
  - phase: 03-event-interactions
    provides: InteractionSlice and drag engine state patterns
provides:
  - useRovingGrid hook for 2D grid keyboard navigation (roving tabindex pattern)
  - focusedDate state in InteractionSlice for cross-view focus persistence
  - Focus indicator CSS styles (:focus-visible) for all focusable calendar elements
  - SPACE/HOME/END key constants for keyboard navigation
affects: [04-02-PLAN, 04-03-PLAN, views/week, views/month, views/day]

# Tech tracking
tech-stack:
  added: []
  patterns: [roving-tabindex-grid, ref-based-position-tracking, render-tick-pattern]

key-files:
  created:
    - packages/core/src/hooks/use-roving-grid.ts
  modified:
    - packages/core/src/store/slices/interaction-slice.ts
    - packages/core/src/constants/keys.ts
    - packages/core/src/styles/calendar.css

key-decisions:
  - "useRovingGrid uses ref for position + render tick counter (not useState for position) to avoid re-render lag on arrow key press"
  - "focusedDate stored in InteractionSlice (not a separate slice) since it is interaction state"
  - "Focus indicators use outline for cells and box-shadow for rounded elements (events) for cross-browser consistency"

patterns-established:
  - "Roving tabindex: only one cell has tabIndex={0}, all others -1, managed by useRovingGrid hook"
  - "Ref + render tick: useRef for fast updates, useState counter to trigger re-render for getTabIndex recalculation"
  - "getCellProps pattern: hook returns a props-spreading function for grid cells"

# Metrics
duration: 3min
completed: 2026-02-16
---

# Phase 4 Plan 1: Roving Grid Hook + Focus Styles Summary

**useRovingGrid hook with 2D arrow/Home/End navigation, focusedDate store state, and :focus-visible CSS indicators for all calendar elements**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-16T18:52:02Z
- **Completed:** 2026-02-16T18:55:13Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Created useRovingGrid hook implementing WAI-ARIA grid pattern with getCellProps/getTabIndex/focusedCell API
- Extended InteractionSlice with focusedDate/setFocusedDate for cross-view keyboard focus persistence
- Added :focus-visible CSS rules for 6 focusable element types (time slots, month cells, events, month events, all-day events, overflow indicators)
- Added SPACE, HOME, END key constants to KEYS for keyboard navigation

## Task Commits

Each task was committed atomically:

1. **Task 1: useRovingGrid hook and interaction slice extension** - `45db0fb` (feat)
2. **Task 2: Focus indicator CSS styles** - `1729e42` (feat)

## Files Created/Modified
- `packages/core/src/hooks/use-roving-grid.ts` - 2D roving tabindex hook with arrow/Home/End navigation and Enter/Space activation
- `packages/core/src/store/slices/interaction-slice.ts` - Added focusedDate/setFocusedDate for cross-view focus persistence
- `packages/core/src/constants/keys.ts` - Added SPACE, HOME, END key constants
- `packages/core/src/styles/calendar.css` - Focus indicator styles using :focus-visible for all focusable elements

## Decisions Made
- Used ref-based position tracking with render tick counter instead of pure useState to avoid re-render lag on rapid arrow key presses while still ensuring getTabIndex returns correct values
- Placed focusedDate in InteractionSlice rather than creating a new slice, since focused state is interaction state
- Used outline for cell focus indicators (no layout impact) and box-shadow for event focus indicators (follows border-radius)
- Added SPACE/HOME/END to KEYS constants rather than using raw string literals (Rule 3: blocking -- hook needed these constants)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added SPACE/HOME/END key constants**
- **Found during:** Task 1 (useRovingGrid hook)
- **Issue:** KEYS constants lacked SPACE, HOME, and END entries needed for the hook's key handling
- **Fix:** Added `SPACE: " "`, `HOME: "Home"`, `END: "End"` to constants/keys.ts
- **Files modified:** packages/core/src/constants/keys.ts
- **Verification:** Typecheck and lint pass
- **Committed in:** 45db0fb (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary addition to support the hook's keyboard handling. No scope creep.

## Issues Encountered
- ESLint `react-hooks/exhaustive-deps` rule not available in this project's ESLint config -- removed disable comments and restructured deps to avoid needing them (extracted optional chaining values to local variables)

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- useRovingGrid hook ready for view integration (Plan 02: wire into WeekView, DayView, MonthView)
- focusedDate store field ready for date-to-grid-position mapping in each view
- Focus CSS ready -- views just need to add the correct class names to focusable elements

## Self-Check: PASSED

All files exist, all commits verified, all exports confirmed.

---
*Phase: 04-keyboard-navigation-accessibility*
*Completed: 2026-02-16*
