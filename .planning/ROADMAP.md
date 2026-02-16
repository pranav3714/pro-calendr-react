# Roadmap: @pro-calendr-react/core

## Overview

This roadmap delivers a complete FullCalendar replacement across 8 phases, starting from an architectural foundation refactor (store slicing, timezone, theming) through all five views, interactions, virtualization, and polish features. The existing WeekView and EventBlock foundation from phases 1.1-1.3 is architecturally sound but needs hardening before additional views compound any latent issues. Every phase delivers a coherent, independently verifiable capability -- users can validate each phase completion by observing real calendar behavior.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Theming** - Harden store, timezone, and CSS architecture before building more views
- [x] **Phase 2: DayView, MonthView & Shared View Features** - Complete day/month views with all-day events, now indicator, and business hours
- [x] **Phase 3: Event Interactions** - Drag, resize, slot selection, and event click with full state machine
- [x] **Phase 4: Keyboard Navigation & Accessibility** - Arrow keys, shortcuts, roving tabindex, ARIA grid semantics
- [ ] **Phase 5: Resources & ListView** - Resource data model with grouping/filtering and chronological list view
- [ ] **Phase 6: TimelineView & Virtualization** - Horizontal timeline with resource rows, dual-axis virtualization for 1000+ events
- [ ] **Phase 7: Context Menus & Multi-Select** - Right-click menus on events/slots/resources and Cmd+click batch selection
- [ ] **Phase 8: Search, Conflict Detection & Loading States** - Client-side filtering, conflict indicators, and skeleton loading

## Phase Details

### Phase 1: Foundation & Theming
**Goal**: Calendar architecture is hardened so every subsequent view and feature builds on correct state management, timezone handling, and theming
**Depends on**: Nothing (first phase -- builds on existing codebase foundation)
**Requirements**: FNDTN-01, FNDTN-02, FNDTN-03, FNDTN-04, FNDTN-05, THME-01, THME-02, THME-03, THME-04
**Success Criteria** (what must be TRUE):
  1. Zustand store is sliced into domain slices (navigation, interaction, resource, UI) and components subscribe via atomic selectors -- changing drag state does not re-render the toolbar
  2. All date operations use TZDate with a timezone prop, and events render at correct times when calendar timezone differs from browser timezone, including across DST boundaries
  3. Every visual property in the calendar is controlled by a `--cal-*` CSS custom property with a fallback value, and no `!important` declarations exist in library CSS
  4. Setting `[data-theme="dark"]` on the calendar root toggles all elements to dark mode with complete variable coverage -- no unstyled elements remain
  5. Consumer can override any element class via the classNames prop (root, toolbar, event, resource, etc.)
**Plans**: 5 plans in 3 waves

Plans:
- [x] 01-01-PLAN.md -- Zustand store slices, factory, and dual React contexts (Wave 1)
- [x] 01-02-PLAN.md -- Hook and component migration to context-based store (Wave 1, depends on 01-01)
- [x] 01-03-PLAN.md -- TZDate migration and timezone-aware date utilities (Wave 2, TDD)
- [x] 01-04-PLAN.md -- CSS custom properties system, dark mode theming, inline style extraction (Wave 2)
- [x] 01-05-PLAN.md -- CalendarProvider useMemo optimization and classNames prop propagation (Wave 3)

### Phase 2: DayView, MonthView & Shared View Features
**Goal**: Users can view their events in day and month layouts with correct overlap handling, multi-day spanning, all-day event headers, current time indicator, and business hours shading
**Depends on**: Phase 1
**Requirements**: VIEW-01, VIEW-02, VIEW-03, VIEW-04, VIEW-08, VIEW-09, VIEW-10
**Success Criteria** (what must be TRUE):
  1. User can switch to DayView and see a single-day vertical time grid with hourly slots showing events at correct positions, including overlapping events rendered side-by-side with correct widths
  2. User can switch to MonthView and see a day grid with event chips in day cells, multi-day events spanning across days as connected lanes, and a "+N more" indicator when events overflow visible lanes
  3. All-day events appear in a dedicated header row above the time grid in both WeekView and DayView, separate from timed events
  4. A horizontal "now" line appears at the current time in all time-based views (Week, Day) and auto-updates its position
  5. Non-business hours are visually shaded in time-based views based on configurable business hours
**Plans**: 5 plans in 4 waves

