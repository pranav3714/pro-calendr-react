---
phase: 04-keyboard-navigation-accessibility
plan: 03
subsystem: ui
tags: [react, accessibility, keyboard-shortcuts, zustand, hooks]

# Dependency graph
requires:
  - phase: 04-keyboard-navigation-accessibility
    plan: 01
    provides: InteractionSlice with dragEngine, selection, focusedDate state; KEYS constants
provides:
  - useKeyboard hook with view shortcuts (T/D/W/M), Escape priority chain, and input guard
  - Calendar root tabIndex={-1} and keyboard event wiring
  - Focus restoration on view switch via CalendarBody requestAnimationFrame effect
affects: [views/week, views/day, views/month, storybook]

# Tech tracking
tech-stack:
  added: []
  patterns: [options-ref-pattern, store-getstate-for-getters, scoped-keyboard-shortcuts]

key-files:
  created: []
  modified:
    - packages/core/src/hooks/use-keyboard.ts
    - packages/core/src/components/Calendar.tsx
    - packages/core/src/components/CalendarBody.tsx

key-decisions:
  - "useKeyboard attaches keydown listener to calendar root element (not document) for scope isolation"
  - "Escape priority chain: drag > selection > nothing, using store.getState() getters to avoid stale closures"
  - "Calendar root uses tabIndex={-1} (focusable but not in tab order) for keyboard event bubbling"
  - "Focus restoration uses requestAnimationFrame to wait for new view DOM before querying tabIndex={0} element"

patterns-established:
  - "Options ref pattern: wrap all hook options in useRef for stable event listener (same as useEventInteractions)"
  - "Store getState() getters: pass () => store.getState().field functions for non-stale reads in event handlers"
  - "Input guard: check tagName against INPUT/TEXTAREA/SELECT + isContentEditable before handling keyboard shortcuts"

# Metrics
duration: 3min
completed: 2026-02-16
---

# Phase 4 Plan 3: Keyboard Shortcuts + Focus Restoration Summary

**useKeyboard hook with T/D/W/M view shortcuts, Escape priority chain (drag > selection), input guard, and CalendarBody focus restoration on view switch**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-16T18:58:06Z
- **Completed:** 2026-02-16T19:01:03Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Rewrote useKeyboard hook from stub to full implementation with view shortcuts (T/D/W/M), Escape priority chain, input guard, and custom bindings support
- Wired useKeyboard into CalendarInner with CalendarStoreContext for direct getState() access
- Added tabIndex={-1} and ref to Calendar root div for keyboard event scoping
- Added focus restoration in CalendarBody that finds and focuses tabIndex={0} cell after view switch

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite useKeyboard hook with shortcuts, activation, and Escape chain** - `8ae01e7` (feat)
2. **Task 2: Wire useKeyboard into Calendar root and add focus restoration in CalendarBody** - `905a8a8` (feat)

## Files Created/Modified
- `packages/core/src/hooks/use-keyboard.ts` - Full keyboard shortcut handler with view switching, Escape priority chain, input guard, and custom bindings
- `packages/core/src/components/Calendar.tsx` - Calendar root with tabIndex={-1}, ref, and useKeyboard wiring via CalendarStoreContext
- `packages/core/src/components/CalendarBody.tsx` - Focus restoration on view switch using requestAnimationFrame + tabIndex={0} query

## Decisions Made
- Used CalendarStoreContext (already exported) for direct store.getState() access instead of ref-based state mirroring -- simpler and avoids sync issues
- Attached keydown listener to root element (not document) ensuring shortcuts only fire when calendar has focus
- Used options ref pattern (matching useEventInteractions) to avoid listener recreation on prop changes
- Single-letter shortcuts (t/d/w/m) do NOT call preventDefault since input guard already filters text inputs
- Escape DOES call preventDefault to suppress browser default behavior

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing typecheck errors in WeekView.tsx and DayView.tsx (from plan 04-02 unused imports and property mismatches) -- not caused by this plan's changes, verified by filtering typecheck output to only our modified files

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Keyboard shortcut system complete: T/D/W/M view switching, Escape priority chain
- Focus restoration ensures keyboard users maintain context across view transitions
- Phase 04 keyboard navigation is now fully implemented (plans 01-03)
- Ready for Phase 05 (Resources) or any subsequent phase

## Self-Check: PASSED

All files exist, all commits verified, all exports confirmed.
