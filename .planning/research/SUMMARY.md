# Project Research Summary

**Project:** @pro-calendr-react/core - React Calendar Component Library
**Domain:** High-performance scheduler/calendar library with resource management
**Researched:** 2026-02-16
**Confidence:** HIGH

## Executive Summary

This is a React calendar library positioned as a modern replacement for FullCalendar, targeting professional scheduling applications with resource management (timelines), large datasets (100+ resources, 1000+ events), and advanced interactions (drag-and-drop, keyboard navigation, multi-select). The recommended approach centers on three core differentiators: virtualization using @tanstack/react-virtual (FullCalendar lacks this entirely), headless API exports for full customization, and surgical Zustand state management to prevent re-render cascades. These differentiators directly address the pain points that drive users away from FullCalendar: performance degradation with large datasets, poor bundle size with premium plugins, and limited customization without fighting CSS specificity.

The architecture is sound—Zustand store for mutable state, React Context for consumer props, pure utilities with zero React imports, and multi-entry tsup builds for tree-shaking. The existing foundation (WeekView, EventBlock, store, date-utils, slot generation) is architecturally correct but incomplete. Missing pieces include collision layout for overlapping events, timezone-aware date handling using TZDate, store slicing for fine-grained subscriptions, and pointer-event-based drag engine. Stack additions are minimal: @floating-ui/react for context menus/popovers, clsx for class composition. No drag-and-drop library needed—custom pointer events are the industry pattern for calendar DnD.

Key risks center on performance traps and timezone handling. The critical pitfalls are: (1) Zustand over-subscription causing 60fps re-renders during drag, (2) drag state machine missing edge cases (right-click, tab-switch, touch interruptions), (3) multi-day event layout in MonthView requiring lane allocation algorithm, (4) timezone handling via local Date objects causing silent data corruption across DST boundaries, (5) collision algorithm missing transitive overlap groups, (6) virtualization breaking drag targets and keyboard navigation, and (7) CSS custom properties without coherent theming strategy. All are preventable with upfront architectural discipline—addressed in Phase 1 (foundation refactor) before building more views.

## Key Findings

### Recommended Stack

The existing stack (React 18/19, TypeScript, date-fns, Zustand, @tanstack/react-virtual, tsup, Tailwind, Vitest, Storybook) remains correct and requires only two additions. **Add @floating-ui/react (^0.27.0)** for positioning context menus, event popovers, and tooltips—it's the industry standard (used by Radix UI, shadcn/ui), headless (fits the library's philosophy), lightweight (~5KB), and solves flip/shift/overflow detection that would otherwise be reinvented. **Add clsx (^2.1.0)** for conditional class composition—the project currently uses raw string concatenation which becomes unmaintainable as views multiply; clsx is 239 bytes gzipped and 3x faster than classnames.

**Core technologies:**
- **Custom pointer events (NO library)**: Calendar drag-and-drop needs time-snapping and resource-lane awareness that generic DnD libraries (dnd-kit, pragmatic-drag-and-drop) don't provide. FullCalendar, react-big-calendar, and Schedule-X all use custom pointer event implementations. Pointer Events API is mature, handles mouse/touch/pen in a single code path, and the store already defines DragState types. Bundle size = 0.
- **@floating-ui/react**: Floating element positioning for context menus, event popovers, tooltips. Headless, accessible (ARIA), 5KB gzipped, actively maintained.
- **clsx**: Conditional class name composition. 239 bytes gzipped, 3x faster than classnames. Critical for maintainable multi-view rendering with drag states, selection states, density modes.

**What NOT to add:**
- **@dnd-kit/core** (frozen since Dec 2024, maintainer rewriting as @dnd-kit/react which is pre-stable 0.x)
- **react-dnd** (legacy, HTML5 backend has touch issues)
- **tailwind-merge** (as library dependency—adds ~12KB; let consumers add their own cn() if needed)
- **react-loading-skeleton** (20 lines of CSS; use Tailwind animate-pulse)
- **Radix UI primitives** (would impose markup structure on consumers)

### Expected Features

