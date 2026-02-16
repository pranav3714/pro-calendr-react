---
phase: 03-event-interactions
plan: 03
subsystem: ui
tags: [react, portal, drag-ghost, tooltip, selection-overlay, drop-indicator, pointer-events]

# Dependency graph
requires:
  - phase: 03-event-interactions
    provides: "InteractionSlice with drag state machine, pointerToSnappedTime/exceedsThreshold utilities, interaction CSS, useEventInteractions hook, EventBlock with resize handles"
provides:
  - "DragGhost component rendering fixed-position ghost event with snapped times"
  - "DragLayer portal with ghost + time tooltip showing delta and drop validity"
  - "DropIndicator component with green/red validity highlight"
  - "SelectionOverlay component for blue time-range selection rectangle"
  - "useSlotSelection hook for click-drag slot selection with pointer capture"
  - "TimeSlotColumn fully integrated with drag/resize/select interactions"
  - "WeekView and DayView passing interaction props through to TimeSlotColumn"
  - "Calendar root with DragLayer portal and data-dragging attribute"
affects: [phase-04, phase-05, phase-06]

# Tech tracking
tech-stack:
  added: []
  patterns: ["portal rendering for drag overlay (createPortal to document.body)", "useMemo for derived drop indicator position from store state", "callback ref pattern for capturing parent grid container element"]

key-files:
  created: []
  modified:
    - packages/core/src/components/DragGhost.tsx
    - packages/core/src/components/DragLayer.tsx
    - packages/core/src/components/DropIndicator.tsx
    - packages/core/src/components/SelectionOverlay.tsx
    - packages/core/src/hooks/use-selection.ts
    - packages/core/src/views/week/TimeSlotColumn.tsx
    - packages/core/src/views/week/WeekView.tsx
    - packages/core/src/views/day/DayView.tsx
    - packages/core/src/components/Calendar.tsx

key-decisions:
  - "DragGhost reads event data from useCalendarConfig().events via find-by-id rather than extending DragOrigin type"
  - "DragTimeTooltip inlined inside DragLayer (not a separate component file) since it is small and tightly coupled"
  - "useSlotSelection uses local useState for selectionPixels (not Zustand store) to avoid expensive store updates on pointermove"
  - "TimeSlotColumn uses callback ref pattern to capture parent grid container for useEventInteractions coordinate calculation"
  - "Drop indicator position computed in useMemo from store state to avoid redundant conditional narrowing"

patterns-established:
  - "Portal overlay pattern: DragLayer uses createPortal(content, document.body) for fixed-position drag UI above all content"
  - "Callback ref for parent capture: setColumnRef sets both columnRef and gridContainerRef.current = node.parentElement"
  - "Interaction prop pass-through: WeekView/DayView accept and forward editable/selectable/onEventDrop/onEventResize/onSelect/validateDrop"

# Metrics
duration: 7min
completed: 2026-02-16
---

# Phase 3 Plan 3: Visual Feedback Components + View Integration Summary

**DragGhost, DragLayer portal with tooltip, SelectionOverlay, DropIndicator, and full interaction wiring into TimeSlotColumn/WeekView/DayView/Calendar**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-16T13:44:34Z
- **Completed:** 2026-02-16T13:51:28Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments
- DragGhost renders fixed-position ghost event following cursor with snapped start/end times and 0.85 opacity
- DragLayer portal renders ghost + time tooltip with delta display and green/red validity border
- SelectionOverlay renders blue highlight rectangle during click-drag on empty time slots
- useSlotSelection hook handles complete slot selection lifecycle with pointer capture
- DropIndicator renders positioned green/red highlight in the target column during drag
- TimeSlotColumn fully integrates useEventInteractions for drag/resize and useSlotSelection for selection
- Calendar root applies data-dragging attribute during active drag for user-select: none CSS

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement DragGhost, DragLayer with tooltip and validity indicator** - `0f35388` (feat)
2. **Task 2: Implement SelectionOverlay and slot selection pointer events** - `1006afa` (feat)
3. **Task 3: Wire all interactions into TimeSlotColumn, views, CalendarBody, and Calendar** - `0edf083` (feat)

## Files Created/Modified
- `packages/core/src/components/DragGhost.tsx` - Ghost event at fixed position with snapped times during drag
- `packages/core/src/components/DragLayer.tsx` - Portal container with DragGhost + DragTimeTooltip (time delta, validity)
- `packages/core/src/components/DropIndicator.tsx` - Positioned green/red validity highlight for drop target
- `packages/core/src/components/SelectionOverlay.tsx` - Blue highlight rectangle for time range selection
- `packages/core/src/hooks/use-selection.ts` - Added useSlotSelection hook with pointer capture and snap-to-time conversion
- `packages/core/src/views/week/TimeSlotColumn.tsx` - Full interaction integration: useEventInteractions, useSlotSelection, SelectionOverlay, DropIndicator
- `packages/core/src/views/week/WeekView.tsx` - Accepts and passes interaction props (editable, selectable, callbacks, validateDrop)
- `packages/core/src/views/day/DayView.tsx` - Accepts and passes interaction props (editable, selectable, callbacks, validateDrop)
- `packages/core/src/components/Calendar.tsx` - Renders DragLayer portal, applies data-dragging attribute on root

## Decisions Made
- DragGhost reads event data from `useCalendarConfig().events.find(e => e.id === originEventId)` rather than extending DragOrigin type (simpler, events array already in context)
- DragTimeTooltip inlined inside DragLayer.tsx (not a separate file) since it is small (~30 lines) and tightly coupled to DragLayer
- useSlotSelection uses local `useState` for `selectionPixels` instead of Zustand store to avoid expensive store updates during pointermove (performance optimization)
- TimeSlotColumn uses callback ref pattern (`setColumnRef`) to capture both the column element and its parent grid container for coordinate calculations
- Drop indicator position computed in `useMemo` to satisfy ESLint strict type narrowing (avoids `@typescript-eslint/no-unnecessary-condition` errors)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed ESLint no-unnecessary-condition in drop indicator logic**
- **Found during:** Task 3 (TimeSlotColumn integration)
- **Issue:** TypeScript strict linting flagged redundant null checks on `dragSnappedStart`/`dragSnappedEnd` after `showDropIndicator` already guaranteed truthiness
- **Fix:** Refactored to `useMemo` returning `null | { top, height }` so the conditional narrowing is clean
- **Files modified:** packages/core/src/views/week/TimeSlotColumn.tsx
- **Verification:** `pnpm lint` passes with 0 errors
- **Committed in:** 0edf083 (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Necessary for ESLint strict compliance. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 3 (Event Interactions) is now complete: all drag/resize/select/click interactions work in WeekView and DayView
- Visual feedback includes ghost event, time tooltip with delta, selection overlay, and drop validity indicator
- All cancellation events (Escape, blur, visibilitychange, contextmenu) properly reset state
- Phase 4 can build on top of this interaction system for additional features
- Phase 6 (Timeline) can extend the drag system for cross-resource drag

## Self-Check: PASSED

All 9 modified files verified present. All 3 task commits verified in git log.

---
*Phase: 03-event-interactions*
*Completed: 2026-02-16*
