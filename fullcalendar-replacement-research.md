# FullCalendar Replacement Research

## 1. Executive Summary

### Vision: A General-Purpose Calendar Package

The replacement is not just an Aviatize-specific rewrite — it should be a **standalone, general-purpose React calendar package** that can be used across multiple projects. Think of it as "what FullCalendar should have been": lightweight, virtualized, Tailwind-native, with a plugin architecture for domain-specific features. Aviatize becomes the first consumer of this package, with aviation-specific features built as extensions on top.

### Why Replace FullCalendar

FullCalendar v6.1.8 is the calendar engine behind all scheduling views in Aviatize: flight rosters, availability management, training schedules, and every Smart System calendar view. While it provided a fast path to a working calendar, it has become a liability in four areas:

| Problem                  | Impact                                                                                                                                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Bundle size**          | 9 npm packages (~300-400KB gzipped), `allLocales` loaded on every page, no tree-shaking                                                                                                                            |
| **Premium license cost** | Resource timeline/timegrid require a paid FullCalendar Scheduler license                                                                                                                                           |
| **Performance**          | Unmemoized handlers cause full re-renders, events array rebuilt on every filter change, `React.memo` is ineffective, 60s polling for all views, no virtualization for 100+ resource rows                           |
| **Visual limitations**   | Styling requires fighting FullCalendar's CSS with 25+ `!important` overrides, 3 competing style systems (styled-components + inline `<style>` + Tailwind), dark mode is inconsistent, no design system integration |

### Scope of Replacement

| Metric                            | Count                         |
| --------------------------------- | ----------------------------- |
| Files importing `@fullcalendar/*` | 41+                           |
| Wrapper components                | 6 (3 major, 3 specialized)    |
| Custom hooks                      | 7+                            |
| Custom event renderers            | 3                             |
| npm packages                      | 9 (+ 5 peer overrides)        |
| Views implemented                 | 12+ (4 standard + 8 resource) |

---

## 2. Feature Inventory

### 2.1 Installed Packages

All version `6.1.8`:

```
@fullcalendar/core
@fullcalendar/react
@fullcalendar/daygrid
@fullcalendar/timegrid
@fullcalendar/interaction
@fullcalendar/list
@fullcalendar/resource            (Premium)
@fullcalendar/resource-timegrid   (Premium)
@fullcalendar/resource-timeline   (Premium)
```

Plus overrides in `package.json` to force version consistency:

```
@fullcalendar/premium-common
@fullcalendar/resource-daygrid
@fullcalendar/scrollgrid
@fullcalendar/timeline
```

### 2.2 Calendar Views Used

#### Standard Views (no resources)

| View                   | Where Used                         | Purpose                                |
| ---------------------- | ---------------------------------- | -------------------------------------- |
| `dayGridMonth`         | IdronectCalendar, IdronectSchedule | Monthly overview grid                  |
| `timeGridWeek`         | IdronectCalendar, IdronectSchedule | Weekly schedule with hourly slots      |
| `timeGridDay`          | IdronectCalendar                   | Single day view                        |
| `listMonth`            | IdronectCalendar                   | List-format month view                 |
| Custom `timeGridMonth` | IdronectSchedule                   | Month-long time grid (custom duration) |

#### Resource Timeline Views (Premium)

| View                    | Where Used                         | Purpose                    |
| ----------------------- | ---------------------------------- | -------------------------- |
| `resourceTimelineDay`   | IdronectRoster                     | Daily resource allocation  |
| `resourceTimelineWeek`  | IdronectRoster                     | Weekly resource allocation |
| `resourceTimelineMonth` | IdronectRoster, RosterTimelineView | Monthly resource overview  |
| `resourceTimelineYear`  | IdronectRoster                     | Yearly resource overview   |

#### Resource Time Grid Views (Premium)

| View                    | Where Used         | Purpose                             |
| ----------------------- | ------------------ | ----------------------------------- |
| `resourceTimeGridDay`   | AvailabilityRoster | Daily availability per crew member  |
| `resourceTimeGridWeek`  | AvailabilityRoster | Weekly availability per crew member |
| `resourceTimeGridMonth` | AvailabilityRoster | Monthly availability (custom)       |

### 2.3 Resource System

**Grouping**: Two-level hierarchy (Group > Resource). Used for Aircraft + Crew grouped rosters.

```
Aircraft (Group)
  ├── N12345 (Resource)
  └── N67890 (Resource)
Crew (Group)
  ├── John Doe (Resource)
  └── Jane Smith (Resource)
```

**Key props used**:

- `resources` — array of resource objects
- `resourceGroupField="groupId"` — field for grouping
- `resourceGroupLabelContent` — custom group header renderer (SmartTagCore)
- `resourceLabelContent` — custom resource label renderer (aircraft/crew specific)
- `resourceAreaHeaderContent` — formatted date display in resource column header
- `resourceAreaWidth` — responsive width (140px mobile, 160px tablet, 12% desktop)
- `resourceOrder` — sort field
- `datesAboveResources` — swap axis (dates horizontal, resources vertical)
- `filterResourcesWithEvents` — hide empty resources

**Custom resource renderers**:

- `RosterResourceAircraft.tsx` — aircraft registration, photo, status
- `RosterResourceCrew.tsx` — user avatar, name, role
- `RosterResourceAeroCrs.tsx` — AeroCRS integration label
- `RosterResourceLabel.tsx` — generic SmartTag label

**Resource capping**: Performance guard that limits visible resources per view type (e.g., max 50), shows info banner when capped.

### 2.4 Event System

**Event shape** (transformed from database records):

```typescript
{
  id: string                    // record._id
  title: string                 // labelField or code
  start: string                 // ISO datetime (timezone-adjusted)
  end: string                   // ISO datetime (timezone-adjusted)
  backgroundColor: string       // status-based color
  borderColor: string           // same as background
  textColor: string             // from status config
  record: object                // full database record in extendedProps
  resourceIds: string[]         // which resources this event belongs to
  display: 'auto' | 'background' // background events for non-interactive blocks
  editable: boolean             // drag/resize enabled
  startEditable: boolean        // drag start time
  durationEditable: boolean     // resize duration
  metaData: object              // additional rendering metadata
}
```

**Custom event renderers**:

1. **`CalendarFlightPlan.tsx`** — Rich flight visualization with:
   - Avatar groups for PIC, P2, instructor, student
   - Aircraft avatar/photo
   - Destination ICAO code
   - Flight plan status indicator
   - Calendar event type icon
   - Conditional rendering for training vs regular flights, solo flights, duty times

2. **`renderSmartScheduleContent.tsx`** — Smart System events with:
   - `IdronectPopover` on click showing detail card
   - `SmartTagCore` for inline event display
   - Status color from workflow

3. **`CalendarAvailabilityEvent.tsx`** — Availability blocks with custom styling

**Event popover pattern**: `calendarEventPopoverGenerator.tsx` wraps event content with hover popover containing an info icon.

**Event stacking/overlap**:

- `eventOverlap` — controlled per-view and by operator settings (`timelineDisableOverlap`)
- `selectOverlap` — selection over existing events
- `slotEventOverlap` — time grid specific
- `eventMaxStack={1}` — used in schedule views to limit visible stacking
- `moreLinkClick="popover"` — overflow via "+more" popover

### 2.5 Interactions

#### Date/Time Selection

