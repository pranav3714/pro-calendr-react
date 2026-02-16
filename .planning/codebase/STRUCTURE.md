# Codebase Structure

**Analysis Date:** 2025-02-16

## Directory Layout

```
pro-calendar/
├── packages/
│   └── core/
│       ├── src/
│       │   ├── components/         # Shared UI components
│       │   ├── views/              # Calendar view implementations
│       │   ├── hooks/              # React hooks
│       │   ├── store/              # Zustand store
│       │   ├── types/              # TypeScript type definitions
│       │   ├── utils/              # Pure utility functions
│       │   ├── plugins/            # Plugin system
│       │   ├── toolbar/            # Toolbar components
│       │   ├── headless/           # Headless (hooks + store only)
│       │   ├── constants/          # Constants and defaults
│       │   ├── styles/             # CSS
│       │   └── index.ts            # Main entry point
│       ├── dist/                   # Compiled output (generated)
│       ├── package.json            # Core package manifest
│       └── tsconfig.json           # TypeScript config
├── stories/                        # Storybook stories
├── .storybook/                     # Storybook configuration
├── .planning/                      # GSD planning documents
│   └── codebase/                   # Codebase analysis documents
├── .github/workflows/              # CI/CD workflows
├── node_modules/                   # Dependencies (not checked in)
├── coverage/                       # Test coverage reports (generated)
├── package.json                    # Root workspace manifest
└── pnpm-workspace.yaml             # pnpm workspaces config
```

## Directory Purposes

**`packages/core/src/components/`:**

- Purpose: Shared UI components used across views
- Contains: Calendar wrapper, toolbar, overlays, drag layer, event block, context menu
- Key files:
  - `Calendar.tsx` - Main entry component
  - `CalendarProvider.tsx` - Config context and store initialization
  - `CalendarBody.tsx` - View router
  - `EventBlock.tsx` - Event display component
  - `DragLayer.tsx`, `DragGhost.tsx` - Drag-drop UI
  - `SelectionOverlay.tsx` - Selection highlighting
  - `ContextMenu.tsx` - Right-click menu
  - `Skeleton.tsx` - Loading state

**`packages/core/src/views/`:**

- Purpose: View-specific implementations
- Contains: week, month, day, list, timeline subdirectories
- Pattern: Each view is independently importable via subpath exports (e.g., `@pro-calendr-react/core/views/week`)

**`packages/core/src/views/week/`:**

- Purpose: Week view implementation
- Contains: `WeekView.tsx`, `DayColumnHeaders.tsx`, `TimeSlotColumn.tsx`, `EventStack.tsx`
- Renders: Week grid with day columns and time rows; events positioned by time

**`packages/core/src/views/month/`:**

- Purpose: Month view implementation
- Contains: `MonthView.tsx`, `WeekRow.tsx`, `DayCell.tsx`
- Renders: Month calendar grid; events listed in day cells

**`packages/core/src/views/day/`:**

- Purpose: Day view implementation
- Contains: `DayView.tsx`
- Renders: Single-day time grid with hourly/slot-based rows

**`packages/core/src/views/list/`:**

- Purpose: List view implementation
- Contains: `ListView.tsx`
- Renders: Events in sorted list format (agenda)

**`packages/core/src/views/timeline/`:**

- Purpose: Timeline (resource-aware) view implementation
- Contains: `TimelineView.tsx`, `TimeHeader.tsx`, `TimeGrid.tsx`, `ResourceSidebar.tsx`, `EventLane.tsx`, `BusinessHoursOverlay.tsx`
- Renders: Horizontal timeline with resources on left, time bands, events in lanes

**`packages/core/src/hooks/`:**

- Purpose: Reusable React hooks
- Contains:
  - `useCalendar()` - Direct store access
  - `useCalendarEvents()` - Filter/select events
  - `useDateNavigation()` - Navigate dates
  - `useDrag()` - Drag-drop state
  - `useSelection()` - Selection state
  - `useKeyboard()` - Keyboard shortcuts
  - `useVirtualization()` - Virtual scrolling
  - `useDensity()` - Responsive density

**`packages/core/src/store/`:**

- Purpose: Zustand state store
- Contains:
  - `calendar-store.ts` - Store definition
  - `index.ts` - Re-exports
  - `selectors.ts` - Memoized selectors
  - `__tests__/` - Store tests

**`packages/core/src/types/`:**

