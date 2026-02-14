# @pro-calendr-react/core

A general-purpose, high-performance React calendar with timeline, week, month, day, and list views. Virtualized, Tailwind-native, and fully extensible via render slots and plugins.

## Prerequisites

Before you start, make sure you have these installed:

- **Node.js** >= 18 — Download from https://nodejs.org
  - Check: `node --version`
- **pnpm** >= 9 — Install with `npm install -g pnpm`
  - Check: `pnpm --version`
- **Git** — Download from https://git-scm.com
  - Check: `git --version`

## Getting Started

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd pro-calendr-react
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

   This installs all dependencies for every package in the monorepo.

3. **Build the library**

   ```bash
   pnpm build
   ```

   This compiles `packages/core/src/` into `packages/core/dist/` (ESM + CJS + type declarations + CSS).

4. **Start Storybook** (main development environment)

   ```bash
   pnpm storybook
   ```

   Opens at http://localhost:6006. Every component has a story. Changes hot-reload instantly.

5. **Run tests**

   ```bash
   pnpm test          # Watch mode (re-runs on file change)
   pnpm test:ci       # Single run with coverage report
   ```

6. **Lint and format**

   ```bash
   pnpm lint          # Check for issues
   pnpm lint:fix      # Auto-fix issues
   pnpm format        # Format all files with Prettier
   pnpm format:check  # Check formatting without changing files
   ```

7. **Type-check**

   ```bash
   pnpm typecheck
   ```

## Project Structure

```
pro-calendr-react/
├── packages/
│   └── core/                # The npm package (@pro-calendr-react/core)
│       ├── src/
│       │   ├── components/  # React components (Calendar, DragLayer, etc.)
│       │   ├── views/       # Calendar views (timeline, week, month, day, list)
│       │   ├── hooks/       # React hooks (headless API)
│       │   ├── store/       # Zustand state management
│       │   ├── utils/       # Pure utility functions (date math, collision, etc.)
│       │   ├── types/       # TypeScript interfaces (public API contract)
│       │   ├── styles/      # CSS custom properties & animations
│       │   ├── toolbar/     # Toolbar components (nav, view selector)
│       │   ├── plugins/     # Plugin system
│       │   ├── headless/    # Headless hook re-exports
│       │   ├── constants/   # Shared constants & defaults
│       │   └── index.ts     # Main entry point (what consumers import)
│       ├── package.json     # Package config with exports map
│       ├── tsup.config.ts   # Build configuration (multi-entry)
│       └── tsconfig.json    # TypeScript config
├── stories/                 # Storybook stories (not published to npm)
│   ├── Calendar.stories.tsx
│   └── helpers/
│       └── mock-data.ts     # Shared test/story data
├── .storybook/              # Storybook configuration
├── .github/workflows/       # CI/CD (lint, test, build, publish)
├── .changeset/              # Changesets version management
├── .husky/                  # Git hooks (lint-staged on pre-commit)
└── [config files]           # ESLint, Prettier, Vitest, Tailwind, etc.
```

## How to Add a New Component

1. **Create the file** in the appropriate `packages/core/src/` directory:

   ```bash
   # Example: a new shared component
   packages/core/src/components/MyComponent.tsx
   ```

2. **Write the component** with TypeScript and Tailwind classes:

   ```tsx
   import type { ReactNode } from "react";

   interface MyComponentProps {
     children: ReactNode;
     className?: string;
   }

   export function MyComponent({ children, className }: MyComponentProps) {
     return <div className={`rounded-md border p-2 ${className ?? ""}`}>{children}</div>;
   }
   ```

3. **Export it** from the nearest `index.ts` barrel file, and from `src/index.ts` if it's part of the public API.

4. **Add a story** in `stories/MyComponent.stories.tsx`:

   ```tsx
   import type { Meta, StoryObj } from "@storybook/react";
   import { MyComponent } from "@pro-calendr-react/core";

   const meta: Meta<typeof MyComponent> = {
     title: "Components/MyComponent",
     component: MyComponent,
     tags: ["autodocs"],
   };
   export default meta;

   type Story = StoryObj<typeof MyComponent>;

   export const Default: Story = {
     args: {
       children: "Hello world",
     },
   };
   ```

5. **Add a test** in `packages/core/src/components/__tests__/MyComponent.test.tsx`:

   ```tsx
   import { render, screen } from "@testing-library/react";
   import { MyComponent } from "../MyComponent";

   describe("MyComponent", () => {
     it("renders children", () => {
       render(<MyComponent>Hello</MyComponent>);
       expect(screen.getByText("Hello")).toBeInTheDocument();
     });
   });
   ```

