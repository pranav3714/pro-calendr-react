# Feature Research

**Domain:** React calendar/scheduler component library
**Researched:** 2026-02-16
**Confidence:** HIGH (based on analysis of FullCalendar, react-big-calendar, Schedule-X, DHTMLX, Bryntum, Syncfusion, DayPilot, Mobiscroll)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing any of these and the library is dismissed as incomplete. Every serious competitor ships all of these.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Multiple views (week, day, month, list)** | Every calendar library has them. Google Calendar, Outlook set user expectations. | MEDIUM | WeekView exists. Day, Month, List need implementation. Day should reuse WeekView internals (single-column). |
| **Timeline view (horizontal)** | Required for resource scheduling. FullCalendar's most popular premium feature. | HIGH | Horizontal time axis with resource rows. Critical for Aviatize replacement. Needs virtualization for 100+ resources. |
| **Event drag & drop** | Users expect to reschedule events by dragging. FullCalendar, react-big-calendar, Schedule-X, DHTMLX, Bryntum all support it. | HIGH | Snap-to-grid, ghost preview, time tooltip, cross-resource moves. DragState types already defined. |
| **Event resize** | Users expect to change event duration by dragging edges. All major competitors support it. | MEDIUM | Top/bottom edges in time grids, left/right edges for all-day/multi-day. EventResizeInfo type already defined. |
| **Slot selection (click/drag to create)** | Standard way to create new events. Google Calendar, Outlook, all competitors. | MEDIUM | Click or drag on empty slot to select time range. Selection type and SelectInfo already defined. |
| **All-day events** | Every calendar has them. Multi-day events spanning across day columns in a header row. | MEDIUM | Separate header row above time grid. Need overflow handling (+N more). |
| **Event click/hover callbacks** | Basic interactivity. All competitors. | LOW | EventClickInfo type exists. onEventClick callback wired. Add onEventHover. |
| **Now indicator** | Red/colored line showing current time. Google Calendar, FullCalendar, Schedule-X, DHTMLX all show it. | LOW | Horizontal line in time grid views, auto-updates. CSS var `--cal-now-indicator` already defined. |
| **Business hours overlay** | Shaded non-working hours. FullCalendar, DHTMLX, Syncfusion, Mobiscroll. | LOW | BusinessHours type already defined. Visual shading on time slots outside configured hours. |
| **Date navigation** | Prev/next/today buttons, title showing current range. Universal. | LOW | Already implemented (DateNavigation, ViewSelector, CalendarToolbar). |
| **View switching** | Toggle between views. Universal. | LOW | Already implemented via ViewSelector. |
| **Configurable time grid** | Slot duration, min/max time, first day of week, weekends toggle. | LOW | slotDuration, slotMinTime, slotMaxTime, firstDay, weekends props already defined. |
| **Event colors** | Per-event background, border, text colors. All competitors. | LOW | CalendarEvent type already has backgroundColor, borderColor, textColor. |
| **Loading state** | Show placeholder while events load. Professional feel. | LOW | Skeleton component already implemented with `loading` prop. |
| **Dark mode** | Standard in modern UI. Schedule-X, Bryntum, all modern libraries. | MEDIUM | `.dark` class toggles CSS variables. CalendarCSSVariables has `--cal-bg-dark`. Needs complete variable set for dark theme. |
| **CSS customization** | Override styles without fighting the library. Major pain point with FullCalendar (25+ `!important` overrides). | MEDIUM | `--cal-*` CSS variables + `classNames` prop + inline `style`. Already architected. |
| **Timezone support** | Events displayed in correct timezone. FullCalendar, DHTMLX, Syncfusion, Mobiscroll. | MEDIUM | `timezone` prop defined. date-fns-tz available. Must handle display vs data timezones. |
| **Locale/i18n** | Date formatting respects locale. All serious libraries. | LOW | `locale` and `hour12` props defined. date-fns has locale support built in. |
| **Ref API** | Programmatic control (navigate, set view, scroll). FullCalendar exposes extensive API. | LOW | CalendarRef already defined with getDate, getView, navigateDate, setView, scrollToTime, scrollToResource. |

### Differentiators (Competitive Advantage)

