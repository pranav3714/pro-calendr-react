---
phase: 03-event-interactions
plan: 01
subsystem: ui
tags: [zustand, state-machine, drag, resize, select, css, react]

# Dependency graph
requires:
  - phase: 01-foundation-theming
    provides: "Zustand store slices, CalendarProvider, CSS custom properties"
  - phase: 02-dayview-monthview-shared-view-features
    provides: "CalendarBody view routing, config pipeline pattern"
provides:
  - "DragPhase/DragMode/DragEngineState/ResizeEdge types for interaction state"
  - "InteractionSlice with drag state machine (startPending/startDragging/updateDragPosition/completeDrag/cancelDrag)"
  - "pointerToSnappedTime/pointerToColumnIndex/exceedsThreshold coordinate utilities"
  - "CalendarConfig with onEventDrop/onEventResize/onSelect/validateDrop callbacks"
  - "Complete interaction CSS (drag ghost, selection overlay, drop indicators, resize handles, tooltip, drag layer)"
affects: [03-02-PLAN, 03-03-PLAN, phase-04, phase-06]

# Tech tracking
tech-stack:
  added: []
  patterns: ["drag state machine (idle/pending/dragging)", "coordinate-to-time conversion pipeline", "IDLE constant pattern for state reset"]

key-files:
  created: []
  modified:
    - packages/core/src/types/interaction.ts
    - packages/core/src/store/slices/interaction-slice.ts
    - packages/core/src/store/selectors.ts
    - packages/core/src/store/index.ts
    - packages/core/src/hooks/use-drag.ts
    - packages/core/src/utils/snap.ts
    - packages/core/src/constants/defaults.ts
    - packages/core/src/components/CalendarProvider.tsx
    - packages/core/src/components/CalendarBody.tsx
    - packages/core/src/styles/calendar.css

key-decisions:
  - "Renamed dragState to dragEngine across codebase for clarity between old DragState type and new DragEngineState"
  - "IDLE_DRAG_ENGINE constant with spread copies for state resets ensures no shared references"
  - "startDragging/updateDragPosition guard on phase to enforce state machine transitions"
  - "dragThreshold added as DEFAULTS.dragThreshold (4px) following existing constants pattern"

patterns-established:
  - "Drag state machine pattern: idle -> pending -> dragging -> idle with phase guards"
  - "Coordinate conversion pipeline: clientY -> containerRelativeY -> slotIndex -> minutes -> Date"
  - "Config pipeline extension: add to CalendarConfig + CalendarProviderProps + function sig + useMemo object + deps"

# Metrics
duration: 4min
completed: 2026-02-16
---

# Phase 3 Plan 1: Interaction Foundation Summary

**Drag state machine in Zustand with coordinate-to-time conversion, CalendarProvider interaction callbacks, and complete drag/resize/select CSS**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-16T13:30:36Z
- **Completed:** 2026-02-16T13:35:18Z
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments
- DragEngineState type with phase machine (idle/pending/dragging) and DragMode (move/resize-start/resize-end/select) in interaction.ts
- InteractionSlice upgraded from simple dragState to full drag engine with 5 state machine actions
- pointerToSnappedTime, pointerToColumnIndex, exceedsThreshold utilities for coordinate-to-time conversion
- CalendarConfig and CalendarBody wired with onEventDrop, onEventResize, onSelect, validateDrop callbacks
- Comprehensive interaction CSS: drag ghost, selection overlay, drop indicators, resize handles, drag tooltip, drag layer

## Task Commits

Each task was committed atomically:

1. **Task 1: Enhance interaction types and interaction slice with drag state machine** - `4f93e6b` (feat)
2. **Task 2: Add pointerToSnappedTime utility and DRAG_THRESHOLD constant** - `2c0968d` (feat)
3. **Task 3: Wire interaction callbacks into CalendarProvider and add interaction CSS** - `26a5020` (feat)

## Files Created/Modified
- `packages/core/src/types/interaction.ts` - Added DragPhase, DragMode, DragEngineState, ResizeEdge types
- `packages/core/src/store/slices/interaction-slice.ts` - Replaced dragState with dragEngine state machine
- `packages/core/src/store/selectors.ts` - Renamed selectDragState to selectDragEngine
- `packages/core/src/store/index.ts` - Updated selector re-export
- `packages/core/src/hooks/use-drag.ts` - Exposed new drag engine API (6 properties)
- `packages/core/src/utils/snap.ts` - Added pointerToSnappedTime, pointerToColumnIndex, exceedsThreshold
- `packages/core/src/constants/defaults.ts` - Added dragThreshold: 4
- `packages/core/src/components/CalendarProvider.tsx` - Added interaction callbacks to CalendarConfig
- `packages/core/src/components/CalendarBody.tsx` - Passed interaction callbacks through viewProps
- `packages/core/src/styles/calendar.css` - Added all interaction CSS classes

## Decisions Made
- Renamed `dragState` to `dragEngine` across codebase for clarity between the old simple `DragState` type and the new `DragEngineState` machine
- Used `IDLE_DRAG_ENGINE` constant with spread copies for resets to prevent shared reference bugs
- Phase guards on `startDragging()` (requires pending) and `updateDragPosition()` (requires dragging) enforce valid state transitions
- Added `dragThreshold` to `DEFAULTS` object following the existing constants pattern (rather than a standalone export)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated selectDragState selector and store/index.ts export**
- **Found during:** Task 1 (interaction slice enhancement)
- **Issue:** `selectDragState` in selectors.ts and its re-export in store/index.ts still referenced the old `dragState` field
- **Fix:** Renamed to `selectDragEngine` and updated the export in store/index.ts
- **Files modified:** packages/core/src/store/selectors.ts, packages/core/src/store/index.ts
- **Verification:** Grep for `dragState` returns zero matches across codebase
- **Committed in:** 4f93e6b (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary for correctness after field rename. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All interaction types, store actions, utilities, and CSS are in place
- Plan 03-02 (drag engine hook) can import DragEngineState, use startPending/startDragging/updateDragPosition, and leverage pointerToSnappedTime
- Plan 03-03 (visual components + integration) can use the CSS classes and CalendarConfig callbacks

## Self-Check: PASSED

All 10 modified files verified present. All 3 task commits verified in git log.

---
*Phase: 03-event-interactions*
*Completed: 2026-02-16*
