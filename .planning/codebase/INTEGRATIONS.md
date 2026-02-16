# External Integrations

**Analysis Date:** 2025-02-16

## Overview

This codebase is a React calendar library (`@pro-calendr-react/core`) with **no external runtime integrations**. The calendar operates entirely on in-memory event data passed via props. No external APIs, databases, or services are contacted at runtime.

## APIs & External Services

**None.** The calendar is a self-contained UI component library.

The calendar accepts event data as props and emits callbacks but does not:

- Make HTTP requests
- Connect to external APIs
- Call webhooks or external services
- Validate data with remote services

Event data shape is defined in `packages/core/src/types/event.ts`:

- `CalendarEvent` interface with id, title, start, end, and optional properties
- Consumers are responsible for fetching/providing event data from their own sources

## Data Storage

**Client-Side Only:**

- Events are stored in memory as React props (`events?: CalendarEvent[]`)
- Internal state managed via Zustand store (`packages/core/src/store/calendar-store.ts`)
- No persistent storage, localStorage, or database access

**Persistence is Consumer Responsibility:**

- Calendar emits callbacks (`onEventDrop`, `onEventResize`, `onSelect`, etc.)
- Consumers implement their own persistence layer (API calls, database writes, etc.)

## Authentication & Identity

**Not applicable.** This is a library, not a service.

Calendar configuration accepts plugin callbacks (`packages/core/src/types/plugin.ts`):

- Plugins can implement custom drop validation via `validateDrop` callback
- Plugins can implement context menu items and toolbar widgets
- Consumers can wire these plugins to their auth system if needed

## Monitoring & Observability

**Error Tracking:** Not integrated

**Logs:**

- Uses `console` for any warnings/errors in development
- No logging to external services
- Error handling is consumer responsibility via callback props

## CI/CD & Deployment

**Hosting:**

- npm registry (npmjs.org) - publishes `@pro-calendr-react/core` package

**CI Pipeline:**

- GitHub Actions
  - Config: `packages/core/.github/workflows/ci.yml`
  - Triggers: push to main, pull requests to main
  - Matrix: Node.js 18, 20, 22
  - Jobs: lint → format check → typecheck → test → build → storybook build
  - Coverage reporting to codecov (non-blocking via `codecov/codecov-action@v4`)

**Publish Pipeline:**

- GitHub Actions
  - Config: `.github/workflows/publish.yml`
  - Manual trigger (`workflow_dispatch`)
  - Uses `changesets/action@v1` to coordinate releases
  - Publishes to npm via `pnpm release`
  - Secrets required:
    - `NPM_TOKEN` - npm registry authentication
    - `GITHUB_TOKEN` - GitHub release automation

**Environment Configuration:**

- No secrets or environment variables required for the library itself
- Consumers must provide their own API keys for external integrations they wire up

## Webhooks & Callbacks

**Incoming:** None

**Outgoing:** Library emits React callback props for consumer integration:

**Event Lifecycle Callbacks:**

- `onEventClick: (info: EventClickInfo) => void` - Click event handler
- `onEventDrop: (info: EventDropInfo) => void` - Drag-drop completion
- `onEventResize: (info: EventResizeInfo) => void` - Duration resize completion
- `onSelect: (info: SelectInfo) => void` - Selection change
- `onDateRangeChange: (range: DateRange) => void` - View date range changed
- `onViewChange: (view: CalendarViewType) => void` - Active view changed
- `onBackgroundSelect: (info: SelectInfo) => void` - Background click (time slot selection)

**Plugin Callbacks:** (`packages/core/src/types/plugin.ts`)

- `validateDrop(info: DropValidationResult): boolean` - Validate drop before commit
- Custom toolbar widgets and context menu items via plugin API

**Data Flow:**

1. Consumer passes `events: CalendarEvent[]` as prop
2. Calendar displays events and detects interactions
3. Calendar emits callbacks with updated state
4. Consumer updates their event source (API, database, state)
5. Consumer re-renders calendar with updated `events` prop

## Theme & Customization

**CSS Variables (Client-Side):**

- `packages/core/src/styles/calendar.css` defines CSS custom properties (`--cal-*`)
- Consumers can override via CSS or Tailwind utilities
- No external theme service or CDN

**Render Slots (Dependency Injection):**

- `eventContent: (props: EventContentProps) => ReactNode` - Event rendering
- `resourceLabel: (props: ResourceLabelProps) => ReactNode` - Resource labels
- `resourceGroupHeader: (props: ResourceGroupHeaderProps) => ReactNode` - Group headers
- `toolbarLeft/Center/Right: ReactNode` - Toolbar customization
- `previewContent: (event: CalendarEvent) => ReactNode` - Event preview panel
- `headerContent: (range: DateRange) => ReactNode` - Header customization

These enable full UI customization without external dependencies.

## Dependencies Summary

**No external service integrations required.**

The library depends only on:

- `date-fns` / `date-fns-tz` - Date utilities (local calculation, no network calls)
- `@tanstack/react-virtual` - Virtual scrolling (local performance optimization)
- `zustand` - State management (local only)
- React/React DOM (peer dependencies)

All external data handling is delegated to consumers via props and callbacks.

---

_Integration audit: 2025-02-16_