**Must have (table stakes):**
- All 5 views (week, day, month, list, timeline) — users expect Google Calendar / Outlook feature parity
- Event drag & drop — users assume they can reschedule by dragging
- Event resize — users expect to change duration by dragging edges
- Slot selection — click/drag empty space to create events
- All-day events — multi-day events in header row with overflow handling
- Now indicator — red line showing current time
- Business hours overlay — shaded non-working hours
- Resource system — timeline requires resource rows with grouping/filtering
- Virtualization — handle 100+ resources and 1000+ events without jank (FullCalendar's #1 missing feature)
- Dark mode + theming — CSS custom properties + classNames prop
- Keyboard navigation — arrow keys, shortcuts, roving tabindex for WCAG compliance
- Timezone support — TZDate for display vs data timezone handling, DST boundaries

**Should have (competitive advantage):**
- Headless mode (hooks + store export) — no other full-featured calendar offers this
- Render slots (eventContent, resourceLabel, toolbarLeft/Center/Right) — more flexible than FullCalendar
- Surgical Zustand selectors — prevent re-render cascades from react-big-calendar's class-component architecture
- Small bundle size (<50KB) — FullCalendar with plugins is 150-300KB
- Multi-select with batch actions — almost no calendar library supports Cmd/Ctrl+click multi-select
- Context menus — declarative contextMenu prop on events, slots, resources
- Smart drag feedback — time tooltip, drop validity (green/red), resource change label
- Search & filter bar — no open-source calendar ships built-in client-side search
- Conflict detection — visual indicators for scheduling conflicts, custom validators
- Event density adaptation — auto-adjust display (micro/compact/full) based on available space

**Defer (v2+):**
- Built-in recurring events (RRULE) — deceptively complex, conflates data with display; consumers use rrule library to expand recurrences before passing to calendar
- Built-in event editor/form — every app has different schemas; provide onEventClick callback, consumer renders their own editor
- Built-in data fetching — varies wildly (REST/GraphQL/real-time); consumer fetches, passes events array
- Real-time/WebSocket sync — infrastructure-specific; consumer manages connection, updates events prop
- Animation system — interferes with virtualization performance
- URL state sync — router-specific; consumer syncs onViewChange/onDateRangeChange to their router
- Undo/redo — consumer data management; onEventDrop/onEventResize provide revert() function
- Print/PDF export — complex, rarely used; consumer concern
- Mobile touch gestures — desktop-first MVP; defer pinch-to-zoom, long-press drag optimization
- External drag sources — complex API surface; consumer uses onSelect callback
- Non-Gregorian calendar systems (Hijri, Jalaali) — niche audience, significant complexity
- Minimap — niche for very large timelines

### Architecture Approach

The architecture is centered on separation of concerns: consumer props flow through React Context (events, resources, callbacks, render slots), mutable internal state flows through Zustand store (view, date, selection, drag), and pure computation lives in utils/ (date math, event filtering, collision layout). Views never import from other views—each is a separate tsup entry for tree-shaking. The store should be sliced into domain slices (navigation, interaction, resource, UI) composed into a single store, with every component subscribing via atomic selectors to prevent re-render cascades. Drag-and-drop uses custom pointer events (pointerdown, pointermove, pointerup) with setPointerCapture and requestAnimationFrame throttling. Timeline virtualization uses @tanstack/react-virtual with dual-axis virtualization (vertical resource rows, horizontal time columns). Event collision layout uses a sweep-line algorithm for transitive overlap groups, assigning columns and widths within collision groups.

**Major components:**
1. **CalendarProvider** — React Context holding immutable config (events, resources, callbacks, render slots), syncs defaults to store on mount only
2. **Zustand Store (sliced)** — navigation slice (view, date, dateRange), interaction slice (selection, dragState, hoveredSlot, multiSelect), resource slice (filteredResourceIds, collapsedGroups), UI slice (sidebarWidth, zoomLevel, compactMode)
3. **CalendarBody** — view router reading store.currentView, rendering the correct view component, bridging context config to view props
4. **View components** — WeekView (exists), DayView (reuses WeekView internals as single column), MonthView (6x7 grid with lane allocation for multi-day events), ListView (filtered/grouped list), TimelineView (horizontal time axis with resource rows, dual-axis virtualization)
5. **Shared subsystems** — drag engine (useDrag hook with pointer events + snap-to-grid), selection engine (useSelection with time-range selection), keyboard navigation (useKeyboard with roving tabindex), collision layout (utils/collision.ts sweep-line algorithm), virtualization (useVirtualization wrapping @tanstack/react-virtual)
6. **Pure utilities** — date-utils (TZDate-based), event-filter, event-position, slot, snap, grid, collision, conflict

**Key architectural patterns:**
- **Zustand store slicing with fine-grained selectors**: Split monolithic store into domain slices, use atomic selectors (useCalendarStore(s => s.currentView)) not destructuring
- **Pointer-events-based drag engine**: Use pointerdown/move/up with setPointerCapture, throttle via requestAnimationFrame, snap to grid using slot utilities
- **Dual-axis virtualization for timeline**: Two virtualizer instances (row, column) sharing scroll container, filter events per-resource per-visible-time-range
- **Collision layout algorithm (column packing)**: Sort events by start/end, build transitive overlap groups, assign columns greedily, calculate width = 1/totalColumns
- **Roving tabindex for keyboard navigation**: Track focusedCell in store, only one element has tabIndex={0}, arrow keys move focus and scroll viewport

### Critical Pitfalls

1. **Zustand Store Over-Subscription Causing Cascade Re-Renders** — Components subscribe to entire store or return new objects from selectors, causing every component to re-render on any state change. During drag (60fps updates), this freezes the calendar. **Prevention:** Use atomic selectors (useCalendarStore(s => s.dragState)), useShallow for objects, split high-frequency state (dragState) from low-frequency (currentView). **Address in Phase 1.**

2. **Drag-and-Drop State Machine Missing Edge Cases** — Drag gets stuck in "dragging" state from right-click during drag, pointerup outside viewport, touch-and-hold triggering OS menu, tab switch, Escape key not canceling, or drag-vs-click ambiguity (FullCalendar's \_def undefined crash). **Prevention:** Model drag as explicit state machine (idle -> pending -> dragging -> dropping -> idle), use setPointerCapture for reliable pointerup, listen for blur/visibilitychange/contextmenu/Escape as cancellation triggers, require 3-5px movement threshold before initiating drag. **Address in Phase 3.**

3. **Multi-Day Event Rendering in Month View Causes Layout Explosions** — 5-day event spanning week boundary must render as two connected segments (one ending at week-end, one starting at week-start) using lane allocation algorithm, not duplicate blocks or absolute positioning. **Prevention:** Pre-process events into visual segments clipped to week-row boundaries, allocate lanes via greedy packing (longest events first), set max visible lanes with "+N more" overflow, use CSS Grid grid-column: span N not absolute positioning. **Address in Phase 2.**

4. **Timezone Handling via Local Date Objects Causes Silent Data Corruption** — All date operations use browser-local new Date(), causing events to render at wrong times for users in different timezones, and dragging changes the time by the timezone offset. DST transitions cause events at 2:30am spring-forward to not exist, events at 1:30am fall-back to exist twice. **Prevention:** Use TZDate from @date-fns/tz with calendar's timezone prop, retrofit date-utils.ts to accept timezone context, test with DST boundary dates (March 8, November 1 2026). **Address in Phase 1.**

5. **Event Collision/Overlap Algorithm Missing Transitive Groups** — Events A-B overlap, B-C overlap, A-C do not overlap; naive pairwise comparison renders B at 50% width conflicting with A or C. Correct algorithm groups A-B-C transitively, all at 33% width. **Prevention:** Build collision groups using sweep-line or union-find, assign columns greedily within groups, calculate width = 1/totalColumns, test with A-B-C transitive case and "staircase" pattern. **Address in Phase 2.**

6. **Virtualization Breaks Scroll Position, Drag Targets, and Keyboard Navigation** — Virtualizing resource rows means drag-to-off-screen-resource has no DOM target, keyboard arrow-down from last visible row loses focus, scroll-to-resource scrolls to wrong offset with dynamic heights. **Prevention:** Use scrollToIndex() for programmatic scroll, maintain virtual drop zone map (pixel coordinates to resource IDs without DOM), integrate keyboard handler with virtualizer to scroll before focusing, measure dynamic heights with measureElement callback. **Address in Phase 5.**

7. **CSS Custom Properties Without Fallback Chains Break Consumer Overrides** — Variables added ad-hoc without centralized token system, different naming conventions, specificity creeps up, dark mode uses .dark parent class conflicting with consumer's Tailwind dark: modifier. **Prevention:** Define ALL variables in single tokens.css with naming convention --cal-{category}-{property}, every property has fallback (var(--cal-border, #e5e7eb)), flat specificity (single-class selectors), dark mode via [data-theme="dark"] on calendar root, never use !important. **Address in Phase 1.**

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation Refactor
**Rationale:** Four critical pitfalls (Zustand over-subscription, timezone handling, CSS theming, event array reference instability) must be resolved before building more views. Every view built on broken timezone handling or unsliced store compounds technical debt exponentially. The existing WeekView works but exposes these architectural flaws that will cascade.

**Delivers:**
- Zustand store sliced into navigation/interaction/resource/UI slices with atomic selectors
- date-utils.ts retrofitted to use TZDate with timezone context (from @date-fns/tz)
- CSS custom properties centralized into tokens.css with coherent naming and fallbacks
- Dark mode via [data-theme="dark"] on calendar root, not .dark parent class
- Event array reference stability handling (useMemo guidance, ID-based comparison)
- CalendarProvider optimization to split stable config from volatile data contexts

**Addresses:**
- Table stakes: timezone support, dark mode + theming
- Pitfalls #1, #4, #7 (over-subscription, timezone, CSS theming)

**Avoids:** Building 4 more views (day, month, list, timeline) on top of broken foundation that requires rewriting all of them later

**Research flag:** Standard patterns—Zustand slices, TZDate, CSS tokens are well-documented

---

### Phase 2: Collision Layout & DayView/MonthView
**Rationale:** Collision layout is a pure function in utils/collision.ts with zero UI dependencies—implement and test it first as a prerequisite for any view showing overlapping timed events. DayView reuses WeekView internals (single-column time grid), minimal new code. MonthView introduces the multi-day event lane allocation challenge (Pitfall #3) which requires a different algorithm than collision layout.

**Delivers:**
- utils/collision.ts: sweep-line algorithm for transitive overlap groups, column assignment, width calculation
- DayView as single-column WeekView (extract shared TimeSlotColumn to components/)
- MonthView with 6x7 grid, multi-day event lane allocation, "+N more" overflow indicator
- All-day events header row for WeekView/DayView
- Now indicator (horizontal line in time grids, auto-updates)
- Business hours overlay (shaded time slots outside configured hours)

**Addresses:**
- Table stakes: day view, month view, all-day events, now indicator, business hours
- Pitfalls #3, #5 (multi-day layout, collision algorithm)

**Uses:**
- clsx for conditional classes (multi-day spanning, overflow states)
- Sliced store from Phase 1 (navigation slice for dateRange, view switching)

**Implements:**
- Collision layout algorithm (architecture component)
- MonthView with lane allocation (architecture component)

**Research flag:** Multi-day lane allocation needs validation—standard calendar pattern but implementation details vary; consider research-phase for MonthView lane algorithm if not confident after collision layout is done

---

### Phase 3: Drag & Drop Engine
**Rationale:** Drag is the highest-complexity interaction and the most visible feature after views. It depends on collision layout (events must render correctly before they can be dragged) and the sliced store (drag state updates at 60fps). Pitfall #2 (drag state machine) is critical—this phase must implement the state machine from the start, not bolt it on later.

**Delivers:**
- useDrag hook: pointer events (pointerdown/move/up), setPointerCapture, requestAnimationFrame throttling
- Drag state machine: idle -> pending (< 3px movement) -> dragging -> dropping -> idle
- DragLayer component: ghost overlay following cursor, time tooltip, drop validity indicator
- Snap-to-grid utility: converts pixel positions to time slots
- Drop validation: plugin integration (validateDrop), consumer callback with revert()
- useResize hook: extends drag engine for event edge handles
- Cross-view drag support: week/day/month views all support drag
- Edge case handling: right-click, tab-switch, Escape, blur, visibilitychange cancellation

**Addresses:**
- Table stakes: event drag & drop, event resize
- Should have: smart drag feedback (time tooltip, validity, resource change label)
- Pitfalls #2 (drag state machine edge cases)

**Uses:**
- Sliced store from Phase 1 (interaction slice for dragState, high-frequency updates)
- Collision layout from Phase 2 (dragged events must re-layout in drop position)

**Implements:**
- Drag engine (architecture subsystem)
- Resize as drag extension

**Research flag:** Standard patterns—pointer events drag is well-documented; no additional research needed

---

### Phase 4: Keyboard Navigation
**Rationale:** Keyboard navigation is a competitive differentiator (FullCalendar has basic tab-focus, react-big-calendar has open accessibility bugs) and a WCAG requirement. It must coordinate with drag system (Escape cancels drag) and selection system (Enter confirms selection), so it comes after drag is stable but before timeline (which introduces virtualization complexity).

**Delivers:**
- useKeyboard hook: roving tabindex pattern, arrow keys for cell navigation, shortcuts (T/D/W/M for views)
- focusedCell state in store (UI slice)
- Focus management across view transitions (maintain focused date when switching views)
- ARIA attributes: role="grid", role="row", role="gridcell" on time grid
- Visible focus indicators: 2px outline on focused cell (WCAG 2.4.7)
- Escape key integration: cancel drag, close popover, deselect
- Enter/Space integration: activate cell (open event, confirm selection)

**Addresses:**
- Table stakes: keyboard navigation
- Should have: comprehensive shortcuts + arrow nav (differentiator)

**Uses:**
- Sliced store from Phase 1 (UI slice for focusedCell)
- Drag engine from Phase 3 (Escape cancels drag)

**Implements:**
- Keyboard navigation subsystem (architecture component)

**Research flag:** Standard patterns—WAI-ARIA grid pattern is well-documented; React Aria Calendar as reference

---

### Phase 5: ListView & Resource System
**Rationale:** ListView is the simplest view (filtered/grouped event list, no positioning complexity), ship it before timeline. Resource system (types, grouping, filtering, collapse state) is a prerequisite for TimelineView but can be architected independently as a store slice and context integration.

**Delivers:**
- ListView: chronological flat list grouped by date, uses event-filter utils
- Resource types: CalendarResource, CalendarResourceGroup, ResourceConfig
- Resource store slice: filteredResourceIds, collapsedGroups, resourceSearch
- useResources hook: grouping by groupId, sorting by order, filtering
- Resource context integration: resources + resourceGroups props on Calendar

**Addresses:**
- Table stakes: list view, resource system (required for timeline)

**Uses:**
- Sliced store from Phase 1 (resource slice)
- Event filtering from existing utils

**Implements:**
- Resource system (architecture component)

**Research flag:** Standard patterns—resource grouping, filtering, collapse state are straightforward; no additional research needed

---

### Phase 6: TimelineView & Virtualization
**Rationale:** Timeline is the most complex view, requiring resource system (Phase 5), dual-axis virtualization, horizontal time axis, and cross-resource drag (extends Phase 3 drag engine). Virtualization introduces Pitfall #6 (breaks drag targets, keyboard nav, scroll position), so it comes after keyboard navigation (Phase 4) and drag (Phase 3) are stable—those systems must be retrofitted to be virtualization-aware.

**Delivers:**
- TimelineView: horizontal time axis with resource rows, dual-axis virtualization
- ResourceSidebar: left panel with resource names/groups, collapsible groups, synchronized vertical scroll
- useVirtualization hook: wraps @tanstack/react-virtual for both axes
- Virtual drop zone map: pixel coordinates to resource IDs without DOM dependency
- Keyboard navigation + virtualization integration: scrollToIndex() before focusing
- Horizontal time column virtualization: only render visible time slots
- Vertical resource row virtualization: only render visible resource lanes (100+ resources)
- Cross-resource drag: event dragged from Resource A to Resource B updates resourceIds
- Drag-to-off-screen-resource: auto-scroll with virtual drop zones

**Addresses:**
- Table stakes: timeline view, virtualization (core differentiator), resource system integration
- Should have: small bundle size maintained via tree-shaking (timeline is separate entry)
- Pitfalls #6 (virtualization breaking interactions)

**Uses:**
- @tanstack/react-virtual (existing dependency)
- Resource system from Phase 5
- Drag engine from Phase 3 (extend for cross-resource, virtual drop zones)
- Keyboard navigation from Phase 4 (integrate with scrollToIndex)

**Implements:**
- Dual-axis virtualization (architecture subsystem)
- TimelineView (architecture component)

**Research flag:** Consider research-phase for TimelineView—dual-axis virtualization + resource drag is complex, FullCalendar implementation as reference but not directly applicable due to virtualization difference

---

### Phase 7: Context Menus & Multi-Select
**Rationale:** Polish features that depend on stable interaction foundation. Context menus use @floating-ui/react for positioning. Multi-select extends selection system from earlier phases. Both are competitive differentiators but not blockers for v1 launch.

**Delivers:**
- useContextMenu hook: @floating-ui/react integration, positioning at pointer coordinates
- Context menu system: declarative contextMenu prop on events/slots/resources
- Plugin context menu items: plugin system can inject menu items
- useMultiSelect hook: Cmd/Ctrl+click for multi-select, Shift-click for range select
- Batch actions toolbar: floating action bar appears when events selected
- Multi-select state in store (interaction slice)

**Addresses:**
- Should have: context menus (declarative prop + plugin injection), multi-select with batch actions (differentiator)

**Uses:**
- @floating-ui/react (added in Phase 1 setup)
- Sliced store from Phase 1 (interaction slice for multiSelect state)
- Plugin system integration (typed but not yet runtime-implemented)

**Implements:**
- Context menu system (architecture component)
- Multi-select system (architecture component)

**Research flag:** Standard patterns—@floating-ui/react docs cover context menu positioning, multi-select is Cmd/Ctrl+click with Set-based selection state

---

### Phase 8: Search/Filter Bar & Conflict Detection
**Rationale:** Post-MVP polish features. Search/filter bar is client-side filtering with filter pills. Conflict detection adds visual indicators to existing collision layout. Both are nice-to-have differentiators.

**Delivers:**
- FilterBarConfig: searchable, searchFields, filterGroups, persistKey
- useFilteredEvents hook: client-side search + filter pills
- Search bar UI component: input + filter pill chips
- Conflict detection: ConflictDetectionConfig with customValidator, highlightConflicts, showConflictCount
- Conflict visual indicators: badges, count indicators on overlapping events
- Conflict validation: plugin system integration for custom validators

**Addresses:**
- Should have: search & filter bar (differentiator), conflict detection (visual indicators + custom validators)

**Uses:**
- Event filtering utils (extend existing utils/event-filter.ts)
- Collision layout from Phase 2 (conflict detection builds on overlap detection)

**Implements:**
- Search/filter system (architecture component)

**Research flag:** Standard patterns—client-side filtering is straightforward

---

### Phase Ordering Rationale

- **Phase 1 first (Foundation):** Zustand over-subscription, timezone handling, and CSS theming are architectural flaws that compound with every new view. Fix before building day/month/list/timeline views.
- **Phase 2 before Phase 3 (Views before Drag):** Collision layout must be correct before events can be dragged (drag relies on re-layout in drop position). MonthView's multi-day lane allocation is independent of drag.
- **Phase 3 before Phase 4 (Drag before Keyboard):** Keyboard navigation must integrate with drag (Escape cancels drag), so drag state machine comes first.
- **Phase 4 before Phase 6 (Keyboard before Virtualization):** Keyboard navigation must be retrofitted to work with virtualization (scrollToIndex integration), easier to adapt existing keyboard system than build it virtualization-aware from scratch.
- **Phase 5 before Phase 6 (Resource System before Timeline):** Timeline is unusable without resource data model; build and test resource grouping/filtering independently first.
- **Phase 6 late (Timeline + Virtualization):** Most complex view, depends on resource system (Phase 5), drag engine (Phase 3), and keyboard navigation (Phase 4) all being stable and virtualization-aware.
- **Phase 7-8 last (Polish Features):** Context menus, multi-select, search, conflict detection are competitive differentiators but not MVP blockers; ship after core views and interactions are stable.

This ordering avoids Pitfall #1 (over-subscription) and Pitfall #4 (timezone) cascading into Phases 2-8, avoids Pitfall #3 (multi-day layout) and Pitfall #5 (collision algorithm) breaking drag in Phase 3, and avoids Pitfall #6 (virtualization breaking interactions) by building drag and keyboard systems first then adapting them for virtualization.

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 2 (MonthView):** Multi-day event lane allocation algorithm—standard pattern but implementation details vary; verify approach with FullCalendar/Google Calendar reference implementations before building
- **Phase 6 (TimelineView):** Dual-axis virtualization with synchronized scroll, virtual drop zones, horizontal time axis—complex integration; consider research-phase for TanStack Virtual advanced usage and FullCalendar timeline architecture

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Foundation):** Zustand slices, TZDate, CSS tokens are well-documented with official docs
- **Phase 3 (Drag & Drop):** Pointer events drag pattern is well-documented; state machine is standard CS pattern
- **Phase 4 (Keyboard Navigation):** WAI-ARIA grid pattern has official spec, React Aria Calendar as reference
- **Phase 5 (ListView & Resource System):** Resource grouping/filtering is straightforward state management
- **Phase 7 (Context Menus):** @floating-ui/react has comprehensive docs for context menu positioning
- **Phase 8 (Search/Filter):** Client-side filtering is standard React patterns

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Verified all versions via npm registry; @floating-ui/react and clsx choices backed by ecosystem usage (1400+ dependents each); custom pointer events pattern validated by FullCalendar, react-big-calendar, Schedule-X all using the same approach; dnd-kit maintenance status confirmed via GitHub issue #1194 |
| Features | HIGH | Feature analysis based on 8 major competitors (FullCalendar, react-big-calendar, Schedule-X, DHTMLX, Bryntum, Syncfusion, DayPilot, Mobiscroll); table stakes vs differentiators derived from FullCalendar issue #5673 (virtualization), react-big-calendar issue #2255 (architecture), Schedule-X pricing (drag/resize premium); anti-features informed by FullCalendar complexity and Nylas RRULE analysis |
| Architecture | HIGH | Architecture derived from codebase analysis (all source files read, existing store/context/views/utils structure validated) + verified ecosystem patterns (Zustand slices, TanStack Virtual, Pointer Events drag); FullCalendar timeline, react-big-calendar DnD architecture as reference; React Aria Calendar for accessibility patterns |
| Pitfalls | HIGH | All 7 critical pitfalls sourced from actual GitHub issues: FullCalendar #57, #32, #5673, #192, #7066; react-big-calendar #1902, #2601, #1397; Zustand #2642; date-fns #1788; verified with maintainer comments and reproduction steps; timezone pitfall (#4) explicitly mentioned in project context as "FULLCALENDAR SEEMS TO DO VERY WONKY THINGS HERE" |

**Overall confidence:** HIGH

### Gaps to Address

- **Multi-day event lane allocation algorithm details**: Standard pattern (longest events first, greedy packing) but implementation for week-spanning events crossing row boundaries needs validation with reference implementations (FullCalendar MonthView, Google Calendar) during Phase 2 planning—consider focused research-phase if not confident
- **TanStack Virtual dual-axis performance**: Documented pattern but timeline with 100+ resources x 168 time slots (week at hourly) = 16,800 cells; need to verify overscan settings, measureElement dynamic height handling, and scroll synchronization between sidebar and grid during Phase 6 implementation—prototype early
- **TZDate migration strategy**: @date-fns/tz TZDate is new in date-fns v4; need to verify all edge cases (DST boundaries, leap seconds, timezone string parsing) with comprehensive test suite during Phase 1 retrofit—plan for DST boundary test fixtures (March 8, November 1 2026 US)
- **Plugin system runtime implementation**: CalendarPlugin types are defined but createPlugin is pass-through; actual plugin registry, lifecycle (mount/unmount), timeline band injection, context menu item aggregation needs architecture during Phase 7—defer until core features stable
- **SSR / hydration strategy**: Calendar renders timezone-dependent times; server (UTC) vs client (local) timezone causes hydration mismatch in Next.js; suppressHydrationWarning + useEffect-deferred rendering documented but needs testing during Phase 6+ (not MVP blocker)

## Sources

### Primary (HIGH confidence)
- npm registry (all package versions verified via npm view as of 2026-02-16)
- Zustand Official Docs (slices pattern, useShallow, selectors and re-rendering)
- TanStack Virtual Official Docs (introduction, API reference, grid usage)
- @floating-ui/react Official Docs (hooks API, positioning middleware)
- WAI-ARIA Authoring Practices Guide (calendar patterns, grid pattern, keyboard interface)
- React Aria Calendar (Adobe React Spectrum) — accessibility patterns reference
- date-fns v4 TZDate announcement (blog.date-fns.org)
- FullCalendar Official Docs (views, interactions, resources, accessibility, premium plugins, roadmap)
- Codebase analysis (direct reading of all source files in packages/core/src/)

### Secondary (MEDIUM confidence)
- FullCalendar GitHub Issues (#57 re-rendering, #32 eventRender, #5673 virtualization, #192 StrictMode, #7066 state issues, #7029 bundle size, #7322 virtual rendering request, #4889/#4890 scroll sync)
- react-big-calendar GitHub Issues (#1902 drag stuck, #2601 all-day drag, #1397 overlap, #2498 accessibility, #1753 keyboard, #2255 rewrite discussion, #2701 React 19 support) + Pull Requests (#2230 auto-scroll, #1066 touch drag)
- dnd-kit maintenance discussion (GitHub issue #1194 — maintainer confirmed rewrite, old API frozen; discussion #1842 — no stability timeline for @dnd-kit/react)
- Zustand community discussions (GitHub #2496 multiple stores, #2642 unexpected re-renders)
- date-fns timezone issues (#1788, #1682, #1657 DST handling)
- date-fns-tz DST bug (issue #227)
- Schedule-X Documentation (views, resize plugin premium, drag-and-drop plugin premium)
- DHTMLX React Scheduler Docs (10 views, real-time)
- Bryntum React Scheduler (enterprise features)
- DayPilot Event Multi-Selecting Docs (Ctrl+click)
- Puck: Top 5 DnD Libraries for React 2026 (ecosystem overview)
- npm-compare: clsx vs classnames (benchmark data)
- tailwind-merge discussion #243 (performance vs clsx)
- TkDodo: Working with Zustand (selector best practices)
- Medium: Pointer Events DnD in React (Jan 2026, custom pattern validation)
- Medium: TanStack Virtual Optimizes 1000s of Items (performance analysis)
- Nolan Lawson: High-Performance Input Handling on the Web (rAF throttling)

### Tertiary (LOW confidence)
- Best React Scheduler Components 2025-2026 Comparison (DHTMLX blog) — feature matrix across 5 libraries, promotional but factual
- Nylas: Calendar Events RRULES (why recurring events are complex) — not calendar-library-specific but relevant to anti-features
- Saturn Cloud: Calendar Event Overlap Algorithm (visualization) — generic algorithm reference
- Snook.ca: Calendar CSS Grid Layout — generic CSS pattern
- CSS-Tricks: Dark Mode and Multiple Color Themes in React — generic theming pattern
- Medium: React Drag and Drop Using Pointer Events (Leonardo Bruno Lima) — pattern reference, not library-specific
- DeepWiki pmndrs/zustand: Selectors and Re-rendering — community wiki, not official docs

---
*Research completed: 2026-02-16*
*Ready for roadmap: yes*
