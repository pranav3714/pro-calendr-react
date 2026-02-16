# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-16)

**Core value:** Handle 1000+ events across all five views without performance degradation -- virtualization, surgical Zustand selectors, and minimal re-renders are non-negotiable.
**Current focus:** Phase 4 - Keyboard Navigation & Accessibility

## Current Position

Phase: 4 of 8 (Keyboard Navigation & Accessibility)
Plan: 1 of 3 in current phase
Status: In Progress
Last activity: 2026-02-16 -- Completed 04-01-PLAN.md (Roving Grid Hook + Focus Styles)

Progress: [███████░░░] 41%

## Performance Metrics

**Velocity:**
- Total plans completed: 14
- Average duration: 3.6min
- Total execution time: 0.85 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation-theming | 5/5 | 18min | 3.6min |
| 02-dayview-monthview-shared-view-features | 5/5 | 19min | 3.8min |
| 03-event-interactions | 3/3 | 14min | 4.7min |
| 04-keyboard-navigation-accessibility | 1/3 | 3min | 3.0min |

**Recent Trend:**
- Last 5 plans: 02-05 (4min), 03-01 (4min), 03-02 (3min), 03-03 (7min), 04-01 (3min)
- Trend: stable

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: 8-phase structure derived from 70 requirements across 12 categories
- [Roadmap]: Foundation phase includes theming (THME requirements) since CSS tokens and store slicing are tightly coupled
- [Roadmap]: Phase 5 (Resources) depends only on Phase 1, giving parallelization flexibility
- [Roadmap]: INTR-02 (cross-resource drag) assigned to Phase 3 but full implementation deferred to Phase 6 when TimelineView exists
- [01-01]: Used StateCreator<CalendarStore, [], [], SliceType> for Zustand v5 slice typing convention
- [01-01]: useCalendarStore requires selector parameter -- no zero-arg overload to prevent whole-store subscriptions
- [01-01]: Store initialized in useState initializer (not useEffect) for synchronous initialization
- [01-01]: firstDay synced via store.getState().setFirstDay() instead of hook-based access
- [01-02]: useCalendar() is convenience hook (new object per render); performance-sensitive components use useCalendarStore(selector) directly
- [01-02]: Store tests use per-instance createCalendarStore() instead of global singleton
- [01-02]: Calendar tests no longer need resetStore() since each Calendar creates own store via CalendarProvider
- [01-03]: String inputs to parseDate/createCalendarDate treated as wall-clock time in target timezone (parsed via Date component extraction)
- [01-03]: TZDate extends Date so existing functions work with TZDate inputs without source modification
- [01-03]: NavigationSlice gets optional timezone field with setTimezone action for store-level timezone config
- [01-03]: Backward compatible: undefined timezone = identical behavior to before (plain Date throughout)
- [01-04]: CSS variables scoped to .pro-calendr-react (not :root) to prevent consumer CSS collisions
- [01-04]: Dark mode via [data-theme="dark"] attribute with CSS-only approach (no JS) for SSR compatibility
- [01-04]: Per-event colors remain inline (dynamic data), visual properties extracted to CSS classes
- [01-04]: Auto dark mode uses @media (prefers-color-scheme: dark) nested under [data-theme="auto"]
- [01-05]: CalendarClassNames typed interface instead of Record<string, string> for autocomplete and type safety
- [01-05]: cn() is a zero-dependency utility (filter+join) -- no clsx/classnames library needed
- [01-05]: classNames accessed from CalendarConfigContext (not props) so all nested components inherit automatically
- [01-05]: Consumer classNames ADD TO library classes (never replace) via cn('library-class', classNames?.slot)
- [02-01]: Replaced detectCollisions/CollisionGroup with layoutCollisions/CollisionResult (breaking change acceptable for unreleased library)
- [02-01]: Used ?? 0 fallback instead of non-null assertion for Map.get to satisfy strict ESLint
- [02-01]: Input array not mutated: spread copy before sort
- [02-02]: Lane allocation uses greedy first-fit: segments sorted by span desc, assigned to first non-overlapping lane
- [02-02]: buildEventSegments clips events to week boundaries with isStart/isEnd flags for continuation styling
- [02-02]: MonthView currentMonth derived from midpoint of dateRange (handles cross-month boundaries)
- [02-02]: Event chips use CSS Grid grid-column for multi-day spanning
- [02-03]: DayView reuses TimeSlotColumn directly rather than duplicating time-grid rendering
- [02-03]: Collision positioning returns raw percentages (0-100) for caller flexibility
- [02-03]: Single non-overlapping events retain pixel-based positioning; overlapping use percentage-based
- [02-03]: Collision map pattern: useMemo builds Map<eventId, {column, totalColumns}> for O(1) lookups
- [02-04]: AllDayRow returns null when no all-day events (conditional rendering inside component, not parent)
- [02-04]: AllDayRow uses parseDate() for date comparison consistency across string/Date inputs
- [02-04]: MonthView gets separate monthViewProps excluding time-grid props; DayView shares viewProps with WeekView
- [02-04]: Shared component extraction pattern: duplicated view logic moves to components/ for reuse
- [02-05]: NowIndicator uses local useState + setInterval (60s) for self-contained updates without parent re-renders
- [02-05]: BusinessHoursOverlay uses pointer-events: none so events beneath remain interactive
- [02-05]: Z-index layering convention: grid (auto) < business-hours (1) < events (5) < now-indicator (10)
- [02-05]: NowIndicator always rendered in TimeSlotColumn; self-determines visibility via isSameDay check
- [02-05]: Config pipeline extension pattern: add to CalendarProviderProps + CalendarConfig, wire through CalendarBody viewProps
- [03-01]: Renamed dragState to dragEngine across codebase for clarity between old DragState type and new DragEngineState
- [03-01]: IDLE_DRAG_ENGINE constant with spread copies for state resets ensures no shared references
- [03-01]: startDragging/updateDragPosition guard on phase to enforce state machine transitions
- [03-01]: dragThreshold added as DEFAULTS.dragThreshold (4px) following existing constants pattern
- [03-02]: Pointer event handlers read from optionsRef.current to avoid stale closures; only editable/onEventClick/containerRef destructured
- [03-02]: Used ?? fallback instead of non-null assertion for originalStartRef/originalEndRef (strict ESLint compliance)
- [03-02]: addMinutes from date-fns for duration arithmetic instead of manual Date manipulation
- [03-02]: Optional chain for snapped ref comparison (ref?.getTime()) instead of explicit null check
- [03-03]: DragGhost reads event data from useCalendarConfig().events via find-by-id rather than extending DragOrigin type
- [03-03]: DragTimeTooltip inlined inside DragLayer (not a separate component file) since it is small and tightly coupled
- [03-03]: useSlotSelection uses local useState for selectionPixels (not Zustand store) to avoid expensive store updates on pointermove
- [03-03]: TimeSlotColumn uses callback ref pattern to capture parent grid container for useEventInteractions coordinate calculation
- [03-03]: Drop indicator position computed in useMemo from store state to avoid redundant conditional narrowing
- [04-01]: useRovingGrid uses ref for position + render tick counter (not useState for position) to avoid re-render lag on arrow key press
- [04-01]: focusedDate stored in InteractionSlice (not a separate slice) since it is interaction state
- [04-01]: Focus indicators use outline for cells and box-shadow for rounded elements (events) for cross-browser consistency

### Pending Todos

None yet.

### Blockers/Concerns

- Research flagged dual-axis virtualization (Phase 6) as most complex -- consider prototype early

## Session Continuity

Last session: 2026-02-16
Stopped at: Completed 04-01-PLAN.md (Roving Grid Hook + Focus Styles)
Resume file: None
