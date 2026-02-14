# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm build                    # Build all packages (tsup + PostCSS)
pnpm dev                      # Watch mode for all packages
pnpm test                     # Vitest in watch mode
pnpm test:ci                  # Single run with coverage
pnpm vitest run path/to/file  # Run a single test file
pnpm lint                     # ESLint (strict TS + react-hooks)
pnpm lint:fix                 # ESLint autofix
pnpm format                   # Prettier
pnpm typecheck                # tsc --noEmit against packages/core
pnpm storybook                # Dev server on :6006
pnpm changeset                # Create a changeset for versioning
```

## Project Structure

Monorepo (pnpm workspaces). The single package lives at `packages/core/` and publishes as `@pro-calendr-react/core`.

### Source layout (`packages/core/src/`)

- `components/` — Shared components (Calendar, CalendarProvider, DragLayer, SelectionOverlay, etc.)
- `views/<name>/` — View implementations: timeline, week, month, day, list
- `hooks/` — React hooks (useCalendar, useDrag, useSelection, useVirtualization, etc.)
- `store/` — Zustand store (internal state: currentView, currentDate, selection, dragState)
- `types/` — TypeScript types split by domain (calendar, event, resource, interaction, theme, plugin, config)
- `utils/` — Pure utilities (date-utils, collision, conflict, grid, snap, slot)
- `plugins/` — Plugin system (`createPlugin` factory)
- `headless/` — Headless exports (hooks + store without UI)
- `toolbar/` — Toolbar components (CalendarToolbar, DateNavigation, ViewSelector)
- `styles/calendar.css` — CSS custom properties (`--cal-*`) and structural styles
- `constants/` — Defaults and keyboard key constants

Tests are co-located in `__tests__/` subdirectories next to source files.

## Architecture

### Multi-entry build

tsup is configured with separate entry points (`index`, `views/*`, `headless`, `plugins`) for tree-shaking. **Do not import across view boundaries** — each view should be independently importable via `@pro-calendr-react/core/views/<name>`.

### State management

Zustand store (`store/calendar-store.ts`) is internal. Consumers interact through props on `<Calendar>` and callback props (`onEventDrop`, `onSelect`, etc.). The headless entry re-exports hooks and the store for advanced use.

### Customization model

- **Render slots**: `eventContent`, `resourceLabel`, `resourceGroupHeader`, `toolbarLeft/Center/Right`, `previewContent`
- **CSS custom properties**: `--cal-*` variables for non-Tailwind users; Tailwind users override via `classNames` prop
- **Plugins**: `CalendarPlugin` interface adds timeline bands, resource decorators, context menu items, drop validation, and toolbar widgets
- **Dark mode**: `.dark` class on parent toggles dark theme variables

### Key dependencies

- `date-fns` / `date-fns-tz` for date math and timezone support
- `@tanstack/react-virtual` for virtualization
- `zustand` for internal state

## Code Conventions

- ESLint uses `tseslint.configs.strictTypeChecked` — strict type safety is enforced
- Unused variables must be prefixed with `_` (configured via `argsIgnorePattern` / `varsIgnorePattern`)
- CSS class prefix: `pro-calendr-react-*`
- Husky + lint-staged runs ESLint and Prettier on commit
- Coverage thresholds: 80% statements/functions/lines, 75% branches