- `selectable` — enables slot selection
- `selectMirror` — visual feedback during drag-select
- `selectAllow` / `calendarSelectAllow` — validation function restricting where selection is allowed
- `unselectAuto={false}` — manual unselect control
- Smart duration detection: single click = `defaultDurationMinutes` (from settings), drag = actual duration

**Flow**: User selects slot -> timezone conversion via `convertDateTimeZone()` -> resource extraction -> create modal opens

#### Event Click

- `eventClick` — opens detail drawer (`ViewBookingDrawerAction`) or popover
- `eventContent` with embedded `IdronectPopover` for inline details
- Context menu via `useCalendarEventContextMenu.ts` (right-click)

#### Drag & Drop (Internal)

Complex logic in `useCalendarEventDrag.ts` (400 lines):

- Event time change (drag to different slot)
- Resource change (drag to different resource row)
- Smart auto-population when dragging between resources:
  - Drag flight to Aircraft resource -> sets `aircraftId`
  - Drag flight from PIC to another User -> reassigns PIC
  - Drag flight from Instructor to Student -> reassigns instructor
  - Cross-type drags (Aircraft -> User) -> fills empty PIC/P2 slot
- Confirmation modal before mutation
- Revert on cancel or error
- Copy mode: hold modifier to copy instead of move

**Smart System drag**: `useSmartCalendarEventDrag.ts` — generic version for any Smart feature

#### Drag & Drop (External)

`DraggableTrainingEventsList.tsx` — sidebar list of training events with:

```typescript
new Draggable(draggableEl, {
  itemSelector: ".fc-event",
  eventData: (eventEl) => ({
    title,
    color,
    duration: "02:00",
    extendedProps: { trainingEventId, studentUserId },
  }),
});
```

Caught by `eventReceive` in SmartRoster, triggers flight plan creation.

#### Event Resize

- `eventResizableFromStart` — resize from left edge
- `eventDurationEditable` — resize from right edge
- Same confirmation modal flow as drag

### 2.6 Time & Timezone

- `timeZone={calendarSettings.timezone}` — all views use operator timezone
- `now={() => isoDateTimeZone(new Date(), timezone)}` — timezone-aware "now" indicator
- `nowIndicator` — red line showing current time
- `eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}` — 24h format (with meridian toggle)
- `scrollTime` — auto-scroll to current time on load
- `firstDay` — configurable week start (Sunday/Monday)
- `weekends` — show/hide weekends
- `businessHours` — highlighted working hours block
- `slotDuration` — configurable (default 30 min)
- `slotMinTime` / `slotMaxTime` — visible time range (e.g., 06:00-22:00)

**Timezone conversion**: All drag/resize operations pass through `convertDateTimeZone()` because FullCalendar returns UTC dates that need operator timezone conversion. Comments in code note: "FULLCALENDAR SEEMS TO DO VERY WONKY THINGS HERE - THIS IS A HACK".

**Sunrise/Sunset**: `SunTimes.tsx` displays dawn/dusk for home aerodrome in toolbar.

### 2.7 Toolbar (Custom)

FullCalendar's built-in `headerToolbar` is hidden (`{ left: 'title', center: '', right: '' }`). Custom `CalendarTitle.tsx` provides:

| Feature         | Implementation                                                 |
| --------------- | -------------------------------------------------------------- |
| Date navigation | Today / Prev / Next buttons via `calendarRef.getApi()`         |
| Jump to date    | Antd DatePicker                                                |
| View selector   | Dropdown or segmented control (`CalendarViewTypeSelector`)     |
| Resource filter | Multi-select for resources/groups (`CalendarResourceSelector`) |
| Timezone badge  | Shows current timezone label                                   |
| Home ICAO       | Shows aerodrome code                                           |
| Sunrise/Sunset  | Calculated from aerodrome coordinates                          |
| iCal export     | `ExportCalendarButton` — generates `.ics` file                 |
| Refresh         | Manual refetch button                                          |
| Create event    | "Book" button (schedule views only)                            |

### 2.8 Operator Settings

All pulled from `useCalendarSettings()` hook (MongoDB `calendar-settings` collection):

```typescript
{
  timezone: string               // e.g., "Europe/Brussels"
  homeIcao: string               // e.g., "EBBR"
  startWeekOnDay: number          // 0=Sun, 1=Mon
  weekends: boolean               // show/hide
  businessHours: {
    daysOfWeek: number[],
    startTime: string,
    endTime: string
  }
  slotDuration: { minutes: number } // e.g., 30
  slotMinTime: string             // e.g., "06:00"
  slotMaxTime: string             // e.g., "22:00"
  defaultDurationMinutes: number  // e.g., 60
  dayWeekSlotWidth: number        // px for day/week slots
  monthYearSlotWidth: number      // px for month/year slots
  timelineDisableOverlap: boolean
  timelineCompactMode: boolean
  timelineCompactModeHeight: number // default 20px
  timelineCustomCss: string        // operator-injected CSS overrides
  popoverVisualization: boolean    // "prettier but slower"
  highPerformanceMode: boolean     // exists in schema but NOT implemented
  hideSunriseSunset: boolean
  checkinLabel: string             // custom labels
  checkoutLabel: string
}
```

### 2.9 Localization

- `allLocales` — imports EVERY FullCalendar locale (massive bundle impact)
- `locale={currentLanguage}` — from `useLanguageContext()`
- Meridian toggle: `hour12: isMeridianEnabled` in event time format

---

## 3. Current Flaws & Technical Debt

### 3.1 Bundle Size (CRITICAL)

| Issue               | Detail                                                                             |
| ------------------- | ---------------------------------------------------------------------------------- |
| 9 npm packages      | Each plugin adds 20-50KB gzipped. Total estimated: 300-400KB                       |
| `allLocales` import | Loads EVERY language FullCalendar supports instead of only the needed ones         |
| No code splitting   | Calendar plugins loaded eagerly on app startup, even if user never visits calendar |
| Premium license     | Paid Scheduler license required for resource views, adds commercial dependency     |

### 3.2 Rendering Performance (CRITICAL)

**Inline handlers creating new functions every render**:

```tsx
// SmartRoster.tsx — line 129: new function on every render
renderResourceLabel={({ resource }) => {
  const record = resource?._resource?.extendedProps?.record
  // ... rendering logic
}}

// SmartRoster.tsx — line 164: async inline handler
eventReceive={async (el: any) => {
  await eventReceive(event, dateRange)
  event.remove()
  refetchRosterEvents()
}}
```

**`React.memo` is ineffective**:

```tsx
// IdronectRoster.tsx — line 374
export default React.memo(IdronectRoster);
```

Props include deep objects (`events`, `resources`, `filter`, `calendarSettings`). Shallow comparison always returns false, so memo does nothing. No custom comparator is provided.

**Events array rebuilt on every filter change**:

```tsx
// useSmartEvents.ts — line 42
const rosterEvents = useMemo(() => { ... },
  [data, eventField, paramsState, resources, smartConfig, smartStatusData, timezone]
)
```

Dependencies include entire `smartConfig` and `paramsState` objects. Any property change (even unrelated ones) triggers full event recalculation.

**60-second polling for ALL views**:

```tsx
staleTime: StaleTime.REALTIME; // 60 seconds
```

Every calendar view polls the server every 60 seconds regardless of whether data has changed. No websocket-based invalidation.

**No virtualization**: All resource rows and events are rendered in the DOM simultaneously. With 100+ resources in timeline view, this means thousands of DOM nodes.

### 3.3 Styling (HIGH)