- Purpose: TypeScript type definitions
- Contains: Split by domain:
  - `calendar.ts` - CalendarProps, CalendarRef
  - `event.ts` - CalendarEvent, EventDropInfo, EventClickInfo, etc.
  - `interaction.ts` - SelectInfo, DragState, ContextMenuTarget
  - `resource.ts` - CalendarResource, CalendarResourceGroup
  - `config.ts` - Feature configs (zoom, animations, shortcuts, etc.)
  - `plugin.ts` - CalendarPlugin interface
  - `theme.ts` - CSS variables and class names
  - `index.ts` - Re-exports all

**`packages/core/src/utils/`:**

- Purpose: Pure utility functions
- Contains:
  - `date-utils.ts` - Date parsing, formatting, range calculations
  - `event-filter.ts` - Filter events by range, group by date/resource
  - `event-position.ts` - Calculate pixel positions for events
  - `collision.ts` - Detect overlapping events
  - `conflict.ts` - Detect time conflicts
  - `grid.ts` - Generate CSS grid templates
  - `slot.ts` - Generate time slots, find slot at position
  - `snap.ts` - Snap positions to grid
  - `__tests__/` - Utility tests

**`packages/core/src/plugins/`:**

- Purpose: Plugin system
- Contains:
  - `create-plugin.ts` - Plugin factory function
  - `index.ts` - Re-exports

**`packages/core/src/toolbar/`:**

- Purpose: Toolbar components
- Contains:
  - `CalendarToolbar.tsx` - Main toolbar container
  - `DateNavigation.tsx` - Prev/Next/Today buttons
  - `ViewSelector.tsx` - View switcher dropdown

**`packages/core/src/headless/`:**

- Purpose: Headless exports (hooks + store, no UI)
- Contains: `index.ts` re-exports hooks and store for advanced users

**`packages/core/src/constants/`:**

- Purpose: Application constants
- Contains:
  - `defaults.ts` - Default values (view, time range, slot duration)
  - `keys.ts` - Keyboard key constants
  - `index.ts` - Re-exports

**`packages/core/src/styles/`:**

- Purpose: CSS
- Contains:
  - `calendar.css` - CSS custom properties and structural styles
  - Built to `dist/calendar.css` by PostCSS

**`stories/`:**

- Purpose: Storybook component stories
- Contains: Story files showcasing calendar features and states
- Used for: Development, testing, documentation
- Key files: `stories/schedule-view/` (complex example story)

**`.planning/codebase/`:**

- Purpose: GSD codebase analysis documents
- Contains: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, STACK.md, INTEGRATIONS.md, CONCERNS.md

## Key File Locations

**Entry Points:**

- `packages/core/src/index.ts` - Main export (all components, hooks, utils, types)
- `packages/core/src/headless/index.ts` - Headless exports (hooks + store)
- `packages/core/src/views/week/index.ts` - Week view subpath export
- `packages/core/src/views/month/index.ts` - Month view subpath export
- `packages/core/src/views/day/index.ts` - Day view subpath export
- `packages/core/src/views/list/index.ts` - List view subpath export
- `packages/core/src/views/timeline/index.ts` - Timeline view subpath export
- `packages/core/src/plugins/index.ts` - Plugin system export

**Configuration:**

- `packages/core/package.json` - Core package config, tsup entries
- `packages/core/tsconfig.json` - TypeScript config for core package
- `tsup.config.ts` - tsup build config (monorepo root)
- `vitest.config.ts` - Vitest test config
- `.storybook/main.ts` - Storybook config
- `postcss.config.mjs` - PostCSS config

**Core Logic:**

- `packages/core/src/store/calendar-store.ts` - Zustand store definition
- `packages/core/src/components/CalendarProvider.tsx` - Context + store initialization
- `packages/core/src/components/CalendarBody.tsx` - View router
- `packages/core/src/utils/date-utils.ts` - Date calculations
- `packages/core/src/utils/event-position.ts` - Event positioning logic
- `packages/core/src/utils/event-filter.ts` - Event filtering and grouping

**Testing:**

- `packages/core/src/components/__tests__/Calendar.test.tsx` - Calendar component tests
- `packages/core/src/store/__tests__/` - Store tests
- `packages/core/src/utils/__tests__/` - Utility tests
- `packages/core/src/views/week/__tests__/` - Week view tests

## Naming Conventions

