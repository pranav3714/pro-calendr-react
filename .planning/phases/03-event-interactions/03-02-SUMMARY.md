---
phase: 03-event-interactions
plan: 02
subsystem: ui
tags: [react, hooks, pointer-events, drag, resize, state-machine]

# Dependency graph
requires:
  - phase: 03-event-interactions
    provides: "InteractionSlice with drag state machine, pointerToSnappedTime/exceedsThreshold utilities, interaction CSS"
provides:
  - "useEventInteractions hook with pointer event state machine (idle/pending/dragging)"
  - "EventBlock with resize handles and pointer event initiation"
  - "handleEventPointerDown handler for drag-move and drag-resize"
affects: [03-03-PLAN, phase-04, phase-06]

# Tech tracking
tech-stack:
  added: []
  patterns: ["pointer capture + ref-based state machine for drag interactions", "optionsRef pattern for stable closure access to changing props"]

key-files:
  created:
    - packages/core/src/hooks/use-event-interactions.ts
  modified:
    - packages/core/src/components/EventBlock.tsx
    - packages/core/src/styles/calendar.css

key-decisions:
  - "Destructured only editable/onEventClick/containerRef from options; all other values read via optionsRef.current to avoid stale closures in pointer event handlers"
  - "Used ?? fallback (new Date()) instead of non-null assertion for originalStartRef/originalEndRef to satisfy strict ESLint"
  - "Optional chain for snapped ref comparison (ref?.getTime() !== newValue.getTime()) instead of null-check-then-access"
  - "addMinutes from date-fns used for duration arithmetic instead of manual Date manipulation"

patterns-established:
  - "Pointer capture pattern: setPointerCapture on pointerdown, attach move/up handlers to captured element, cleanup on up/cancel"
  - "Ref-based intermediate state: use useRef for drag state to avoid re-renders during pointer moves, sync with store only on snapped changes"
  - "optionsRef pattern: store entire options object in useRef for stable access in native event handlers"

# Metrics
duration: 3min
completed: 2026-02-16
---

# Phase 3 Plan 2: Interaction Engine Hook + EventBlock Resize Summary

**useEventInteractions hook with pointer event state machine for drag-move/resize, and EventBlock enhanced with real DOM resize handles**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-16T13:38:25Z
- **Completed:** 2026-02-16T13:41:54Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- useEventInteractions hook implementing idle->pending->dragging->idle state machine with 4px threshold
- Drag-move shifts both start/end by duration, resize-start/end changes only the dragged edge
- Store only updated when snapped position actually changes (ref comparison optimization)
- Cancellation listeners for Escape, visibilitychange, blur, contextmenu
- validateDrop integration during drag and on drop
- Click-through when pointer threshold not exceeded (pending->pointerup->onClick)
- EventBlock renders top/bottom resize handle divs when canResize is true
- data-editable attribute + CSS cursor: grab rule for editable events

## Task Commits

Each task was committed atomically:

1. **Task 1: Create useEventInteractions hook with pointer event state machine** - `5514a30` (feat)
2. **Task 2: Add resize handles and pointer event initiation to EventBlock** - `2ae4006` (feat)

## Files Created/Modified
- `packages/core/src/hooks/use-event-interactions.ts` - Main interaction orchestrator hook with pointer event state machine
- `packages/core/src/components/EventBlock.tsx` - Added editable/durationEditable/onPointerDown props, resize handles, data-editable attribute
- `packages/core/src/styles/calendar.css` - Added .pro-calendr-react-event[data-editable] { cursor: grab } rule

## Decisions Made
- Only destructured `editable`, `onEventClick`, and `containerRef` from options; all other values accessed via `optionsRef.current` to avoid stale closures in native pointer event handlers
- Used `?? new Date()` fallback instead of non-null assertion for `originalStartRef`/`originalEndRef` to satisfy strict ESLint `no-non-null-assertion` rule
- Used optional chain (`ref?.getTime()`) for snapped ref comparison instead of explicit null check
- Used `addMinutes` from date-fns for duration arithmetic to maintain consistency with existing codebase patterns

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added cursor: grab CSS rule for editable events**
- **Found during:** Task 2 (EventBlock enhancement)
- **Issue:** Plan mentioned CSS rule `.pro-calendr-react-event[data-editable] { cursor: grab }` was needed but not present in existing CSS from Plan 01
- **Fix:** Added the rule after the event block CSS section in calendar.css
- **Files modified:** packages/core/src/styles/calendar.css
- **Verification:** CSS rule present, build succeeds
- **Committed in:** 2ae4006 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Necessary CSS for UX completeness. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- useEventInteractions hook ready for integration in WeekView/DayView time grids (Plan 03-03)
- EventBlock accepts onPointerDown from the interaction hook's handleEventPointerDown
- All CSS for drag ghost, resize handles, selection overlay already in place from Plan 01
- Plan 03-03 (visual components + integration) can wire useEventInteractions into view components

## Self-Check: PASSED

All 3 modified/created files verified present. All 2 task commits verified in git log.

---
*Phase: 03-event-interactions*
*Completed: 2026-02-16*