**Three competing style systems**:

1. `CalendarStyles.tsx` — styled-components with template literals and antd tokens
2. `AvailabilityRoster.tsx` — inline `<style>` tags (40+ lines injected into DOM per render)
3. Various components — Tailwind utility classes

**25+ `!important` overrides**: Needed to fight FullCalendar's internal CSS specificity:

```css
.fc-datagrid-cell-frame:hover {
  background-color: rgba(24, 144, 255, 0.08) !important;
}
```

**Dark mode handled inconsistently**:

- `CalendarStyles.tsx`: uses antd token system (`colorBgContainer`, `colorBorder`)
- `AvailabilityRoster.tsx`: hardcoded dark mode colors in inline `<style>` with `.dark` selectors
- Some views have no dark mode support at all

**Operator-injected CSS**: `timelineCustomCss` setting allows operators to inject raw CSS strings, bypassing all design system controls.

### 3.4 Code Quality (MEDIUM)

| Issue                                                                     | Location                                                                          |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `@ts-ignore` (4 instances)                                                | `SmartRoster.tsx` line 108, `IdronectRoster.tsx` lines 201, 286, 306              |
| Debug logs gated by const                                                 | `IdronectRoster.tsx` line 41: `const debugLog = false` with 6 `console.log` calls |
| Debug logs in hook                                                        | `SmartRoster.tsx` lines 33-38: `const DEBUG = Meteor.isDevelopment && false`      |
| `any` types in interfaces                                                 | `IAvailabilityRosterProps`: 6 props typed as `any`                                |
| `ISmartRosterParams`: `eventReceive?: any`, `onUpdate?: any`              |                                                                                   |
| Commented-out code                                                        | `IdronectRoster.tsx` lines 204-207: disabled popover feature                      |
| `IIdronectRosterProps.ts`: full interface likely has `any` escape hatches |                                                                                   |
| Hardcoded `rerenderDelay={100}`                                           | `IdronectRoster.tsx` line 312, `AvailabilityRoster.tsx` line 114                  |

### 3.5 UX Issues (MEDIUM)

**No loading state during event fetch**: Calendar renders empty, then events pop in after data loads. Only settings loading shows a skeleton.

**No error state**: If event fetch fails, calendar stays empty with no feedback.

**Silent drag failures**: `SmartRoster.tsx` line 164-185 — `eventReceive` has no try/catch. If the server call fails, the temporary event is already removed.

**Mobile: forced horizontal scroll**: `AvailabilityRoster.tsx` sets `minWidth: 900` forcing horizontal scroll on all mobile devices.

**Compact mode not auto-enabled on mobile**: `timelineCompactMode` is operator-level setting, not responsive.

**Resource area too narrow on mobile**: 140px truncates long aircraft registrations and crew names with no tooltip.

**`highPerformanceMode` setting exists but is never used**: The setting is in the form fields and schema but no code reads it.

### 3.6 FullCalendar-Specific Bugs/Workarounds

Documented in code comments:

1. **Timezone hack** (`useCalendarEventDrag.ts` line 95-97, `SmartRoster.tsx` line 173-178):

   > "FULLCALENDAR SEEMS TO DO VERY WONKY THINGS HERE - THIS IS A HACK"

   All drag/drop date conversions require manual timezone correction because FullCalendar returns dates in unexpected formats.

2. **`_def` undefined crash** (`useCalendarEventDrag.ts` line 256-260):

   > "This is a fullCalendar bug; \_def is undefined sometimes, causing draggedEvent?.id to crash"

   Guard added to prevent crash on drag.

3. **`timeZone='local'` broken** (`useSmartEvents.ts` line 91-93):
   ```typescript
   if (tz === "local") {
     throw new Error("Do not use the default timezone 'local', it doesn't work properly.");
   }
   ```

---

## 4. Proposed Custom Calendar Architecture

### 4.0 Package Philosophy

This is a **standalone, general-purpose React calendar package** — not an Aviatize internal module. It should work in any React + Tailwind project with zero domain knowledge.

**Core package** provides: views, virtualization, drag/drop, selection, keyboard nav, animations, theming.
**Consumer provides**: events data, resource data, custom renderers, action handlers, domain-specific overlays.

All domain-specific logic (aviation, medical, education, etc.) lives in the consumer, not the package. The package exposes **render slots**, **callback props**, and a **plugin API** for extensibility.

### 4.1 Design Principles

1. **General-purpose** — Works for any scheduling domain. No hardcoded business logic. All behavior is configurable via props and plugins.
2. **Virtualize everything** — Only render visible rows and columns. Critical for 100+ resource timelines.
3. **Tailwind-native** — Styled with Tailwind utility classes. Dark mode via `dark:` variants. Fully themeable via CSS variables for non-Tailwind consumers.
4. **Minimal dependencies** — CSS Grid for layout, `date-fns-tz` for dates, Zustand for internal state. No external calendar library.
5. **Progressive rendering** — Show skeleton immediately, stream in events as they load.
6. **Render slots everywhere** — Every visual element (event, resource label, toolbar section, time header, context menu) is replaceable via render props.
7. **Headless option** — Core logic (state, virtualization, collision detection, drag math) available as hooks for consumers who want full rendering control.

### 4.2 Performance Targets

| Metric                                | Current (FullCalendar) | Target             |
| ------------------------------------- | ---------------------- | ------------------ |
| Calendar JS bundle                    | ~300-400KB gzipped     | <50KB gzipped      |
| Initial render (empty)                | ~200ms                 | <50ms              |
| Initial render (200 events)           | ~500-800ms             | <150ms             |
| View switch                           | ~300ms                 | <100ms             |
| Drag feedback latency                 | ~50-100ms              | <16ms (1 frame)    |
| Resource rows before jank             | ~50-80                 | 500+ (virtualized) |
| DOM nodes (100 resources, 200 events) | ~5000+                 | <500 (virtualized) |

### 4.3 Component Architecture

```
<Calendar>  (root — generic, no domain logic)
├── <CalendarToolbar>
│   ├── <DateNavigation />          (today/prev/next + date picker)
│   ├── <ViewSelector />            (segmented control)
│   ├── toolbarLeft={ReactNode}     ← RENDER SLOT (consumer adds filters, badges, etc.)
│   ├── toolbarCenter={ReactNode}   ← RENDER SLOT
│   └── toolbarRight={ReactNode}    ← RENDER SLOT (consumer adds export, refresh, etc.)
│
├── <CalendarBody>  (view router — renders the active view)
│   ├── <TimelineView>              (resource timeline — horizontal time axis)
│   │   ├── <ResourceSidebar>       (virtualized)
│   │   │   ├── resourceGroupHeader={({ group }) => ReactNode}  ← RENDER SLOT
│   │   │   └── resourceLabel={({ resource }) => ReactNode}     ← RENDER SLOT
│   │   ├── <TimeGrid>              (CSS Grid, virtualized columns)
│   │   │   ├── <TimeHeader />
│   │   │   ├── <NowIndicator />
│   │   │   ├── <BusinessHoursOverlay />
│   │   │   ├── timelineBands={TimelineBand[]}   ← PLUGIN SLOT (weather, daylight, etc.)
│   │   │   └── <EventLane>         (per resource, collision-resolved)
│   │   │       └── eventContent={({ event, width }) => ReactNode}  ← RENDER SLOT
│   │   └── <SelectionOverlay />
│   │
│   ├── <WeekView>                  (vertical time grid)
│   │   ├── <DayColumnHeaders />
│   │   ├── <TimeSlotColumn>        (per day)
│   │   │   ├── <EventStack>        (collision-resolved)
│   │   │   └── <NowIndicator />
│   │   └── <SelectionOverlay />
│   │
│   ├── <MonthView>                 (day grid)
│   │   ├── <WeekRow>
│   │   │   └── <DayCell>
│   │   │       ├── eventChip={({ event }) => ReactNode}  ← RENDER SLOT
│   │   │       └── <OverflowIndicator />  (+N more)
│   │   └── <SelectionOverlay />
│   │
│   └── <ListView>                  (list format)
│       └── listItem={({ event, date }) => ReactNode}  ← RENDER SLOT
│
├── <DragLayer>                     (portal-based drag preview)
│   ├── <DragGhost />               (event preview following cursor)
│   ├── <DragTimeTooltip />         (shows new start/end time)
│   └── <DropIndicator />           (snap-to-grid highlight)
│
├── <SelectionLayer>                (time range selection)
│   └── <SelectionRect />
│
├── resourceDecorator={({ resource }) => ReactNode}  ← PLUGIN SLOT (duty bars, progress, etc.)
│
└── <ContextMenuProvider>           (right-click menus)
    └── contextMenuItems={({ target }) => MenuItem[]}  ← CONSUMER CALLBACK
```