**Files:**

- PascalCase for component files: `Calendar.tsx`, `EventBlock.tsx`, `WeekView.tsx`
- kebab-case for hook files: `use-calendar.ts`, `use-drag.ts`
- kebab-case for utility files: `event-filter.ts`, `date-utils.ts`
- kebab-case for type files: `calendar.ts`, `event.ts`
- `index.ts` for directory exports (barrel pattern)
- `*.test.tsx` or `*.spec.ts` for test files

**Directories:**

- PascalCase for view directories: `WeekView/`, `MonthView/`, `TimelineView/`
- lowercase for feature directories: `components/`, `hooks/`, `utils/`, `types/`, `store/`

**CSS Classes:**

- Prefix: `pro-calendr-react-*`
- Pattern: `pro-calendr-react-[component]-[element]`
- Examples: `pro-calendr-react-week`, `pro-calendr-react-event`, `pro-calendr-react-event-title`

**TypeScript Types:**

- Interface prefix for public contracts: `Calendar*`, `Event*`
- Type suffix for unions/aliases: `CalendarViewType`, `EventDensity`
- Props suffix for component props: `CalendarProps`, `EventBlockProps`, `WeekViewProps`
- Info suffix for callback objects: `EventClickInfo`, `EventDropInfo`, `SelectInfo`

## Where to Add New Code

**New Feature (Event Click Handler, Date Navigation, etc.):**

- Primary logic: `packages/core/src/store/calendar-store.ts` (if state-related) or `packages/core/src/utils/` (if pure)
- Component integration: `packages/core/src/components/` or relevant view
- Tests: Co-located `__tests__/` subdirectory next to implementation
- Type definitions: Add to `packages/core/src/types/` domain file

**New Component (Event Popover, Dialog, etc.):**

- Implementation: `packages/core/src/components/` if shared, or `packages/core/src/views/<type>/` if view-specific
- Props: Define interface in same file, e.g., `EventPopoverProps`
- Styling: Use `pro-calendr-react-*` CSS class prefix
- Tests: Create `__tests__/ComponentName.test.tsx` in same directory

**New View Type (Agenda, Board, Gantt, etc.):**

- Directory: `packages/core/src/views/<typename>/`
- Entry point: `packages/core/src/views/<typename>/index.ts` with tsup entry
- Main component: `packages/core/src/views/<typename>/<TypenameView>.tsx`
- Sub-components: Co-locate in same directory as needed
- Integration: Add case to `CalendarBody.tsx` switch statement
- Tests: Create `__tests__/` subdirectory

**New Utility (Collision Detection, Formatting, etc.):**

- File: `packages/core/src/utils/<util-name>.ts`
- Export: Re-export from `packages/core/src/utils/index.ts`
- Tests: Create `packages/core/src/utils/__tests__/<util-name>.test.ts`
- Signature: Pure functions preferred; return consistent types

**New Hook (useTimelineScroll, useCalendarShortcuts, etc.):**

- File: `packages/core/src/hooks/use-<feature>.ts`
- Export: Re-export from `packages/core/src/hooks/index.ts`
- Tests: Create `packages/core/src/hooks/__tests__/use-<feature>.test.ts`
- Pattern: Return object with methods/state; use store selectors for efficiency

**New Plugin (Custom Bands, Decorators, etc.):**

- Use: `createPlugin()` factory from `packages/core/src/plugins/create-plugin.ts`
- Implement: `CalendarPlugin` interface from `packages/core/src/types/plugin.ts`
- Test: Add story in `stories/` demonstrating plugin usage

## Special Directories

**`packages/core/dist/`:**

- Purpose: Compiled output (JavaScript, TypeScript declarations, CSS)
- Generated: By `pnpm build` (tsup + PostCSS)
- Committed: No (in .gitignore)
- Contents: Multiple entry points (index, views/\*, headless, plugins)

**`coverage/`:**

- Purpose: Test coverage reports
- Generated: By `pnpm test:ci`
- Committed: No (in .gitignore)

**`.planning/codebase/`:**

- Purpose: GSD codebase analysis and planning documents
- Generated: By `/gsd:map-codebase` command
- Committed: Yes (reference documents)

**`storybook-static/`:**

- Purpose: Built Storybook output
- Generated: By `pnpm storybook:build`
- Committed: No (in .gitignore)

---

_Structure analysis: 2025-02-16_