Plans:
- [x] 02-01-PLAN.md -- Collision layout algorithm with TDD (Wave 1)
- [x] 02-02-PLAN.md -- Lane allocation algorithm + MonthView components with TDD (Wave 1)
- [x] 02-03-PLAN.md -- DayView + collision integration into TimeSlotColumn (Wave 2)
- [x] 02-04-PLAN.md -- AllDayRow extraction + CalendarBody view routing (Wave 3)
- [x] 02-05-PLAN.md -- NowIndicator + BusinessHours overlay (Wave 4)

### Phase 3: Event Interactions
**Goal**: Users can drag events to reschedule, resize events to change duration, click-drag to select time ranges, and click events to open details -- all with polished visual feedback and robust edge case handling
**Depends on**: Phase 2
**Requirements**: INTR-01, INTR-02, INTR-03, INTR-04, INTR-05, INTR-06, INTR-07, INTR-08, INTR-09, INTR-10, INTR-11
**Success Criteria** (what must be TRUE):
  1. User can drag an event to a different time slot and see it snap to the grid, with a ghost element following the cursor and the original shown semi-transparent at the source position
  2. During drag, a floating tooltip displays the new start/end time and time delta, and drop validity is indicated with green (valid) or red (invalid) based on consumer's validateDrop callback
  3. User can drag event edges to resize duration with snap feedback, and the event visually updates in real time
  4. User can click-drag on empty time slots to select a time range, triggering onSelect callback with the selected range
  5. Drag handles edge cases correctly: right-click during drag cancels, tab-switching cancels, Escape cancels, blur cancels, and a 3-5px movement threshold distinguishes click from drag
**Plans**: 3 plans in 3 waves

Plans:
- [x] 03-01-PLAN.md -- Interaction types, drag state machine slice, coordinate utils, CalendarProvider wiring, CSS (Wave 1)
- [x] 03-02-PLAN.md -- useEventInteractions drag/resize engine hook, EventBlock resize handles (Wave 2)
- [x] 03-03-PLAN.md -- Visual feedback components, SelectionOverlay, view integration, edge case handling (Wave 3)

### Phase 4: Keyboard Navigation & Accessibility
**Goal**: Users can navigate the entire calendar with keyboard only, with proper focus management, view shortcuts, and WCAG-compliant ARIA semantics
**Depends on**: Phase 3
**Requirements**: KBNV-01, KBNV-02, KBNV-03, KBNV-04, KBNV-05, KBNV-06, KBNV-07, KBNV-08
**Success Criteria** (what must be TRUE):
  1. User can navigate between time slots and events using arrow keys, with visible 2px focus indicators on the focused cell
  2. Pressing T, D, W, M switches to Today, Day, Week, Month views respectively, and shortcuts only fire when the calendar is focused (no global capture)
  3. Enter/Space activates the focused event (triggering onEventClick) or confirms a slot selection, and Escape cancels active drag, closes context menus, or clears selection
  4. Time grid views have correct ARIA attributes (role="grid", role="row", role="gridcell") with roving tabindex -- only one element has tabIndex={0} within the grid at any time
**Plans**: 3 plans in 2 waves

Plans:
- [x] 04-01-PLAN.md -- useRovingGrid hook, interaction slice focusedDate extension, focus indicator CSS (Wave 1)
- [x] 04-02-PLAN.md -- ARIA grid attributes and useRovingGrid wiring for all views (Wave 2)
- [x] 04-03-PLAN.md -- Keyboard shortcuts, Escape chain, and focus restoration on view switch (Wave 2)

### Phase 5: Resources & ListView
**Goal**: Calendar supports resource-based scheduling with grouping and filtering, and users can view events as a chronological list
**Depends on**: Phase 1
**Requirements**: RSRC-01, RSRC-02, RSRC-03, RSRC-04, RSRC-05, RSRC-06, VIEW-07
**Success Criteria** (what must be TRUE):
  1. Consumer can pass a CalendarResource array and events are organized by resource, with resources supporting two-level grouping via groupId
  2. User can filter visible resources by ID array, and resource groups are collapsible in the sidebar
  3. Consumer can customize resource labels and group headers via resourceLabel and resourceGroupHeader render slots
  4. User can switch to ListView and see events as a chronological sorted list grouped by date
**Plans**: 2 plans in 2 waves

Plans:
- [ ] 05-01-PLAN.md -- Resource data layer: store slice, buildResourceTree utility, useResources hook, CalendarConfig wiring (Wave 1)
- [ ] 05-02-PLAN.md -- ListView component with date grouping, event rows, CalendarBody routing, and CSS (Wave 2)