**Key principle**: Every `← RENDER SLOT` and `← PLUGIN SLOT` has a sensible default but is fully replaceable. The consumer never fights the library — they just replace the slot.

### 4.4 State Management

Zustand store replacing FullCalendar's internal state:

```typescript
interface CalendarStore {
  // View state
  currentView: CalendarViewType;
  currentDate: Date;
  dateRange: { start: Date; end: Date };

  // Resource state
  resources: CalendarResource[];
  resourceGroups: CalendarResourceGroup[];
  filteredResourceIds: string[];
  filteredGroupIds: string[];

  // Interaction state
  selection: { start: Date; end: Date; resourceId?: string } | null;
  dragState: DragState | null;
  hoveredSlot: { date: Date; resourceId?: string } | null;

  // Actions
  setView: (view: CalendarViewType) => void;
  navigateDate: (direction: "prev" | "next" | "today" | Date) => void;
  setSelection: (selection: Selection | null) => void;
  startDrag: (event: CalendarEvent, origin: DragOrigin) => void;
  updateDrag: (position: DragPosition) => void;
  endDrag: () => void;
  setResourceFilter: (ids: string[]) => void;
}
```

Separate from data fetching — events come from TanStack Query, state is UI-only.

### 4.5 Data Layer

The package is **data-source agnostic**. It does not fetch data — the consumer provides events and resources as props. The package only handles rendering and interaction.

```tsx
// Consumer provides data — any fetching strategy works
<Calendar
  events={events}               // CalendarEvent[]
  resources={resources}          // CalendarResource[] (optional, for timeline/resource views)
  loading={isLoading}            // boolean — triggers skeleton state
  onDateRangeChange={range => {  // called when user navigates — consumer refetches
    refetch(range.start, range.end)
  }}
  onEventDrop={info => { ... }}  // consumer handles mutation
  onEventResize={info => { ... }}
  onSelect={info => { ... }}
  onEventClick={info => { ... }}
/>
```

**Aviatize integration** would wrap this with TanStack Query:

```typescript
// Aviatize-specific wrapper (NOT in the package)
const useCalendarEvents = ({ smartConfig, dateRange, listParams }) => {
  return useQuery({
    queryKey: ["calendar-events", smartConfig.value, dateRange, listParams],
    queryFn: () => fetchEvents({ smartConfig, dateRange, listParams }),
    staleTime: 5 * 60 * 1000,
  });
};
```

### 4.6 Virtualization Strategy

**Timeline View** (most performance-critical):

- **Vertical**: Only render resource rows in viewport + buffer. Use `react-virtual` or custom IntersectionObserver.
- **Horizontal**: Only render time columns in viewport + buffer. CSS Grid with fixed column widths.
- **Event rendering**: Position events absolutely within their lane. Only calculate positions for visible lanes.

**Estimated DOM reduction**: 100 resources with 200 events:

- Current: ~5000+ nodes (all rendered)
- Virtualized: ~300-500 nodes (only visible)

### 4.7 Drag & Drop Architecture

Replace FullCalendar's drag system with a custom implementation:

```
DragSource (event element or external list item)
  → onDragStart: capture event data, show DragGhost
  → onDragMove: update DragGhost position, calculate snap target
  → onDragOver lane: highlight target slot, validate drop
  → onDrop: calculate new dates/resource, show confirmation modal
  → onDragCancel: revert visual state
```

**Snap-to-grid**: Round drag position to nearest slot boundary based on `slotDuration`.

**Resource reassignment**: The package reports what changed (old/new resource, old/new dates). The consumer decides what to do with it (e.g., Aviatize reassigns aircraft/crew). This keeps domain logic out of the package.

**External drag**: Package provides a `<DraggableSource>` wrapper component. Consumer wraps their sidebar items with it. Package handles drop zone detection and calls `onEventReceive` with the drop coordinates.

**Validation**: Consumer provides an optional `validateDrop` callback. Package shows green/red indicators based on the return value. All validation logic lives in the consumer.

```tsx
<Calendar
  validateDrop={({ event, newStart, newEnd, newResourceId }) => {
    // Consumer-defined: check for conflicts, business rules, etc.
    if (hasOverlap(events, newStart, newEnd, newResourceId)) {
      return { valid: false, message: "Conflicts with existing event" };
    }
    return { valid: true };
  }}
/>
```

### 4.8 Styling & Theming Architecture

**Two styling modes** for maximum compatibility:

1. **Tailwind mode** (default): All elements use Tailwind utility classes. Dark mode via `dark:` variants. Consumers can override any class via `classNames` prop.
2. **CSS Variables mode**: For non-Tailwind projects, all colors/spacing/radii exposed as CSS custom properties. Consumer overrides the variables.

```tsx
// Tailwind consumers — override specific element classes
<Calendar
  classNames={{
    root: 'rounded-xl shadow-lg',
    toolbar: 'bg-gray-50 dark:bg-gray-800 px-4 py-2',
    event: 'rounded-md shadow-sm',
    resourceLabel: 'text-sm font-medium',
    nowIndicator: 'bg-red-500',
    // ... every visual element is overridable
  }}
/>

// Non-Tailwind consumers — override CSS variables
<Calendar
  style={{
    '--cal-bg': '#ffffff',
    '--cal-bg-dark': '#111827',
    '--cal-border': '#e5e7eb',
    '--cal-accent': '#3b82f6',
    '--cal-radius': '8px',
    '--cal-font-size': '14px',
  }}
/>
```

**Dark mode**: Automatic via `dark:` class (Tailwind) or `prefers-color-scheme` media query (CSS variables). No manual toggle needed.

**Compact mode**: `compact` boolean prop reduces all spacing/font sizes. Auto-enabled when resources > configurable threshold.

**No `!important` needed**: We control all CSS, no library styles to fight.

### 4.9 Plugin API

Plugins add visual layers and behaviors without modifying core code. Each plugin is a plain object that the package merges into its rendering pipeline.

