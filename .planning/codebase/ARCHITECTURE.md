# Architecture

**Analysis Date:** 2025-02-16

## Pattern Overview

**Overall:** Provider-Store-Views pattern with separation of concerns between props/config (Context) and internal state (Zustand store).

**Key Characteristics:**

- Context provides read-only configuration (events, callbacks, render slots)
- Zustand store manages mutable state (currentView, currentDate, selection, drag)
- Views are independent renderers per calendar type
- Data flows downward (props → context → hooks → components)
- Refs expose imperative API for programmatic control

## Layers

**Presentation Layer:**

- Purpose: Render calendar UI and handle user interactions
- Location: `packages/core/src/components/`, `packages/core/src/views/`
- Contains: React components (Calendar, views, event blocks, overlays, toolbar)
- Depends on: Store (via hooks), Context (for config), utils (for calculations)
- Used by: Application consuming the library

**State Management Layer:**

- Purpose: Manage mutable application state (view, date, selection, drag)
- Location: `packages/core/src/store/calendar-store.ts`
- Contains: Zustand store definition with actions and selectors
- Depends on: date-utils (for date calculations)
- Used by: All components via `useCalendarStore` hook

**Configuration Layer:**

- Purpose: Hold immutable configuration and event data
- Location: `packages/core/src/components/CalendarContext.tsx`, `CalendarProvider.tsx`
- Contains: React Context with calendar props (events, callbacks, render slots)
- Depends on: (none - provides foundation)
- Used by: Components via `useCalendarConfig` hook

**Utilities Layer:**

- Purpose: Pure functions for date math, event filtering, collision detection, positioning
- Location: `packages/core/src/utils/`
- Contains: `date-utils.ts`, `event-filter.ts`, `event-position.ts`, `collision.ts`, `conflict.ts`, `grid.ts`, `snap.ts`, `slot.ts`
- Depends on: date-fns, date-fns-tz (external)
- Used by: Views and components for calculations

**Hooks Layer:**

- Purpose: Encapsulate stateful logic and provide convenient APIs
- Location: `packages/core/src/hooks/`
- Contains: `useCalendar`, `useCalendarEvents`, `useDateNavigation`, `useDrag`, `useSelection`, `useKeyboard`, `useVirtualization`, `useDensity`
- Depends on: Store, Context, utils
- Used by: Components and views

**Types Layer:**

- Purpose: Define contracts across layers
- Location: `packages/core/src/types/`
- Contains: Event, Calendar, Config, Interaction, Resource, Plugin, Theme type definitions
- Depends on: (none - foundation)
- Used by: All other layers

## Data Flow

**Initial Render:**

1. Application passes props to `<Calendar>`
2. `Calendar` wraps children in `<CalendarProvider>` (stores config in Context)
3. `CalendarProvider` initializes Zustand store via `useCalendarStore`
4. Store calculates `dateRange` based on `currentView`, `currentDate`, `firstDay`
5. `CalendarBody` reads `currentView` from store and renders appropriate view component

**User Navigation (e.g., "next month"):**

1. View or toolbar button calls `navigateDate("next")`
2. Store's `navigateDate` action calculates new date via `navigateForView()` (view-specific increment)
3. Store updates `currentDate` and recalculates `dateRange`
4. Components subscribed to store re-render with new date range
5. Callback `onDateRangeChange` fired from `Calendar` useEffect watching `dateRange`

**Event Click Flow:**

1. Event block in view calls `onClick(event, nativeEvent)`
2. View passes to `onEventClick` callback from config
3. `CalendarBody` bridges `(event, nativeEvent)` → `{ event, nativeEvent }` object
4. Callback flows to application via `Calendar.onEventClick` prop

**State Management:**

- **View State:** `currentView`, `currentDate`, `dateRange`, `firstDay` (updated together for atomicity)
- **Interaction State:** `selection`, `dragState` (set/cleared by interaction handlers)
- **UI State:** `hoveredSlot` (transient, cleared on interaction end)
- **Filtered State:** `filteredResourceIds` (for timeline resource filtering)

## Key Abstractions

