# Pro Calendar React — Development Roadmap

## Context

`@pro-calendr-react/core` is a standalone, general-purpose React calendar package designed to replace FullCalendar with better performance (<50KB gzipped, virtualized rendering, <150ms for 200 events), Tailwind-native styling, and a plugin architecture. The project has an excellent foundation (~10-15% complete): comprehensive TypeScript types (40+ prop interface), multi-entry tsup build, Zustand store skeleton, CSS architecture with custom properties + dark mode + animations + print styles, functional toolbar components, and working Storybook/CI/CD. However, **all 5 views are empty stubs**, all interaction components return null, and core algorithms (collision, conflict, slot generation, event positioning) are TODO.

This roadmap builds every feature from the requirements document, starting with an MVP that renders a real calendar, then progressively adding views, resources, interactions, performance optimizations, and advanced UX features.

---

## Current Progress (Phase 1 — MVP)

### COMPLETED

#### Phase 1.1: Date & Time Utilities

- **`packages/core/src/utils/date-utils.ts`** — Fully implemented:
  - `getDateRange(date, view, firstDay)` — calculates visible range for all 8 view types
  - `formatDate(date, formatStr)` — wraps date-fns format
  - `formatTime(date, hour12)` — 24h or 12h time formatting
  - `formatDateHeader(date, view)` — view-specific header formatting
  - `getDaysInRange(start, end)` — all days in range (inclusive)
  - `getWeeksInRange(start, end, firstDay)` — week starts in range
  - `parseTimeToMinutes(time)` — "HH:mm" → minutes since midnight
  - `minutesToDate(minutes, refDate)` — minutes → Date
  - `getMinutesSinceMidnight(date)` — Date → minutes
  - `getDurationMinutes(start, end)` — duration between dates
  - `addDays` re-exported from date-fns
- **`packages/core/src/utils/slot.ts`** — Fully implemented:
  - `generateTimeSlots(startTime, endTime, durationMinutes, refDate?, hour12?)` — generates TimeSlot[] array
  - `getSlotAtPosition(y, slotHeight, totalSlots)` — pixel Y → slot index
- **Tests**: 42 date-utils tests + 17 slot tests = **59 tests passing**

#### Phase 1.2: Store Navigation & Event Positioning

- **`packages/core/src/store/calendar-store.ts`** — Fully implemented:
  - `navigateDate("prev" | "next" | "today")` — view-aware navigation (week ±7d, month ±1m, day ±1d, year ±1y)
  - `setView(view)` — changes view AND recalculates dateRange
  - `setDate(date)` — changes date AND recalculates dateRange
  - `setFirstDay(firstDay)` — changes week start and recalculates
  - All actions update `dateRange` atomically with `currentDate`
- **`packages/core/src/utils/event-filter.ts`** — New file:
  - `filterEventsInRange(events, dateRange)` — overlap-based filtering
  - `groupEventsByDate(events)` — Map<dateString, events[]>
  - `groupEventsByResource(events)` — Map<resourceId, events[]>
  - `sortEventsByStart(events)` — chronological, longer events first on ties
  - `getEventsForDay(events, day)` — events touching a specific day
  - `partitionAllDayEvents(events)` — separate allDay from timed
- **`packages/core/src/utils/event-position.ts`** — New file:
  - `calculateEventPosition(event, slotMinTime, slotDuration, slotHeight)` — { top, height } in px for week/day views
  - `calculateTimelinePosition(event, rangeStart, rangeEnd)` — { left, width } as % for timeline
- **`packages/core/src/hooks/use-calendar-events.ts`** — Implemented:
  - `useCalendarEvents(events, dateRange)` — returns visibleEvents, eventsByDate, eventsByResource, allDayEvents, timedEvents (all memoized)
- **Tests**: 12 store tests + 18 event-filter tests + 11 event-position tests = **41 tests passing**

#### Phase 1.3: Week View Implementation

- **`packages/core/src/views/week/WeekView.tsx`** — Fully implemented:
  - CSS Grid layout: 60px time labels + 7 × 1fr day columns
  - Generates time slots from slotMinTime/slotMaxTime/slotDuration
  - Filters and positions events in correct day columns
  - All-day events row (shown only when all-day events exist)
  - Renders DayColumnHeaders + TimeSlotColumn per day
- **`packages/core/src/views/week/DayColumnHeaders.tsx`** — Implemented:
  - Day name + day number per column
  - Today highlighting (accent color + bold)
- **`packages/core/src/views/week/TimeSlotColumn.tsx`** — Implemented:
  - Slot grid lines (horizontal borders per slot)
  - Absolute-positioned events via calculateEventPosition
  - Renders EventBlock per event