### Phase 6: TimelineView & Virtualization
**Goal**: Users can view resource schedules on a horizontal timeline that handles 100+ resources and 1000+ events without jank, with drag and keyboard navigation working correctly across virtualized rows
**Depends on**: Phase 3, Phase 4, Phase 5
**Requirements**: VIEW-05, VIEW-06, VIRT-01, VIRT-02, VIRT-03, VIRT-04, VIRT-05, VIRT-06
**Success Criteria** (what must be TRUE):
  1. User can switch to TimelineView and see resource rows on the left with a horizontal time axis, supporting day/week/month/year time scales
  2. Timeline resource rows and time columns are virtualized -- scrolling through 500+ resource rows maintains 60fps with no visible jank
  3. Calendar renders 1000+ events with initial render under 150ms (200 events benchmark) and maintains smooth scrolling
  4. Dragging an event to an off-screen resource works correctly via virtual drop zone map (no DOM dependency), and keyboard navigation scrolls virtualized rows into view before focusing
**Plans**: TBD

Plans:
- [ ] 06-01: TimelineView layout with resource sidebar and time axis
- [ ] 06-02: Dual-axis virtualization (resource rows + time columns)
- [ ] 06-03: Cross-resource drag with virtual drop zones
- [ ] 06-04: Keyboard + virtualization integration
- [ ] 06-05: Performance benchmarking and optimization

### Phase 7: Context Menus & Multi-Select
**Goal**: Users can right-click for contextual actions on events, slots, and resources, and can multi-select events for batch operations
**Depends on**: Phase 3, Phase 5
**Requirements**: CTXM-01, CTXM-02, CTXM-03, CTXM-04, CTXM-05, MSEL-01, MSEL-02, MSEL-03, MSEL-04
**Success Criteria** (what must be TRUE):
  1. User can right-click on events, empty slots, and resources to see consumer-defined context menus positioned correctly (avoiding viewport edges via @floating-ui/react)
  2. Context menus close on Escape, outside click, or item selection
  3. User can Cmd/Ctrl+click events to toggle multi-selection with visual highlight, and a floating batch actions toolbar appears when 2+ events are selected
  4. Consumer can define batch actions via multiSelect.batchActions prop and receives onSelectionChange callback with selected event array
**Plans**: TBD

Plans:
- [ ] 07-01: useContextMenu hook with @floating-ui/react positioning
- [ ] 07-02: Context menu integration (events, slots, resources)
- [ ] 07-03: Multi-select with Cmd/Ctrl+click and batch actions toolbar

### Phase 8: Search, Conflict Detection & Loading States
**Goal**: Users can search and filter events client-side, see visual indicators for scheduling conflicts, and experience smooth loading transitions
**Depends on**: Phase 2
**Requirements**: SRCH-01, SRCH-02, SRCH-03, SRCH-04, CNFL-01, CNFL-02, CNFL-03, CNFL-04, LOAD-01, LOAD-02, LOAD-03
**Success Criteria** (what must be TRUE):
  1. User can type in a search bar to filter events by title, with non-matching events fading to reduced opacity and active filters shown as removable pill elements
  2. Filter state persists to localStorage via configurable persistKey and restores on reload
  3. Overlapping events on the same resource display a visual conflict indicator (pulsing border or badge) with a count of conflicts, and consumers can provide a custom conflict validator
  4. Calendar renders a time grid skeleton with animated shimmer bars while loading, and events fade in with opacity transition when loading completes
**Plans**: TBD

Plans:
- [ ] 08-01: Search bar and client-side event filtering
- [ ] 08-02: Filter pills and localStorage persistence
- [ ] 08-03: Conflict detection and visual indicators
- [ ] 08-04: Skeleton loading states and transitions

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8

Note: Phase 5 depends only on Phase 1, so it could execute in parallel with Phases 2-4. However, sequential execution is recommended for a solo developer workflow. Phase 8 depends only on Phase 2, giving flexibility in ordering if needed.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Theming | 5/5 | Complete | 2026-02-16 |
| 2. DayView, MonthView & Shared View Features | 5/5 | Complete | 2026-02-16 |
| 3. Event Interactions | 3/3 | Complete | 2026-02-16 |
| 4. Keyboard Navigation & Accessibility | 3/3 | Complete | 2026-02-17 |
| 5. Resources & ListView | 0/2 | Not started | - |
| 6. TimelineView & Virtualization | 0/5 | Not started | - |
| 7. Context Menus & Multi-Select | 0/3 | Not started | - |
| 8. Search, Conflict Detection & Loading States | 0/4 | Not started | - |
