# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-16)

**Core value:** Handle 1000+ events across all five views without performance degradation -- virtualization, surgical Zustand selectors, and minimal re-renders are non-negotiable.
**Current focus:** Phase 2 - DayView, MonthView & Shared View Features

## Current Position

Phase: 2 of 8 (DayView, MonthView & Shared View Features)
Plan: 1 of 5 in current phase
Status: In Progress
Last activity: 2026-02-16 -- Completed 02-01-PLAN.md (Collision layout algorithm)

Progress: [██░░░░░░░░] 15%

## Performance Metrics

**Velocity:**
- Total plans completed: 6
- Average duration: 3.5min
- Total execution time: 0.35 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation-theming | 5/5 | 18min | 3.6min |
| 02-dayview-monthview-shared-view-features | 1/5 | 3min | 3min |

**Recent Trend:**
- Last 5 plans: 01-02 (3min), 01-03 (3min), 01-04 (5min), 01-05 (5min), 02-01 (3min)
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

### Pending Todos

None yet.

### Blockers/Concerns

- Research flagged MonthView multi-day lane allocation as needing validation during Phase 2 planning
- Research flagged dual-axis virtualization (Phase 6) as most complex -- consider prototype early

## Session Continuity

Last session: 2026-02-16
Stopped at: Completed 02-01-PLAN.md (Collision layout algorithm)
Resume file: None