- **`packages/core/src/components/EventBlock.tsx`** — New shared component:
  - 3 density variants: micro (color bar), compact (time + title), full (time + title separate)
  - Custom `eventContent` render prop support
  - Event colors (backgroundColor, textColor, borderColor)
  - Keyboard accessible (Enter/Space triggers click)
  - data-event-id, data-selected, data-dragging attributes
- **`packages/core/src/views/week/EventStack.tsx`** — Placeholder for future collision resolution
- **Tests**: 13 WeekView tests passing

#### Phase 1.4: Calendar Composition

- **`packages/core/src/components/CalendarProvider.tsx`** — Fully implemented:
  - CalendarConfig context with all view-relevant props
  - Initializes store with defaultView/defaultDate on mount
  - Syncs firstDay prop to store on changes
- **`packages/core/src/components/CalendarContext.tsx`** — New file:
  - Separated CalendarContext + useCalendarConfig hook (react-refresh compliance)
- **`packages/core/src/components/CalendarBody.tsx`** — Fully implemented:
  - View routing: week→WeekView, others→"coming soon" placeholder
  - Bridges onEventClick callback from (event, nativeEvent) to EventClickInfo
  - Reads currentView/dateRange from store, config from context
- **`packages/core/src/components/Calendar.tsx`** — Fully implemented:
  - Composes CalendarProvider + CalendarToolbar + CalendarBody + Skeleton
  - Default toolbar: DateNavigation (Prev/Next/Today + title) + ViewSelector
  - Custom toolbar slots: toolbarLeft/Center/Right override defaults
  - forwardRef + useImperativeHandle for CalendarRef API (getDate, getView, navigateDate, setView)
  - Fires onDateRangeChange/onViewChange callbacks on state changes
  - Loading state renders Skeleton instead of CalendarBody
  - Applies classNames.root and CSS variable style props
  - getToolbarTitle() formats date based on view type
- **Tests**: 24 Calendar composition tests passing

---

## Total Test Count: 140 tests passing across 8 test files

---

## Remaining Milestones

### Milestone 1 (remaining): Calendar Composition (Phase 1.4)

Wire Calendar → CalendarProvider → CalendarBody → WeekView. Connect toolbar to store. Implement CalendarRef. Fire callbacks. **~20 tests needed.**

### Milestone 2: All Standard Views

| Phase | What         | Files                                                                                         | Tests |
| ----- | ------------ | --------------------------------------------------------------------------------------------- | ----- |
| 2.1   | Day View     | `views/day/DayView.tsx` — reuse TimeSlotColumn, single column                                 | ~8    |
| 2.2   | Month View   | `views/month/MonthView.tsx`, `WeekRow.tsx`, `DayCell.tsx` — CSS Grid 7-col, OverflowIndicator | ~15   |
| 2.3   | List View    | `views/list/ListView.tsx` — group by date, empty state                                        | ~10   |
| 2.4   | View Routing | `CalendarBody.tsx` — route all 4 views                                                        | ~5    |

### Milestone 3: Resource System & Timeline View

| Phase | What                           | Files                                                                                                                     | Tests |
| ----- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ----- |
| 3.1   | Resource Utilities             | New `utils/resource-utils.ts`, `hooks/use-resources.ts` — grouping, collapsing, filtering                                 | ~20   |
| 3.2   | Timeline Layout                | `views/timeline/TimelineView.tsx`, `TimeHeader.tsx`, `ResourceSidebar.tsx`, `TimeGrid.tsx` — 2-region layout, sync scroll | ~15   |
| 3.3   | Timeline Events                | `views/timeline/EventLane.tsx`, `utils/collision.ts` — horizontal bars, sweep-line collision detection                    | ~25   |
| 3.4   | Business Hours & Now Indicator | `BusinessHoursOverlay.tsx`, `NowIndicator.tsx`, `hooks/use-now.ts`                                                        | ~12   |

### Milestone 4: Interactions

| Phase | What                  | Files                                                                                                           | Tests |
| ----- | --------------------- | --------------------------------------------------------------------------------------------------------------- | ----- |
| 4.1   | Date/Time Selection   | `SelectionOverlay.tsx`, new `utils/pixel-to-time.ts` — click-drag to select, onSelect callback                  | ~20   |
| 4.2   | Event Drag & Drop     | `DragLayer.tsx`, `DragGhost.tsx`, `DropIndicator.tsx`, new `utils/drag-math.ts` — custom drag, snap, validation | ~25   |
| 4.3   | Event Resize          | `EventBlock.tsx` (handles), `hooks/use-resize.ts` — resize from start/end edges                                 | ~15   |
| 4.4   | Resource Reassignment | Timeline drag between rows, onEventDrop with resourceIds                                                        | ~10   |
| 4.5   | Event Click           | Wire onEventClick, distinguish from drag                                                                        | ~5    |

