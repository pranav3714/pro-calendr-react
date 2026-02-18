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

- `views/<name>/` — View implementations: timeline, week, month, day, list
- `interfaces/` — All TypeScript interfaces and types (no inline typing)
- `utils/` — Pure utility functions (always check here before writing new ones)
- `headless/` — Headless exports (hooks + store without UI)
- `plugins/` — Plugin system
- `styles/calendar.css` — CSS custom properties (`--cal-*`) and structural styles

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

### Tooling

- ESLint uses `tseslint.configs.strictTypeChecked` — strict type safety is enforced
- Unused variables must be prefixed with `_` (configured via `argsIgnorePattern` / `varsIgnorePattern`)
- CSS class prefix: `pro-calendr-react-*`
- Husky + lint-staged runs ESLint and Prettier on commit
- Coverage thresholds: 80% statements/functions/lines, 75% branches

### Coding Patterns (Strict — ALWAYS follow)

1. **One function per file** — each file exports exactly one function or component
2. **No nested ifs/if-else** — use well-named sub-functions with early return pattern instead
3. **Object params always** — pass objects as function parameters even for a single param, for readability via field names
4. **No inline typing** — all types and interfaces go in `interfaces/` folder as well-defined interfaces; never define types inline in function files
5. **Check `utils/` first** — always read the `utils/` folder before writing new helper functions; reuse existing utilities
6. **Check `package.json` deps** — read dependencies to know what libraries are already available; don't reinvent what a dependency already provides
7. **SOLID principles** — apply Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion in all code design
8. **Test complex math** — write test files for any function with complex calculations; include edge cases, corner cases, and potential numerical flaws
9. **No barrel exports** — index files must NOT re-export from other files; each file exports its own content directly
10. **Verify after every task** — always run `pnpm typecheck`, `pnpm lint`, and relevant test files after completing any feature or task
11. **Extract logic to custom hooks** — in React components, isolate complicated logic into custom hooks so the UI/JSX stays clean and readable
12. **No ternary operators** — never use ternary expressions; use early returns, if-statements, or helper functions for conditional values
13. **Minimize blast radius** — prefer a larger change contained in one file over small changes spread across many components; keep the surface area of changes small
14. **No prop drilling** — avoid passing props through multiple component layers; use Zustand stores where shared state makes sense