6. **Verify**: run `pnpm storybook` (see it visually), `pnpm test` (tests pass), `pnpm build` (compiles).

## How to Add a New View

Views live in `packages/core/src/views/<view-name>/`. Each view has:

- `index.ts` — barrel export
- `<ViewName>View.tsx` — main view component
- Sub-components as needed
- `__tests__/` folder for tests

The view must be:

1. Added to `packages/core/tsup.config.ts` entry points
2. Exported from `packages/core/src/index.ts`
3. Added to the `exports` map in `packages/core/package.json`

## How to Add a Hook

Hooks live in `packages/core/src/hooks/`. Follow the naming convention `use-<name>.ts`. Export from `hooks/index.ts` and `src/index.ts`.

## Key Concepts

### Zustand Store

Internal state (current view, date, selection, drag state) lives in a Zustand store at `src/store/calendar-store.ts`. Components read from the store via hooks. The store is NOT exposed to consumers — they interact via props and callbacks.

### Render Slots

Every visual element is replaceable. Components accept render props like `eventContent`, `resourceLabel`, `toolbarLeft`, etc. Always provide a sensible default.

### CSS Custom Properties

The package uses Tailwind classes for styling but also exposes CSS custom properties (`--cal-*`) in `src/styles/calendar.css` for non-Tailwind consumers. When adding visual elements, use both:

```tsx
<div
  className="rounded-md bg-white dark:bg-gray-900"
  style={{ backgroundColor: "var(--cal-bg)" }}
>
```

### Tree-Shaking

The package has multiple entry points so consumers who only need one view don't pay for all views. Each `views/<name>/index.ts` is a separate tsup entry. Don't import across view boundaries — use shared code from `utils/`, `hooks/`, or `store/`.

### Tests

Tests are co-located with source code in `__tests__/` subdirectories:

```
src/utils/
├── date-utils.ts
└── __tests__/
    └── date-utils.test.ts
```

Run `pnpm test` for watch mode during development. Run `pnpm test:ci` for a single run with coverage.

## Common Commands Reference

| Command                | What it does                                |
| ---------------------- | ------------------------------------------- |
| `pnpm install`         | Install all dependencies                    |
| `pnpm build`           | Build the library to `packages/core/dist/`  |
| `pnpm dev`             | Watch mode build (rebuilds on file changes) |
| `pnpm storybook`       | Start Storybook dev server at :6006         |
| `pnpm storybook:build` | Build static Storybook site                 |
| `pnpm test`            | Run tests in watch mode                     |
| `pnpm test:ci`         | Run tests once with coverage                |
| `pnpm lint`            | Check for lint errors                       |
| `pnpm lint:fix`        | Auto-fix lint errors                        |
| `pnpm format`          | Format all files with Prettier              |
| `pnpm format:check`    | Check formatting (CI)                       |
| `pnpm typecheck`       | Run TypeScript type checking                |
| `pnpm changeset`       | Create a changeset for your changes         |

## Making a Release

This project uses [Changesets](https://github.com/changesets/changesets) for versioning:

1. After making changes, run `pnpm changeset`
2. Select the packages affected and the semver bump type
3. Write a summary of the change
4. Commit the generated changeset file with your PR
5. When merged to main, CI creates a "Version Packages" PR
6. Merging that PR publishes to npm automatically

## Troubleshooting

**`pnpm install` fails with peer dependency errors**

Run `pnpm install --no-strict-peer-dependencies` as a workaround, then investigate which package has the conflict.

**Storybook won't start**

1. Make sure `pnpm build` succeeds first
2. Delete `storybook-static/` and `node_modules/.cache/storybook/`
3. Re-run `pnpm storybook`

**Tests fail with "ReferenceError: IntersectionObserver is not defined"**

The mock is in `vitest.setup.ts`. Make sure `vitest.config.ts` has `setupFiles: ["./vitest.setup.ts"]`.

**Build produces empty `dist/`**

Check that `packages/core/src/index.ts` has actual exports (not just `export {}`). tsup tree-shakes unused code.

**TypeScript errors about missing module**

Run `pnpm install` then `pnpm build` to generate `.d.ts` files. The `tsconfig.json` path aliases resolve to source during development.

**ESLint errors about missing parser**

Make sure TypeScript is installed and `tsconfig.json` exists. ESLint uses TypeScript's project service for type-aware linting.
