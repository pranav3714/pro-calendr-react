# Technology Stack

**Analysis Date:** 2025-02-16

## Languages

**Primary:**

- TypeScript 5.7.0 - All source code, strict type checking with `strict: true`

**Secondary:**

- JavaScript (ES2020) - Build configuration, scripts

## Runtime

**Environment:**

- Node.js >= 18.0.0 (defined in `package.json` engines field)

**Package Manager:**

- pnpm 9.15.4 - Monorepo dependency management
- Lockfile: pnpm-lock.yaml (present)
- Configuration: `packages/core/.npmrc` with `strict-peer-dependencies=true` and `auto-install-peers=true`

## Frameworks

**Core:**

- React 18.3.0 - UI library (peer dependency in `packages/core/package.json`)
- React DOM 18.3.0 - DOM rendering (peer dependency)

**State Management:**

- Zustand 5.0.0 - Internal state management for calendar state (`packages/core/src/store/calendar-store.ts`)

**Testing:**

- Vitest 2.1.0 - Unit and integration test runner
- @testing-library/react 16.1.0 - React component testing utilities
- @testing-library/user-event 14.5.0 - User interaction simulation
- @testing-library/jest-dom 6.6.0 - DOM matchers
- jsdom 25.0.0 - DOM environment for tests

**Build/Dev:**

- tsup 8.3.0 - TypeScript bundler with multi-entry support for tree-shaking
- PostCSS 8.4.0 - CSS processing
- Autoprefixer 10.4.0 - Browser vendor prefix support
- Tailwind CSS 3.4.0 - Utility-first CSS framework (development only)
- Prettier 3.4.0 - Code formatter with Tailwind plugin
- ESLint 9.17.0 - Linting with strict TypeScript rules
- typescript-eslint 8.18.0 - TypeScript ESLint support
- Storybook 8.5.0 - Component development environment
- Vite - Dev server for Storybook (via @vitejs/plugin-react 4.3.0)

**Version Control:**

- Changesets 2.27.0 - Semantic versioning and changelog management
- Husky 9.1.0 - Git hooks
- lint-staged 15.2.0 - Run linters on staged files

## Key Dependencies

**Critical:**

- date-fns 4.1.0 - Date manipulation and formatting utility library
- date-fns-tz 3.2.0 - Timezone support for date-fns
- @tanstack/react-virtual 3.11.0 - Windowing library for virtualizing large event lists

**CSS & Styling:**

- Tailwind CSS 3.4.0 - CSS utility framework (dev dependency, not shipped)
- prettier-plugin-tailwindcss 0.6.0 - Tailwind class sorting in Prettier

**Linting & Quality:**

- @eslint/js 9.17.0 - ESLint JavaScript rules
- eslint-plugin-react-hooks 5.1.0 - React hooks linting rules
- eslint-plugin-react-refresh 0.4.0 - Fast Refresh support checking
- globals 15.0.0 - Global variable definitions for ESLint

## Configuration

**Environment:**

- TypeScript: Strict mode enabled (`packages/core/tsconfig.json`)
- No .env files required - This is a library, not a runtime app
- Monorepo: Workspaces defined via pnpm in root `package.json`

**Build:**

- `tsup.config.ts` - Multi-entry bundling (index, views/timeline, views/week, views/month, views/day, views/list, headless, plugins)
- `vitest.config.ts` - Test runner configured with jsdom environment, 80% statement/function/line coverage, 75% branch coverage
- Root `tsconfig.json` - Base TypeScript configuration with path aliases for `@pro-calendr-react/core` resolution
- `postcss.config.mjs` - CSS processing with Autoprefixer
- `eslint.config.mjs` - Strict TypeScript linting with react-hooks validation
- `.prettierrc` - Code formatting (via root package.json lint-staged config)

## Package Distribution

**Published as:** `@pro-calendr-react/core`

**Exports:**

- Main: CommonJS (`./dist/index.cjs`) and ESM (`./dist/index.js`)
- TypeScript definitions: `./dist/index.d.ts` (ESM) and `./dist/index.d.cts` (CJS)
- Conditional exports for multiple entry points (views, headless, plugins) for tree-shaking
- CSS: `./dist/calendar.css` (separate CSS file)

**Build Process:**

1. tsup compiles TypeScript to dual-format output (ESM/CJS) with tree-shaking enabled
2. PostCSS processes CSS with Autoprefixer for vendor prefixes
3. Source maps included for debugging

## Platform Requirements

**Development:**

- Node.js >= 18.0.0
- pnpm >= 9.15.4
- Git (for hooks via Husky)

**Production (Consumers):**

- React 18.0.0+ or React 19.0.0+
- React DOM matching React version
- Modern browsers supporting ES2020

## CI/CD & Deployment

**Hosting:**

- npm registry (npmjs.org)

**CI Pipeline:**

- GitHub Actions (`.github/workflows/ci.yml`)
  - Runs on: push to main, pull requests to main
  - Tests on Node.js: 18, 20, 22
  - Jobs: Lint → Type check → Test → Build → Storybook build → Coverage upload
  - Pack & Verify job validates tarball structure after build

**Publish Pipeline:**

- GitHub Actions (`.github/workflows/publish.yml`)
  - Manual trigger (`workflow_dispatch`)
  - Uses changesets/action for automated releases
  - Publishes to npm with `NPM_TOKEN` secret
  - Creates release PRs with `GITHUB_TOKEN`

## Code Quality Gates

**Linting:** ESLint with strict TypeScript (`tseslint.configs.strictTypeChecked`)
**Formatting:** Prettier with Tailwind plugin
**Type Safety:** TypeScript 5.7 with strict mode
**Testing:** 80% statement/function/line coverage, 75% branch coverage enforced
**Build Verification:** Pack test validates output files (index.js, index.cjs, index.d.ts)

---

_Stack analysis: 2025-02-16_