```typescript
interface CalendarPlugin {
  // Add bands/overlays to the timeline (e.g., weather, daylight, duty periods)
  timelineBands?: (dateRange: DateRange) => TimelineBand[]

  // Decorate resource labels (e.g., duty hour progress bar, status badge)
  resourceDecorator?: (resource: CalendarResource) => ReactNode

  // Add items to context menus
  contextMenuItems?: (target: ContextMenuTarget) => MenuItem[]

  // Custom event validation on drag/resize
  validateDrop?: (info: DropInfo) => ValidationResult

  // Custom toolbar sections
  toolbarWidgets?: { position: 'left' | 'center' | 'right'; render: () => ReactNode }[]
}

// Usage
;<Calendar
  plugins={[weatherOverlayPlugin, dutyTimePlugin]}
  // ...
/>
```

**Aviatize-specific plugins** (built outside the package):

- `aviatizeWeatherPlugin` — METAR/TAF color band on timeline
- `aviatizeDutyTimePlugin` — crew duty hour progress bars on resource labels
- `aviatizeSunTimesPlugin` — sunrise/sunset gradient overlay
- `aviatizeTrainingPlugin` — syllabus progress on training events

This keeps the core package domain-agnostic while allowing Aviatize to layer on aviation-specific visuals.

### 4.10 Timezone Handling

Use `date-fns-tz` instead of FullCalendar's timezone engine. Consumer passes a `timezone` string prop — the package handles all display conversion internally:

```typescript
import { zonedTimeToUtc, utcToZonedTime, format } from "date-fns-tz";

// Display: convert UTC event time to operator timezone
const displayTime = utcToZonedTime(event.start, operatorTimezone);

// Mutation: convert user-selected time back to UTC for storage
const utcTime = zonedTimeToUtc(selectedTime, operatorTimezone);
```

No more "FULLCALENDAR SEEMS TO DO VERY WONKY THINGS HERE" hacks.

---

## 5. Migration Strategy

### Phase 1: Foundation (No UI changes)

Build the core calendar engine as new components without touching existing code:

- `AviatizeCalendar` root component
- Zustand store
- CSS Grid layout engine
- Time slot calculation utilities
- Event collision/stacking algorithm

### Phase 2: AvailabilityRoster (Simplest replacement)

- Only uses `resourceTimeGrid` (day/week)
- No drag between resources
- No external drag sources
- Fewest event types
- Isolated in `availabilities/` module
- **Success criteria**: Same visual output, dark mode working, faster render

### Phase 3: IdronectSchedule (Medium complexity)

- Standard time grid views (week/month)
- No resources
- Event click, drag, resize
- Custom event rendering (flight plans)

### Phase 4: IdronectCalendar (Medium complexity)

- Standard grid/list views
- Smart System integration
- Selection and create flow

### Phase 5: IdronectRoster (Most complex — last)

- Resource timeline (the premium feature)
- All drag interactions (internal + external + copy)
- Resource grouping and filtering
- Resource capping
- Compact mode
- All event renderers
- **This is the hardest part** — schedule adequate time

### Phase 6: Cleanup

- Remove all `@fullcalendar/*` packages
- Cancel premium license
- Remove `CalendarStyles.tsx`, all `@ts-ignore` workarounds
- Remove timezone hacks

### Adapter Pattern

Each new component accepts the same prop interface as the old one, allowing gradual rollout:

```typescript
// Old: <IdronectRoster events={events} resources={resources} ... />
// New: <AviatizeTimeline events={events} resources={resources} ... />
// Same props, different internals
```

Feature flags can toggle between old and new per-operator during migration.

---

## 6. Key Files Reference

### Wrapper Components (to be replaced)

| File                                                                   | Lines | Complexity                          |
| ---------------------------------------------------------------------- | ----- | ----------------------------------- |
| `operations/client/containers/resources/IdronectRoster.tsx`            | 375   | HIGH — most props, resource capping |
| `commons/smart/calendar/SmartRoster.tsx`                               | 228   | HIGH — Smart System integration     |
| `operations/client/containers/resources/IdronectSchedule.tsx`          | ~250  | MEDIUM — time grid views            |
| `commons/smart/calendar/IdronectCalendar.tsx`                          | ~200  | MEDIUM — basic calendar             |
| `availabilities/client/containers/availability/AvailabilityRoster.tsx` | 203   | LOW — focused scope                 |
| `operations/client/roster/RosterTimelineView.jsx`                      | ~100  | LOW — minimal config                |

### Hooks (to be replaced/rewritten)

| File                                                                    | Lines | Purpose                                                 |
| ----------------------------------------------------------------------- | ----- | ------------------------------------------------------- |
| `commons/hooks/useCalendarEventDrag.ts`                                 | 400   | Flight plan drag/drop/resize with resource reassignment |
| `commons/smart/calendar/useSmartEvents.ts`                              | 124   | Event data fetching and transformation                  |
| `commons/smart/calendar/useSmartCalendarEventDrag.ts`                   | ~150  | Generic Smart System drag/resize                        |
| `operations/client/hooks/useCalendarEvent.ts`                           | ~200  | Calendar event CRUD                                     |
| `operations/client/hooks/useManagerRosteringEvents.ts`                  | ~150  | Manager rostering data                                  |
| `availabilities/client/hooks/useAvailabilityCalendarEvent.ts`           | ~150  | Availability CRUD                                       |
| `operations/client/containers/resources/useCalendarChangeView.ts`       | ~50   | View switching                                          |
| `operations/client/containers/resources/useCalendarEventContextMenu.ts` | ~80   | Right-click menu                                        |
| `commons/helpers/useCalendarSelectAllow.ts`                             | ~50   | Selection validation                                    |

### Event Renderers (to be adapted)

| File                                                                          | Purpose                        |
| ----------------------------------------------------------------------------- | ------------------------------ |
| `operations/client/containers/resources/CalendarFlightPlan.tsx`               | Rich flight plan visualization |
| `operations/client/containers/resources/CalendarFlightPlanSimple.tsx`         | Compact flight plan            |
| `operations/client/containers/resources/CalendarFlightPlanPopover.tsx`        | Hover popover content          |
| `operations/client/containers/resources/CalendarBehavior.tsx`                 | Behavior visualization         |
| `availabilities/client/containers/availability/CalendarAvailabilityEvent.tsx` | Availability event             |
| `commons/smart/calendar/renderSmartScheduleContent.tsx`                       | Smart System event renderer    |

### Styling (to be removed)

| File                                                        | Purpose                               |
| ----------------------------------------------------------- | ------------------------------------- |
| `operations/client/containers/resources/CalendarStyles.tsx` | styled-components wrapper (214 lines) |
| Inline `<style>` in `AvailabilityRoster.tsx` lines 157-198  | Dark mode + availability styles       |

### Toolbar (to be adapted, mostly reusable)

| File                                                                          | Purpose              |
| ----------------------------------------------------------------------------- | -------------------- |
| `operations/client/containers/resources/CalendarTitle.tsx`                    | Main toolbar         |
| `availabilities/client/containers/availability/AvailabilityCalendarTitle.tsx` | Availability toolbar |
| `operations/client/containers/resources/CalendarViewTypeSelector.tsx`         | View switcher        |
| `operations/client/containers/resources/CalendarResourceSelector.tsx`         | Resource filter      |
| `operations/client/containers/resources/ExportCalendarButton.tsx`             | iCal export          |

### Types (to be preserved/extended)