**Calendar Event:**

- Purpose: Represents a single calendar item (meeting, task, etc.)
- Examples: `packages/core/src/types/event.ts`
- Pattern: Immutable data object with optional `extendedProps` for custom attributes

**Calendar View:**

- Purpose: Renderer for specific time/layout perspective (week, month, day, etc.)
- Examples: `packages/core/src/views/week/`, `packages/core/src/views/month/`, `packages/core/src/views/timeline/`
- Pattern: Functional component that receives `events`, `dateRange`, and callback props; responsible for filtering, positioning, and rendering events

**EventPosition:**

- Purpose: Encapsulates calculated pixel coordinates for event rendering
- Examples: `packages/core/src/utils/event-position.ts`
- Pattern: Pure function returns `{ top, height }` for vertical grids or `{ left, width }` for timelines

**Time Slot:**

- Purpose: Represents a discrete time interval in grid (e.g., 30-minute increments)
- Examples: `packages/core/src/utils/slot.ts`
- Pattern: Generated array of slot boundaries used for collision detection and grid layout

**Selection/Drag State:**

- Purpose: Track ongoing user interaction
- Examples: `packages/core/src/types/interaction.ts`
- Pattern: Set on interaction start, cleared on end; allows multiple handlers (selection, drag, hover) to coexist

## Entry Points

**`<Calendar>`:**

- Location: `packages/core/src/components/Calendar.tsx`
- Triggers: Application mounts component or updates props
- Responsibilities:
  - Accept all user-facing props
  - Wrap children in CalendarProvider to establish Context and store
  - Expose imperative Ref API (getDate, setView, navigateDate, etc.)
  - Fire lifecycle callbacks (onDateRangeChange, onViewChange)
  - Render toolbar and body

**`<CalendarProvider>`:**

- Location: `packages/core/src/components/CalendarProvider.tsx`
- Triggers: Called by Calendar
- Responsibilities:
  - Initialize Zustand store with defaults from props
  - Provide Context with immutable config (events, callbacks, render slots)
  - Handle prop updates to sync store and context
  - Calculate initial dateRange

**`<CalendarBody>`:**

- Location: `packages/core/src/components/CalendarBody.tsx`
- Triggers: Rendered by Calendar after Skeleton
- Responsibilities:
  - Read currentView from store
  - Route to correct view component (WeekView, MonthView, etc.)
  - Bridge event click callback signature
  - Pass shared view props (events, dateRange, slots)

**View Components (WeekView, MonthView, etc.):**

- Location: `packages/core/src/views/<type>/`
- Triggers: CalendarBody renders based on currentView
- Responsibilities:
  - Filter and partition events (all-day vs. timed)
  - Calculate event positions (top, height, left, width)
  - Render grid, columns, rows, event blocks
  - Handle view-specific interactions (click, drag, resize)

## Error Handling

**Strategy:** Defensive with graceful fallbacks.

**Patterns:**

- Context usage without provider → Error boundary (throw in hook)
- Invalid date strings → Fallback to `new Date()` via `parseDate()`
- Missing event fields → Use defaults (empty title, red background)
- Out-of-range event times → Clamp to visible grid bounds (calculateEventPosition)
- Render slot errors → Fall back to default event content (DefaultEventContent)

## Cross-Cutting Concerns

**Logging:** No instrumentation; debug via React DevTools (Zustand extension) and browser console.

**Validation:**

- Props validated at Calendar component level (no type checking at runtime)
- Event objects validated on access (defensive reads)
- Date strings validated via parseDate utility

**Authentication:** Not applicable (calendar is UI layer only; data fetching/auth upstream).

**Customization:**

- Render slots: `eventContent`, `resourceLabel`, `resourceGroupHeader`, `previewContent`
- CSS: Custom properties (`--cal-*`) + Tailwind class overrides
- Plugins: `createPlugin` factory for timeline bands, context menu items, decorators
- Callbacks: `onEventClick`, `onEventDrop`, `onEventResize`, `onSelect`, `validateDrop`, `contextMenu`

---

_Architecture analysis: 2025-02-16_