Features that set @pro-calendr-react/core apart from competitors. These are the reasons someone would choose this library over FullCalendar or react-big-calendar.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Virtualization (row/column windowing)** | Handle 1000+ events and 100+ resources without jank. FullCalendar has NO virtualization (open issue #5673). react-big-calendar has known performance issues with large datasets. This is the #1 differentiator. | HIGH | @tanstack/react-virtual already chosen. Virtualize time rows in week/day, resource rows in timeline, day cells in month. Must maintain smooth 60fps scrolling. |
| **Headless mode (hooks + store)** | No other full-featured calendar library offers a headless API. React Composable Calendar and use-lilius exist but are date-pickers, not full schedulers. Headless export enables consumers to build completely custom UIs. | MEDIUM | Already architected: `headless` entry point re-exports hooks and store. Hooks: useCalendar, useCalendarEvents, useDateNavigation, useDrag, useSelection, useVirtualization, useDensity, useKeyboard. |
| **Render slots (composable customization)** | Full control over event rendering, resource labels, toolbar regions, group headers. FullCalendar uses render hooks but they're clunky. react-big-calendar uses component overrides but misses many slots. | MEDIUM | eventContent, resourceLabel, resourceGroupHeader, toolbarLeft/Center/Right, previewContent already typed. More flexible than competitors. |
| **Surgical Zustand selectors (zero wasted re-renders)** | react-big-calendar re-renders entire calendar on any state change (class components, minimal memoization). FullCalendar has improved but still over-renders. Fine-grained subscriptions = better performance. | MEDIUM | Zustand store with individual selectors per state slice. Each component subscribes only to what it reads. |
| **Small bundle size (<50KB gzipped)** | FullCalendar core alone is ~45KB min+gzip; with plugins (daygrid, timegrid, interaction, resource) it's 150-300KB. react-big-calendar is ~30KB but lacks features. Target: full-featured at <50KB. | MEDIUM | tsup tree-shaking, multi-entry build, date-fns tree-shakeable. Already architected for minimal bundle. |
| **Keyboard navigation** | FullCalendar added basic tab-focus in v5.10. react-big-calendar has open accessibility issues (#2498, #1753). No competitor has comprehensive keyboard-driven calendar navigation (arrow keys, shortcuts for views, Enter to select, Esc to cancel). | MEDIUM | KeyboardShortcutsConfig typed. T/D/W/M for view switching, arrow keys for cell navigation, Enter for event select, Esc for cancel. |
| **Multi-select with batch actions** | Almost no calendar library supports Cmd/Ctrl+click multi-select with batch operations. DayPilot has basic multi-select. Mobiscroll has it but is premium. This is a gap in the open-source space. | MEDIUM | MultiSelectConfig with batchActions typed. Selected events highlighted, floating action bar appears. |
| **Context menus** | Most libraries leave context menus to the consumer entirely. FullCalendar has no built-in context menu. Providing a declarative `contextMenu` prop that works on events, slots, and resources is differentiation. | MEDIUM | ContextMenuTarget and ContextMenuItem types already defined. contextMenu callback on CalendarProps. Plugin system can inject menu items. |
| **Smart drag feedback** | Most libraries show a basic ghost element during drag. Time tooltip showing "10:00 - 11:30", drop validity (green/red indicator), resource change label ("Moving to Room B") are missing from competitors. | MEDIUM | DragState has isValid and validationMessage. DropValidationResult has valid, message, level (error/warning). |
| **Search & filter bar** | No open-source calendar library ships a built-in client-side search with filter pills. Mobiscroll has it as premium. DayPilot has basic filtering. This is valuable for calendars with many events/resources. | MEDIUM | FilterBarConfig typed with searchable, searchFields, filterGroups, persistKey. |
| **Conflict detection with visual indicators** | Most libraries detect overlap for positioning but don't warn users about scheduling conflicts. Showing conflict badges, count indicators, and custom validators is unique. | MEDIUM | ConflictDetectionConfig typed with customValidator, highlightConflicts, showConflictCount, warnOnly. |
| **Event density adaptation** | Auto-adjusting event display (micro/compact/full) based on available space. No competitor does this well - they either truncate or overflow. Adaptive density = always readable events. | LOW | EventDensity type (micro, compact, full). DensityBreakpoints config. useDensity hook exists. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem valuable but create significant complexity, maintenance burden, or scope creep. Deliberately excluded.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Built-in recurring events (RRULE)** | Users want to define "every Monday" without extra code. | RFC 5545 RRULE is deceptively complex: timezone/DST handling, exclusion dates, modification of single instances, unbounded expansion. The `rrule` npm library has known quirks outside UTC. Adding this to the calendar library conflates data concerns with display concerns. | Accept pre-expanded events. Consumers use `rrule` library to expand recurrences before passing to calendar. Document the pattern. |
| **Built-in event editor/form** | Users want click-to-edit with a modal form. | Every app has different event schemas and form requirements. Building a generic editor means building a form library inside a calendar library. FullCalendar wisely avoids this. | Provide `onEventClick` and `onSelect` callbacks. Consumer renders their own editor. Provide `previewContent` render slot for quick preview. |
| **Built-in data fetching** | Users want to pass a URL and have the calendar load events. | Data fetching strategies vary wildly (REST, GraphQL, real-time, polling). Coupling fetch logic to calendar creates tight coupling and limits flexibility. | Consumer fetches data, passes `events` array prop. `loading` prop shows skeleton during fetch. `onDateRangeChange` callback tells consumer when to refetch. |
| **Real-time/WebSocket sync** | Users want multi-user live updates. | WebSocket/Firebase integration is infrastructure-specific. Adding it to the library creates massive API surface and testing burden. Only DHTMLX offers this, and it's a premium enterprise feature. | Consumer manages WebSocket connection, updates `events` prop when data changes. React's reconciliation handles the re-render. |
| **Animation system** | Users want smooth transitions between views, animated drag, etc. | CSS animations interfere with virtualization, complicate drag performance (must stay <16ms), and create visual inconsistency across browsers. Performance-first means no animation overhead. | Defer to post-MVP. Can be layered on via CSS transitions on specific class changes. `animations` config type is defined but not implemented. |
| **URL state sync** | Users want view/date in URL params for bookmarking. | URL management is router-specific (react-router, Next.js, etc.). Library managing URL params conflicts with consumer's routing. | Consumer reads `onViewChange`/`onDateRangeChange` callbacks and syncs to their router. `urlSync` config typed but should stay out of scope. |
| **Undo/redo** | Users want Ctrl+Z to revert a drag/drop. | Undo/redo requires tracking event state history, which is consumer data management. The calendar doesn't own event data - it receives it via props. | `onEventDrop`/`onEventResize` provide `revert()` function. Consumer can implement undo stack on top of these callbacks. |
| **Print/PDF export** | Users want to print the calendar or export to PDF. | Print CSS and PDF generation are complex, view-specific, and rarely used. FullCalendar has a premium plugin for it. No open-source library does it well. | Defer to post-MVP. Consumer can use `@media print` CSS. PDF export is a consumer concern using html2canvas or similar. |
| **Mobile swipe/pinch gestures** | Users want touch-optimized calendar on mobile. | Touch gesture handling adds significant complexity (conflicts with native scroll, needs long-press for drag, pinch-to-zoom for timeline). Desktop-first MVP. | FullCalendar uses long-press for touch drag. Defer touch optimization to post-MVP. Calendar is usable on mobile via responsive CSS, just not gesture-optimized. |
| **External drag sources** | Users want to drag events from an external list into the calendar. | External drag requires coordinating between the external component's drag system and the calendar's drop zones. Complex API surface with many edge cases. | Defer to post-MVP. Consumer can use the `onSelect` callback with their external UI to programmatically add events. |
| **Calendar system plugins (Hijri, Jalaali)** | Users want non-Gregorian calendar systems. | Requires different month lengths, year calculations, date formatting. Significant complexity for a niche audience. FullCalendar plans this for v8. | Use date-fns locale system for basic i18n. Non-Gregorian calendars are a v2+ consideration. |
| **Minimap** | Users want a small overview of the full timeline showing viewport position. | Complex UI component that needs its own rendering pipeline. Niche use case for very large resource timelines. | Typed but explicitly out of scope for MVP. Consider as plugin after timeline virtualization is stable. |
| **Auto-scheduling engine** | Users want the calendar to find optimal times for events. | This is AI/algorithm territory, not a UI component concern. Massively complex with constraints, preferences, and optimization. | Completely out of scope. Consumer builds scheduling logic externally. |

## Feature Dependencies

```
[Zustand Store] (exists)
    |
    +---> [Date Navigation] (exists)
    +---> [Event Filtering/Positioning] (exists)
    +---> [Collision Detection] (exists)
    |
    +---> [WeekView] (exists)
    |         |
    |         +---> [DayView] (reuses WeekView internals, single column)
    |         +---> [Now Indicator]
    |         +---> [Business Hours Overlay]
    |         +---> [All-Day Events] (header row above time grid)
    |         +---> [Slot Selection] (click/drag empty space)
    |         +---> [Event Drag & Drop] (requires snap-to-grid utils)
    |         |         +---> [Event Resize] (extends drag system with edge detection)
    |         |         +---> [Smart Drag Feedback] (tooltip, validity, ghost)
    |         +---> [Keyboard Navigation] (arrow keys within grid)
    |
    +---> [MonthView]
    |         +---> [All-Day Events] (event chips in day cells)
    |         +---> [Overflow Indicator] (+N more)
    |         +---> [Event Drag & Drop] (move between day cells)
    |
    +---> [TimelineView]
    |         +---> [Resource System] (resource sidebar, grouping, filtering)
    |         |         +---> [Resource Virtualization] (100+ resource rows)
    |         +---> [Horizontal Virtualization] (time axis windowing)
    |         +---> [Event Drag & Drop] (cross-resource moves)
    |         +---> [Event Resize] (horizontal edges)
    |
    +---> [ListView]
    |         +---> [Event Filtering] (exists)
    |
    +---> [Multi-Select]
    |         +---> [Batch Actions Toolbar]
    |
    +---> [Context Menu]
    |         +---> [Plugin Context Menu Items]
    |
    +---> [Search & Filter Bar]
    |
    +---> [Dark Mode] (CSS variables)
    +---> [Theming] (classNames + CSS vars)
    +---> [Skeleton Loading] (exists)

[Headless Entry] ──exports──> [Hooks + Store] (no UI dependency)
```

### Dependency Notes

- **DayView requires WeekView:** DayView is a single-column WeekView. Reuse internals, don't duplicate.
- **Event Resize requires Event Drag & Drop:** Resize extends the drag system with edge detection. Build drag first, resize on top.
- **Smart Drag Feedback requires Event Drag & Drop:** Visual feedback layer on top of drag mechanics.
- **TimelineView requires Resource System:** Timeline without resources is just a horizontal week view. Build resource data model first.
- **Resource Virtualization requires TimelineView + @tanstack/react-virtual:** Virtualize resource rows in timeline.
- **Batch Actions requires Multi-Select:** Need selected events before batch operations make sense.
- **All views share:** Event Drag & Drop, Slot Selection, Keyboard Navigation - but implementation details differ per view.
- **Plugin Context Menu Items enhances Context Menu:** Plugins inject items into the context menu system.

## MVP Definition

### Launch With (v1)

Minimum feature set to be a viable FullCalendar replacement for at least one real use case (Aviatize).

- [ ] **All 5 views (week, day, month, timeline, list)** -- required for feature parity
- [ ] **Event drag & drop** -- core interaction, unusable without it
- [ ] **Event resize** -- expected alongside drag & drop
- [ ] **Slot selection** -- needed to create events
- [ ] **All-day events** -- table stakes
- [ ] **Now indicator** -- low complexity, high polish
- [ ] **Business hours overlay** -- low complexity, professional feel
- [ ] **Resource system** -- required for timeline view
- [ ] **Virtualization** -- core differentiator, must be in v1
- [ ] **Dark mode + full theming** -- expected in 2026
- [ ] **Keyboard navigation** -- differentiator + accessibility requirement
- [ ] **Timezone support** -- required for Aviatize (aviation ops = multi-timezone)

### Add After Validation (v1.x)

Features to add once core views and interactions are solid.

- [ ] **Multi-select + batch actions** -- add when drag & drop is stable
- [ ] **Context menus** -- add when event interactions are complete
- [ ] **Search & filter bar** -- add when event volume demands it
- [ ] **Smart drag feedback** -- polish layer on top of working drag
- [ ] **Conflict detection visual indicators** -- add when event positioning is stable
- [ ] **Event density adaptation** -- polish feature, refine breakpoints with real data

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Plugin API implementation** -- types defined, defer actual plugin loading/lifecycle
- [ ] **Animations** -- layer on after performance is proven
- [ ] **Mobile touch gestures** -- after desktop experience is solid
- [ ] **External drag sources** -- complex, niche
- [ ] **Print CSS** -- niche
- [ ] **Minimap** -- niche, only for very large timelines

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| MonthView | HIGH | MEDIUM | P1 |
| DayView | HIGH | LOW (reuses WeekView) | P1 |
| TimelineView | HIGH | HIGH | P1 |
| ListView | MEDIUM | LOW | P1 |
| Event drag & drop | HIGH | HIGH | P1 |
| Event resize | HIGH | MEDIUM | P1 |
| Slot selection | HIGH | MEDIUM | P1 |
| All-day events | HIGH | MEDIUM | P1 |
| Resource system | HIGH | MEDIUM | P1 |
| Virtualization | HIGH | HIGH | P1 |
| Now indicator | MEDIUM | LOW | P1 |
| Business hours | MEDIUM | LOW | P1 |
| Dark mode + theming | MEDIUM | MEDIUM | P1 |
| Keyboard navigation | MEDIUM | MEDIUM | P1 |
| Timezone support | HIGH | MEDIUM | P1 |
| Multi-select | MEDIUM | MEDIUM | P2 |
| Context menus | MEDIUM | MEDIUM | P2 |
| Search & filter bar | MEDIUM | MEDIUM | P2 |
| Smart drag feedback | MEDIUM | LOW | P2 |
| Conflict detection | MEDIUM | MEDIUM | P2 |
| Event density adaptation | LOW | LOW | P2 |
| Plugin API runtime | LOW | MEDIUM | P3 |
| Animations | LOW | MEDIUM | P3 |
| Touch gestures | MEDIUM | HIGH | P3 |
| External drag sources | LOW | HIGH | P3 |
| Print CSS | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch -- without these, cannot replace FullCalendar
- P2: Should have, add when core is stable -- these differentiate from competitors
- P3: Nice to have, future consideration -- these serve niche use cases

## Competitor Feature Analysis

| Feature | FullCalendar | react-big-calendar | Schedule-X | DHTMLX | Our Approach |
|---------|--------------|-------------------|------------|--------|--------------|
| **Views** | 6+ (incl. premium timeline) | 4 (month/week/day/agenda) | 4 (month/week/day/agenda) | 10+ (incl. timeline, map) | 5 views + 4 timeline variants (8 total) |
| **Virtualization** | None (batched rendering) | None | None | Dynamic loading | Full @tanstack/react-virtual windowing |
| **Bundle size** | 150-300KB w/ plugins | ~30KB | ~25KB | ~150KB+ | Target <50KB full-featured |
| **Drag & drop** | Yes (plugin) | Yes (addon) | Yes (premium) | Yes | Yes (built-in, no addon needed) |
| **Resize** | Yes (plugin) | Partial (issues reported) | Yes (premium) | Yes | Yes (built-in) |
| **Resources** | Premium only ($) | No | Premium | Yes | Free, built-in |
| **Keyboard nav** | Basic tab-focus | Poor (open issues) | None documented | Yes | Comprehensive shortcuts + arrow nav |
| **Multi-select** | No | No | No | No | Yes, with batch actions |
| **Context menus** | No | No | No | Limited | Declarative prop + plugin injection |
| **Dark mode** | Via theme override | Manual CSS | Built-in toggle | Theme support | CSS vars + `.dark` class toggle |
| **Headless API** | No | No | No | No | Full hooks + store export |
| **Search/filter** | No | No | No | Limited | Built-in filter bar with search |
| **Conflict detection** | No visual indicators | No | No | No | Visual indicators + custom validators |
| **TypeScript** | Types available | @types package | TypeScript-first | Types available | TypeScript-first, strict |
| **Recurring events** | RRULE plugin | Basic | Plugin | Built-in | Not built-in (consumer expands) |
| **Export (PDF/ICS)** | No (was premium) | No | No | PDF, PNG, Excel, iCal | Not built-in (consumer concern) |
| **Real-time collab** | No | No | No | WebSocket/Firebase | Not built-in (consumer concern) |
| **Accessibility (ARIA)** | WAI-ARIA since v5.10 | Poor (open bugs) | Not documented | WAI-ARIA + high contrast | WAI-ARIA + keyboard-first design |
| **Locale support** | 70+ locales | 4 localizer options | Basic | 29 locales | date-fns locale system |
| **React version** | React 18 | No React 19 support | Multi-framework | React 18 | React 18+ (hooks-first) |

### Key Gaps We Exploit

1. **FullCalendar has no virtualization.** Open issue #5673 since 2020. They plan it for v8 (Q4 2025+). We ship with it on day one.
2. **react-big-calendar is architecturally stale.** Class components, minimal memoization, no React 19 support, poor accessibility. Its maintainer acknowledged it needs a rewrite (issue #2255).
3. **Schedule-X puts drag & drop and resize behind a paywall.** Basic interactions should be free.
4. **No competitor offers a headless API** for full-featured scheduling. Headless calendar hooks exist for date pickers, not schedulers.
5. **No open-source competitor has multi-select with batch actions.** Only DayPilot (commercial) has basic multi-select.
6. **No competitor has built-in client-side search/filter.** Mobiscroll (commercial) has it, nothing open-source.
7. **Accessibility is an afterthought everywhere.** FullCalendar improved in v5.10 but it's still basic. react-big-calendar has open ARIA bugs. We can lead with keyboard-first design.

## Sources

- [FullCalendar Documentation](https://fullcalendar.io/docs) - comprehensive feature list, views, interactions, resources
- [FullCalendar Accessibility](https://fullcalendar.io/docs/accessibility) - WAI-ARIA, keyboard support details
- [FullCalendar Premium Plugins](https://fullcalendar.io/docs/premium) - timeline, resource views, print
- [FullCalendar Roadmap](https://fullcalendar.io/roadmap) - v8 plans (infinite scroll, resource pagination)
- [FullCalendar virtualization issue #5673](https://github.com/fullcalendar/fullcalendar/issues/5673) - no virtual rendering, performance with 5000 resources
- [FullCalendar bundle size issue #7029](https://github.com/fullcalendar/fullcalendar/issues/7029) - v6 bundle size increase
- [react-big-calendar GitHub](https://github.com/jquense/react-big-calendar) - features, issues, architecture
- [react-big-calendar accessibility issues](https://github.com/jquense/react-big-calendar/issues/2498) - ARIA validation failures
- [react-big-calendar keyboard issues](https://github.com/jquense/react-big-calendar/issues/1753) - keyboard-only user support
- [react-big-calendar rewrite discussion](https://github.com/jquense/react-big-calendar/issues/2255) - architectural concerns
- [react-big-calendar React 19 support](https://github.com/jquense/react-big-calendar/issues/2701) - no React 19 support
- [Schedule-X Documentation](https://schedule-x.dev/docs/calendar) - views, plugins (free vs premium)
- [Schedule-X Resize Plugin](https://schedule-x.dev/docs/calendar/plugins/resize) - premium feature
- [Schedule-X Drag & Drop Plugin](https://schedule-x.dev/docs/calendar/plugins/drag-and-drop) - premium feature
- [DHTMLX React Scheduler](https://dhtmlx.com/docs/products/dhtmlxScheduler-for-React/) - 10 views, recurring events, real-time
- [Best React Scheduler Components 2025-2026 Comparison](https://dhtmlx.com/blog/best-react-scheduler-components-dhtmlx-bryntum-syncfusion-daypilot-fullcalendar/) - feature matrix across 5 libraries
- [Bryntum React Scheduler](https://bryntum.com/products/react-scheduler/) - enterprise features, performance
- [DayPilot Event Multi-Selecting](https://doc.daypilot.org/scheduler/event-multi-selecting/) - Ctrl+click multi-select
- [RRULE Complexity (Nylas)](https://www.nylas.com/blog/calendar-events-rrules/) - why recurring events are deceptively complex
- [rrule npm library](https://github.com/jkbrzt/rrule) - JavaScript RRULE implementation, known timezone quirks

---
*Feature research for: React calendar/scheduler component library*
*Researched: 2026-02-16*