| File                                                             | Purpose                    |
| ---------------------------------------------------------------- | -------------------------- |
| `operations/client/containers/resources/IIdronectRosterProps.ts` | Roster prop types          |
| `operations/client/containers/resources/IFlightPlanDragState.ts` | Drag state types           |
| `operations/client/containers/resources/IDatesSet.ts`            | Date range callback type   |
| `commons/smart/calendar/IRenderEventContent.ts`                  | Event render function type |
| `commons/smart/overview/types/ICalendarSelectParams.tsx`         | Selection callback type    |
| `operations/enums/CalendarViewTypes.ts`                          | View type enum             |
| `enums/CalendarEventTypes.ts`                                    | Event type enum            |
| `enums/calendarEventTypeData.ts`                                 | Event type data array      |

### Settings (no changes needed)

| File                                                                 | Purpose            |
| -------------------------------------------------------------------- | ------------------ |
| `operations/hooks/useCalendarSettings.ts`                            | Settings hook      |
| `operations/types/IEnhancedCalendarSettings.ts`                      | Settings interface |
| `operations/config/calendar-settings/calendarSettingsFormFields.tsx` | Settings form      |

---

## 7. UX Improvements (Frontend-Only)

Every improvement below is **purely frontend** — no backend changes required. Each is built into the package core or exposed as a configurable feature. Domain-specific features (aviation, medical, etc.) are handled via the plugin API described in section 4.9, not hardcoded.

### 7.1 Adaptive Information Density

**Current problem**: Event rendering is binary — either "rich" (avatars crammed into a tiny bar) or "simple" (just text). `CalendarFlightPlan.tsx` renders the same avatar group regardless of whether the event slot is 20px wide or 200px wide. In compact mode (20px height), content overflows and clips.

**Solution**: The package measures available pixel width per event lane using a single `ResizeObserver` (not per event — too expensive) and exposes a `density` value to the consumer's `eventContent` render prop:

```tsx
<Calendar
  eventContent={({ event, density }) => {
    // density: 'micro' (<60px) | 'compact' (60-150px) | 'full' (>150px)
    // Thresholds are configurable via densityBreakpoints prop
    if (density === "micro") return <ColorDot color={event.color} />;
    if (density === "compact") return <span>{event.title}</span>;
    return <FullEventCard event={event} />;
  }}
  densityBreakpoints={{ micro: 60, compact: 150 }}
/>
```

**Package provides**: Width measurement, density calculation, tooltip on hover for micro/compact events (shows full details).
**Consumer provides**: What to render at each density level.

**Performance**: One `ResizeObserver` per visible lane (not per event). Density recalculated only on resize/zoom, not on every render.

### 7.2 Progressive Loading with Skeleton

**Current problem**: Calendar renders empty while events load, then all events pop in at once. No visual feedback during the 200-800ms fetch.

**Solution**: Built into the package via the `loading` prop:

```tsx
<Calendar
  events={events}
  loading={isLoading} // triggers built-in skeleton state
  skeletonCount={15} // approximate number of shimmer bars to show (optional)
/>
```

Three-stage rendering:

1. **Instant** (0ms): Calendar grid with time slots, resource labels, business hours shading renders immediately from props.
2. **Skeleton** (`loading=true`): Animated shimmer bars appear in event lanes. Count based on `skeletonCount` or auto-estimated from previous render.
3. **Populated** (`loading=false`): Events fade in with 150ms opacity transition. No layout shift — skeleton bars match expected event sizes.

**Additional**: Subtle progress dot in toolbar during refetch (not a full spinner). All CSS-only, no extra dependencies.

### 7.3 Preview Panel

**Current problem**: Event detail is either a heavy popover (creates new React tree per hover, acknowledged as "potentially slower") or a full-page drawer (loses calendar context).

**Solution**: The package provides a built-in panel slot:

```tsx
<Calendar
  previewPanel={{
    enabled: true,
    position: "right", // 'right' | 'bottom'
    width: 350, // px
    collapsible: true,
  }}
  onEventClick={(event) => setSelectedEvent(event)}
  previewContent={({ selectedEvent }) => (
    // Consumer renders whatever they want in the panel
    <FlightPlanSummary flightPlan={selectedEvent.record} />
  )}
/>
```

```
┌─────────────────────────────────────────────┬──────────────┐
│ [Toolbar]                                   │              │
├────────┬────────────────────────────────────┤  Consumer-   │
│ Rsrc 1 │  [event]    [event]               │  rendered    │
│ Rsrc 2 │       [selected ▸]                │  preview     │
│ Rsrc 3 │  [event]                          │  panel       │
└────────┴────────────────────────────────────┴──────────────┘
```

- Click event = populate panel (no modal, no drawer, no context loss)
- Panel is collapsible with smooth animation
- On mobile: slides up as bottom sheet
- Keyboard: Arrow keys navigate events, panel updates instantly
- Consumer owns panel content — package only provides the layout slot

### 7.4 Smart Drag Feedback

**Current problem**: No time indication during drag. No drop validity feedback. FullCalendar timezone bugs make dropped times unreliable. Confirmation modal after every drop loses context.

**Solution**: Built into the package's drag layer (zero configuration):

1. **Time tooltip**: Floating label showing new start/end time + delta from original:

   ```
   ┌─────────────────────┐
   │  14:30 – 16:00      │
   │  +2h from original  │
   └─────────────────────┘
   ```

2. **Ghost event**: Semi-transparent copy stays at the original position showing the before/after.