### Milestone 5: Performance

| Phase | What               | Files                                                                                  | Tests      |
| ----- | ------------------ | -------------------------------------------------------------------------------------- | ---------- |
| 5.1   | Virtualization     | `hooks/use-virtualization.ts` — wrap @tanstack/react-virtual for timeline rows/columns | ~15        |
| 5.2   | Memoization        | React.memo on EventBlock/DayCell/rows, useMemo/useCallback optimization, event indexes | benchmarks |
| 5.3   | Conflict Detection | `utils/conflict.ts` — O(n log n) sort+sweep, `hooks/use-conflict-detection.ts`         | ~15        |

### Milestone 6: UX Polish

| Phase | What                | Files                                                                                            | Tests |
| ----- | ------------------- | ------------------------------------------------------------------------------------------------ | ----- |
| 6.1   | Animations          | `hooks/use-animations.ts` — wire existing CSS keyframes to component states                      | ~5    |
| 6.2   | Keyboard Navigation | `hooks/use-keyboard.ts` — shortcuts from KEYS constants, focus management, ARIA                  | ~20   |
| 6.3   | Context Menus       | `ContextMenu.tsx` — right-click on events/slots/resources, plugin item merge                     | ~15   |
| 6.4   | Search & Filter     | New `FilterBar.tsx`, `hooks/use-filter.ts` — search + dropdown filters, localStorage persistence | ~15   |
| 6.5   | Preview Panel       | New `PreviewPanel.tsx` — side/bottom panel with consumer content                                 | ~10   |

### Milestone 7: Advanced Features

| Phase | What                            | Tests |
| ----- | ------------------------------- | ----- |
| 7.1   | Multi-Select & Batch Operations | ~15   |
| 7.2   | Undo/Redo                       | ~15   |
| 7.3   | Zoom & Time Scale               | ~12   |
| 7.4   | Minimap (Canvas)                | ~10   |
| 7.5   | URL Sync                        | ~10   |
| 7.6   | Mobile & Touch                  | ~15   |

### Milestone 8: Production Readiness

| Phase | What                                     |
| ----- | ---------------------------------------- |
| 8.1   | Accessibility Audit (WCAG 2.1 AA)        |
| 8.2   | Comprehensive Test Suite (80%+ coverage) |
| 8.3   | Bundle Optimization (<50KB gzipped)      |
| 8.4   | Storybook & Documentation                |

---

## Dependency Graph

```
M1.1 Date Utils ─┬─> M1.2 Store Nav ─> M1.4 Calendar Composition ──────────────┐
                  ├─> M1.3 Week View ─────────────────────> M1.4               │
                  └─> Event Utils ──────────────────────────────────────────────│
                                                                                v
M2.1 Day View ──┐                                              M4.1 Selection ──┐
M2.2 Month View ├─> M2.4 View Routing                         M4.2 Drag & Drop │
M2.3 List View ──┘                                             M4.3 Resize      ├─> M5 Performance
                                                               M4.4 Resource DnD│
M3.1 Resource Utils ─> M3.2 Timeline Layout ─> M3.3 Events    M4.5 Event Click ─┘
                                                  │                    │
                                                  v                    v
                                            M3.4 Business Hrs   M6 UX Polish ──> M7 Advanced ──> M8 Production
```

**Critical path:** M1.1 → M1.2 → M1.3 → M1.4 (MVP, mostly done)

**Parallelizable after MVP:**

- M2 (standard views) and M3 (timeline) can proceed in parallel
- M4 (interactions) needs at least Week + Timeline done
- M6 and M7 phases are mostly independent of each other
- M8 runs last

---

## Performance Targets

| Metric                                | Target             |
| ------------------------------------- | ------------------ |
| Bundle (gzipped)                      | <50KB              |
| Initial render (empty)                | <50ms              |
| Initial render (200 events)           | <150ms             |
| View switch                           | <100ms             |
| Drag feedback                         | <16ms (1 frame)    |
| Resource rows before jank             | 500+ (virtualized) |
| DOM nodes (100 resources, 200 events) | <500               |

---

## Verification (after each milestone)

1. `pnpm typecheck` — zero errors
2. `pnpm lint` — zero warnings
3. `pnpm test:ci` — all tests pass, coverage thresholds met
4. `pnpm build` — clean build, check bundle sizes
5. `pnpm storybook` — all stories render correctly
