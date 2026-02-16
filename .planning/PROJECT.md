# Pro Calendar — @pro-calendr-react/core

## What This Is

A standalone, general-purpose React calendar package that replaces FullCalendar. Lightweight, virtualized, Tailwind-native, with render slots for full customization. Works in any React project — Aviatize is the first consumer but the package has zero domain knowledge.

## Core Value

Handle 1000+ events across all five views (week, month, day, timeline, list) without performance degradation — virtualization, surgical Zustand selectors, and minimal re-renders are non-negotiable.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. Inferred from existing codebase. -->

- ✓ Date utilities — parsing, formatting, range calculations, timezone support (date-fns/date-fns-tz) — existing
- ✓ Time slot generation — configurable duration, snap-to-grid boundaries — existing
- ✓ Zustand store — currentView, currentDate, dateRange, selection, drag state, navigation actions — existing
- ✓ Event filtering — filter by date range, group by date/resource — existing
- ✓ Event positioning — calculate pixel coordinates (top/height) for time-based grids — existing
- ✓ Collision detection — detect overlapping events for stacking — existing
- ✓ WeekView — vertical time grid with day columns, time rows, event blocks — existing
- ✓ EventBlock — event display component with render slot support — existing
- ✓ CalendarBody — view router that renders active view based on store state — existing
- ✓ CalendarProvider — Context + Store pattern separating config from mutable state — existing
- ✓ Calendar wrapper — root component with ref API (getDate, setView, navigateDate) — existing
- ✓ Toolbar components — DateNavigation, ViewSelector, CalendarToolbar with render slots — existing
- ✓ Type system — event, calendar, interaction, resource, config, plugin, theme types — existing
- ✓ CSS custom properties — `--cal-*` variables for theming — existing
- ✓ Multi-entry build — tsup with subpath exports for tree-shaking — existing

### Active

<!-- Current scope. Building toward these. All are hypotheses until shipped and validated. -->

- [ ] MonthView — day grid with week rows, day cells, event chips, overflow indicator (+N more)
- [ ] DayView — single-day time grid reusing week view internals
- [ ] TimelineView — horizontal timeline with resource sidebar, time header, event lanes
- [ ] ListView — sorted event list with date grouping
- [ ] Resource system — resource rows, two-level grouping, resource filtering
- [ ] Virtualization — only render visible rows/columns, handle 1000+ events and 100+ resources
- [ ] Zustand selector optimization — fine-grained subscriptions, no wasted re-renders across views
- [ ] Drag & drop — move events between slots/resources, snap-to-grid, drag ghost + time tooltip
- [ ] Event resize — drag edges to change duration, snap feedback
- [ ] Slot selection — click/drag to select time range for creating events
- [ ] Event click — click to trigger callback with event + native event info
- [ ] Context menus — right-click on events, slots, and resources with consumer-defined items
- [ ] Multi-select — Cmd+click to select multiple events, batch action toolbar
- [ ] Keyboard navigation — T/D/W/M view shortcuts, arrow nav, Enter to select, Esc to cancel
- [ ] Skeleton loading — progressive rendering with shimmer bars while events load
- [ ] Search & filter bar — client-side event search and filter with pills
- [ ] Smart drag feedback — time tooltip, ghost event, drop validity (green/red), resource change label
- [ ] Full theming system — CSS vars + classNames prop + dark mode via `.dark` class
- [ ] Now indicator — current time line with subtle pulse
- [ ] Business hours overlay — shaded non-business hours
- [ ] All-day events — rendered in separate header row above time grid

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Plugin API — skip for MVP, build when needed (interface is already typed)
- Undo/redo — adds complexity, defer to post-MVP
- Minimap — nice-to-have, not MVP
- Zoom & time scale — defer to post-MVP
- URL state sync — consumer concern, not library
- Print CSS — defer to post-MVP
- Mobile swipe/pinch gestures — focus on desktop-first MVP
- Preview panel — consumer can build with existing render slots
- External drag sources — complex, defer to post-MVP
- Auto-scheduling engine — out of scope entirely
- Animations — defer to post-MVP (focus on stability first)

## Context

This package is being built to replace FullCalendar v6.1.8 in Aviatize, an aviation operations platform. FullCalendar's problems: 300-400KB bundle, premium license cost, unmemoized re-renders, no virtualization, 25+ `!important` CSS overrides, timezone bugs.

The existing codebase has a solid foundation from phases 1.1-1.3: date utilities, slot generation, store with navigation, event filtering/positioning, WeekView, and EventBlock. 118 tests cover the foundation.

The MVP must be a drop-in replacement for at least one Aviatize calendar view. The architecture follows a Provider-Store-Views pattern with Context holding immutable config and Zustand managing mutable state.

## Constraints

- **Tech stack**: React 18+, TypeScript 5.7+, Tailwind CSS, Zustand 5, date-fns 4, @tanstack/react-virtual 3
- **Bundle size**: <50KB gzipped total — no heavy dependencies
- **Performance**: <150ms initial render with 200 events, <16ms drag feedback, 500+ resource rows without jank
- **Build**: tsup multi-entry — views must be independently importable, no cross-view imports
- **CSS**: All classes prefixed `pro-calendr-react-*`, theming via `--cal-*` custom properties
- **Testing**: 80% statement/function/line coverage, 75% branch coverage
- **No domain logic**: Package is general-purpose — all business logic lives in consumer

## Key Decisions

| Decision                                   | Rationale                                                                                | Outcome   |
| ------------------------------------------ | ---------------------------------------------------------------------------------------- | --------- |
| Zustand over Redux/Context                 | Minimal API, selector-based subscriptions prevent re-renders, tiny bundle                | — Pending |
| date-fns over dayjs/luxon                  | Tree-shakeable, timezone support via date-fns-tz, no mutable API                         | — Pending |
| @tanstack/react-virtual for virtualization | Battle-tested, small bundle, works with CSS Grid                                         | — Pending |
| CSS Grid for layout                        | Browser-native, hardware-accelerated, no JS layout math                                  | — Pending |
| No plugin API in MVP                       | Focus on stability and core features first, plugin types already defined                 | — Pending |
| Skip animations for MVP                    | Performance and stability first, animations can layer on top later                       | — Pending |
| Context + Store split                      | Context = immutable config (events, callbacks), Store = mutable state (view, date, drag) | — Pending |

---

_Last updated: 2026-02-16 after initialization_