3. **Drop validity**: Package calls the consumer's `validateDrop` function and visualizes the result:
   - Green slot highlight = valid
   - Red slot + "x" cursor = invalid (consumer's reason shown as tooltip)
   - Orange slot = valid but with warning (e.g., resource change)

4. **Resource change label**: When crossing resource lanes:

   ```
   Resource A → Resource B
   ```

5. **Snap feedback**: Subtle border flash when event snaps to slot boundary.

All built-in. Consumer only needs to provide `validateDrop` for custom rules. Without it, all drops are valid.

### 7.5 Client-Side Conflict Detection

**Current problem**: Overlap is a global on/off toggle. No warning when creating scheduling conflicts.

**How it works frontend-only**: All events visible in the current date range are already loaded in memory. The package compares event times across all loaded events and resources to find overlaps. No server round-trip needed.

**Solution**: Built-in conflict detection with consumer-configurable rules:

```tsx
<Calendar
  conflictDetection={{
    enabled: true,
    // Package provides built-in overlap check.
    // Consumer can add custom rules:
    customValidator: ({ event, overlappingEvents }) => {
      // e.g., same crew on two flights = conflict
      // e.g., background events (maintenance) are always conflicts
      return overlappingEvents.some((e) => e.resourceId === event.resourceId)
        ? { level: "error", message: "Resource double-booked" }
        : null;
    },
    // Visual behavior:
    highlightConflicts: true, // pulsing red border on conflicting events
    showConflictCount: true, // badge: "2 conflicts"
    warnOnly: true, // warn but don't prevent (operators know best)
  }}
/>
```

**Performance**: Conflict check runs on the already-loaded events array using a simple interval-overlap algorithm (O(n log n) sort + sweep). No server calls. Only recalculates on event data change, not on every render.

### 7.6 Keyboard Navigation & Shortcuts

**Current problem**: Calendar is mouse-only. No keyboard support at all.

**Solution**: Built into the package with configurable shortcut map:

| Default Shortcut | Action                                 | Configurable |
| ---------------- | -------------------------------------- | ------------ |
| `T`              | Go to today                            | Yes          |
| `D` / `W` / `M`  | Switch to Day / Week / Month view      | Yes          |
| `←` / `→`        | Navigate prev / next period            | Yes          |
| `↑` / `↓`        | Move focus between resources/events    | Yes          |
| `Enter`          | Trigger `onEventClick` for focused     | Yes          |
| `N`              | Trigger `onSelect` at focused slot     | Yes          |
| `Esc`            | Close preview panel / cancel selection | Yes          |
| `/`              | Focus the search input (if enabled)    | Yes          |
| `Cmd+Z`          | Undo (if enabled)                      | Yes          |
| `?`              | Show keyboard shortcut overlay         | Yes          |

```tsx
<Calendar
  keyboardShortcuts={{
    enabled: true,
    customBindings: { "Shift+R": () => refetch() },
  }}
/>
```

- Visual focus ring on focused slot/event (respects `focus-visible` for keyboard-only)
- Tab cycles between events within a slot
- Shortcuts only active when calendar is focused (no global capture)
- Floating cheat sheet overlay on `?`

### 7.7 Built-In Search & Filter

**Current problem**: Filtering requires opening a drawer, selecting resources, closing drawer. Three clicks minimum.

**Solution**: The package provides an optional built-in filter bar:

```tsx
<Calendar
  filterBar={{
    enabled: true,
    searchable: true, // type-ahead search across event titles
    searchFields: ["title"], // which event fields to search (consumer defines)
    filterGroups: [
      // consumer defines filter categories
      { key: "resourceId", label: "Resource", options: resourceOptions },
      { key: "type", label: "Type", options: typeOptions },
    ],
    persistKey: "my-calendar", // localStorage key for filter persistence
  }}
/>
```

```
┌─────────────────────────────────────────────────────────┐
│ [Today] [<] [>]  [Date Picker]        [Views] [Filter]  │
├─────────────────────────────────────────────────────────┤
│ Search events...  │ Resource ▼ │ Type ▼                  │
│ Active: [John Doe ×] [Training ×]          [Clear all]  │
└─────────────────────────────────────────────────────────┘
```

- **Search**: Filters in-memory (already loaded events). Matching events stay at full opacity, non-matching fade to 30%.
- **Filter pills**: Show active filters as removable chips
- **localStorage persistence**: Remember filters across sessions per `persistKey`
- **All client-side**: No server calls. Filters operate on the `events` array prop.

### 7.8 Multi-Select & Batch Operations

**Current problem**: Every operation is single-event. Rescheduling 5 events requires 5 individual drags.

**Solution**: Selection state managed inside the package, actions delegated to consumer callbacks:

```tsx
<Calendar
  multiSelect={{
    enabled: true,
    onSelectionChange: selectedEvents => { ... },
    batchActions: [
      { label: 'Move +1 day', action: events => handleBatchMove(events, 1) },
      { label: 'Delete', action: events => handleBatchDelete(events), variant: 'danger' },
    ],
  }}
/>
```

- **Cmd/Ctrl + Click**: Toggle event in selection. Selected events get a blue ring.
- **Drag-select**: Rectangle selection over the timeline/grid.
- **Batch toolbar**: Appears when 2+ events selected. Shows consumer-defined action buttons.
- **Batch drag**: Drag one selected event, all selected events move together (maintaining relative offsets). Package handles the visual movement. On drop, calls `onEventDrop` with all affected events.

**Package handles**: Selection state, visual indicators, rectangle selection math, batch drag visuals.
**Consumer handles**: What to do with the selected events (mutations are server calls the consumer makes).

### 7.9 Mobile-Native Experience

**Current problem**: Calendar forces `minWidth: 900` causing horizontal scroll. Toolbar hidden on mobile.

**Solution**: Responsive breakpoints built into the package:

```tsx
<Calendar
  responsive={{
    // Below this width, switch to mobile layout
    mobileBreakpoint: 768,
    // Mobile-specific defaults
    mobileDefaultView: "day",
    mobileCompact: true,
  }}
/>
```

**Mobile layout** (auto-enabled below breakpoint):

- **Swipe left/right**: Navigate between days/weeks
- **Pinch to zoom**: Change time slot granularity
- **Long press on slot**: Triggers `onSelect`
- **Tap event**: Opens preview as bottom sheet (not side panel)
- **Compact toolbar**: Stacks vertically, priority-based truncation
- **Single-column day view**: No horizontal scroll ever
- **Timeline → List fallback**: Resource timeline becomes a grouped list on mobile

All via CSS media queries + touch event handlers. No separate mobile component — same component adapts.

### 7.10 Smooth Animations

**Solution**: Built into the package. All animations use CSS transitions/keyframes (no JS animation library). All respect `prefers-reduced-motion`. All < 200ms. All interruptible.

| Interaction                    | Animation                                       |
| ------------------------------ | ----------------------------------------------- |
| View change (day→week)         | Crossfade with slight scale (150ms)             |
| Date navigation (prev/next)    | Slide left/right (200ms ease-out)               |
| Event appears (after fetch)    | Fade in + subtle scale 0.95→1.0 (150ms)         |
| Event drag                     | Lift shadow (8px) + scale 1.02 while dragging   |
| Event drop confirmed           | Settle bounce 1.02→1.0 (100ms)                  |
| Event removed                  | Scale to 0.9 + fade out (150ms)                 |
| Resource group collapse/expand | Height animation with content clip (200ms)      |
| Filter applied                 | Non-matching events fade to 30% opacity (200ms) |
| Hover on event                 | Subtle border glow (100ms)                      |
| Now indicator dot              | Pulse (2s cycle, subtle)                        |

Configurable:

```tsx
<Calendar animations={{ enabled: true, duration: 150 }} />
// or disabled entirely:
<Calendar animations={{ enabled: false }} />
```

### 7.11 Zoom & Time Scale

**Current problem**: Time scale is fixed by a setting (admin only). No way to zoom during use.

**Solution**: Built into the package:

- **Ctrl/Cmd + Scroll wheel**: Zoom in/out on time axis (5min → 4hr range)
- **Pinch gesture** (mobile/trackpad): Same behavior
- **Zoom presets**: Optional toolbar buttons via `toolbarRight` slot
- **Zoom to fit**: `calendarRef.zoomToFit()` API — auto-calculates best zoom to show all events

```tsx
<Calendar
  zoom={{
    enabled: true,
    min: 5, // minutes per slot (zoomed in)
    max: 240, // minutes per slot (zoomed out)
    default: 30,
    presets: [15, 30, 60, 120], // shown as toolbar buttons
  }}
/>
```

Zoom is purely visual CSS transform + grid recalculation. No data refetch.

### 7.12 Context Menus

**Current problem**: Minimal right-click support.

**Solution**: Package provides the context menu infrastructure. Consumer defines the menu items:

```tsx
<Calendar
  contextMenu={({ target }) => {
    // target.type: 'event' | 'slot' | 'resource'
    if (target.type === "event") {
      return [
        { label: "View Details", action: () => openDetail(target.event) },
        { label: "Edit", action: () => openEdit(target.event) },
        { divider: true },
        { label: "Copy to Next Day", action: () => copyEvent(target.event, +1) },
        { label: "Delete", action: () => deleteEvent(target.event), variant: "danger" },
      ];
    }
    if (target.type === "slot") {
      return [{ label: "New Event", action: () => createAt(target.date, target.resourceId) }];
    }
    if (target.type === "resource") {
      return [
        { label: "Filter to Only This", action: () => filterResource(target.resource) },
        { label: "Hide Resource", action: () => hideResource(target.resource) },
      ];
    }
    return [];
  }}
/>
```

Package handles: menu positioning, keyboard navigation within menu, click-outside-to-close, sub-menus.
Consumer handles: what items to show and what actions to take.

### 7.13 Undo/Redo

**Current problem**: No undo. Accidental drags require manual correction.

**Solution**: The package manages an action history stack. Consumer provides the mutation callbacks:

```tsx
<Calendar
  undoRedo={{
    enabled: true,
    maxHistory: 10,
    // Package captures before/after state of every drag/resize/create
    // On undo, calls the consumer's handler with the previous state:
    onUndo: ({ event, previousState }) => {
      // Consumer calls their own update API to revert
      updateEvent(event.id, previousState);
    },
    onRedo: ({ event, newState }) => {
      updateEvent(event.id, newState);
    },
  }}
/>
```

- **Cmd+Z / Cmd+Shift+Z**: Undo / Redo
- **Toast**: "Event moved to 14:00. [Undo]" — toast with inline undo button
- **Removes need for confirmation modals**: With undo available, drag confirmation becomes optional. Users who want speed disable it.

**Frontend-only**: The package stores before/after event data in memory. The consumer's `onUndo` callback makes the actual server call — same API they'd call for any edit.

### 7.14 Minimap

**Current problem**: In long time ranges or large resource lists, users lose orientation when scrolling.

**Solution**: Optional minimap overlay:

```tsx
<Calendar
  minimap={{
    time: true, // horizontal time minimap
    resources: true, // vertical resource minimap (timeline view only)
  }}
/>
```

**Time minimap** (top edge):

```
┌──[================]──────────────────────────────────┐
 06   08   10   12   14   16   18   20   22
              ▲ viewport
```

- Events shown as tiny colored dots
- Viewport bracket is draggable
- Click to jump to time

**Resource minimap** (right edge, timeline only):

```
│ ░ │  Group A
│ █ │ ← viewport
│ ░ │  Group B
```

All rendered with `<canvas>` for performance (hundreds of dots, no DOM nodes).

### 7.15 Shareable View URLs & Print

**Current problem**: Only iCal export exists. No way to share a view or print.

**Solution**:

- **URL state sync**: Encode view type, date, filters, zoom in URL query params. Navigating to the URL restores the exact view. Built into the package.
  ```
  /calendar?view=timeline&date=2026-02-14&resources=r1,r2&zoom=30
  ```
- **Print CSS**: Built-in `@media print` styles. `Cmd+P` renders a clean, black-and-white layout. No configuration needed.

```tsx
<Calendar
  urlSync={{
    enabled: true,
    paramPrefix: "cal", // ?cal_view=timeline&cal_date=...
  }}
/>
```

### 7.16 Smart Defaults

**Solution**: Sensible out-of-the-box configuration:

- **Auto-detect timezone**: `Intl.DateTimeFormat().resolvedOptions().timeZone` — browser-native, no server call
- **Adaptive compact mode**: Auto-enable when resource count > configurable threshold or screen width < breakpoint
- **Smart initial view**: Default to day view on mobile, week view on tablet, timeline on desktop
- **Responsive resource area width**: Auto-calculate based on longest resource label, with min/max bounds

```tsx
// Minimal config — sensible defaults for everything
<Calendar events={events} resources={resources} onEventDrop={handleDrop} />
// That's it. Timezone detected, responsive layout, keyboard shortcuts,
// animations, dark mode all work out of the box.
```

---

## 8. Performance Implementation Strategy

### 8.1 Why Pure TypeScript/React (Not Rust/WASM)

The performance problems documented in section 3 are **rendering-bound**, not compute-bound. The bottlenecks are: too many DOM nodes (5000+), unmemoized re-renders, no virtualization, and bundle bloat. Rust compiled to WASM excels at heavy computation but cannot help with DOM rendering — it still needs JavaScript bridge calls to touch the DOM.

**JS ↔ WASM boundary cost**: Every data transfer between JS and WASM requires serialization. For a calendar with 200 events, the boundary cost can **exceed** the computation time for small operations like collision detection on 50 visible events. This makes WASM counterproductive for the frequent, small calculations a calendar needs (drag position snapping, slot highlighting, event stacking).

**Bundle impact**: A minimal WASM module + JS glue code is typically 30-50KB gzipped — consuming most of the <50KB total bundle target before any React code is added.

### 8.2 Recommended Performance Stack

All targets from section 4.2 are achievable with these pure JS/TS techniques:

| Technique                                                         | Solves                                                        | Expected Impact                                                                                                                  |
| ----------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Virtualization** (react-virtual or custom IntersectionObserver) | DOM node count: 5000+ → <500                                  | Biggest single win. Only render visible resource rows + time columns + buffer.                                                   |
| **Web Workers**                                                   | Collision detection, conflict scanning, bulk event transforms | Offloads computation to separate thread without WASM serialization costs. Use `Transferable` objects for zero-copy data passing. |
| **Stable memoization**                                            | Full re-renders on every filter change                        | Use primitive/stable deps in `useMemo`/`useCallback`. Avoid passing entire config objects as deps.                               |
| **CSS Grid layout**                                               | Layout calculation overhead                                   | Browser-native, hardware-accelerated. No JS layout math needed.                                                                  |
| **CSS-only animations**                                           | Animation jank                                                | `transform` + `opacity` transitions run on compositor thread. No JS animation library needed.                                    |
| **`requestAnimationFrame` scheduling**                            | Drag feedback latency                                         | Batch drag position updates to animation frames for consistent 60fps.                                                            |
| **Canvas rendering**                                              | Minimap with hundreds of data points (section 7.14)           | Canvas avoids DOM node creation for dense visualizations.                                                                        |

### 8.3 Web Worker Architecture

For the computational parts that benefit from off-main-thread execution:

```
Main Thread (React)                    Worker Thread
─────────────────                      ─────────────
Events array (Transferable) ────────►  Collision detection
                                       Conflict scanning
                            ◄────────  Stacking positions[]
                                       Conflict pairs[]

Drag position + events ─────────────►  Snap-to-grid calculation
                            ◄────────  Snapped position + validity

Filter criteria + events ───────────►  Bulk filter/search
                            ◄────────  Filtered event IDs[]
```

Key principle: keep the worker stateless. Send it data, get results back. No shared mutable state.

### 8.4 When to Reconsider WASM

Revisit this decision **only** if one of these features enters scope:

| Feature                                 | Why WASM helps                                                                                                                                                                   |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auto-scheduling engine**              | Constraint solving across 1000+ events and resources is genuinely compute-heavy (NP-hard). Rust solver would be 10-50x faster than JS.                                           |
| **Offline-first sync**                  | A Rust-based CRDT sync layer compiled to WASM for conflict-free offline calendar editing. Complex state merge logic benefits from Rust's performance and correctness guarantees. |
| **Server-side PDF generation**          | Rust backend service for rendering calendar views to PDF. Not WASM — native Rust binary.                                                                                         |
| **10,000+ simultaneous visible events** | At this scale, even JS collision detection + stacking becomes a bottleneck. Unlikely for calendar use but possible for Gantt/timeline analytics views.                           |

**Decision rule**: If profiling shows a specific computation taking >16ms on the main thread (blocking a frame) and it cannot be moved to a Web Worker, then consider a surgical WASM module for that algorithm only. Do not rewrite the whole package.
