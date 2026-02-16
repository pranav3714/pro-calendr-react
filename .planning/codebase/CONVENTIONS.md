# Coding Conventions

**Analysis Date:** 2025-02-16

## Naming Patterns

**Files:**

- Components: PascalCase (`Calendar.tsx`, `WeekView.tsx`, `CalendarProvider.tsx`)
- Utilities: kebab-case (`date-utils.ts`, `event-filter.ts`, `calendar-store.ts`)
- Hooks: kebab-case with `use-` prefix (`use-keyboard.ts`, `use-virtualization.ts`, `use-density.ts`)
- Test files: same name as source with `.test.ts` or `.test.tsx` suffix (`Calendar.test.tsx`, `date-utils.test.ts`)

**Functions:**

- camelCase for all functions (`parseDate`, `isSameDay`, `formatDateHeader`, `filterEventsInRange`, `groupEventsByDate`)
- Private helper functions use standard camelCase (e.g., `navigateForView` at `packages/core/src/store/calendar-store.ts:37`)
- Hook names follow React convention: `useCalendarStore`, `useCalendar`

**Variables:**

- camelCase for all variables and constants
- Unused parameters/variables must be prefixed with `_` per ESLint rule (e.g., `_slot`, `_time` in `packages/core/src/components/Calendar.tsx:85`)
- React component props: camelCase (`slotDuration`, `eventContent`, `onEventClick`)

**Types:**

- PascalCase for all type names and interfaces (`CalendarEvent`, `CalendarRef`, `CalendarStore`, `WeekViewProps`, `EventContentProps`)
- Use `type` keyword for exported type aliases
- Suffix interfaces with no suffix when naming props: `CalendarProps`, `CalendarProviderProps`, `WeekViewProps`
- Store interface name: `CalendarStore` (for Zustand)

**CSS Classes:**

- Prefix all classes with `pro-calendr-react-*` (e.g., `pro-calendr-react-week`, `pro-calendr-react-allday-row`, `pro-calendr-react-skeleton`)
- kebab-case for class names: `pro-calendr-react-week`, `pro-calendr-react-toolbar`, `pro-calendr-react-body`

## Code Style

**Formatting:**

- Prettier 3.4.0 configured (no `.prettierrc` file found; uses defaults with tailwindcss plugin)
- Line length: Not explicitly restricted (uses Prettier defaults, typically 80-100)
- Indentation: 2 spaces (Prettier standard)
- Semicolons: Required (Prettier default)
- Single quotes: Not enforced (Prettier uses double quotes by default, though codebase shows double quotes consistently)

**Linting:**

- ESLint with `@eslint/js` and `typescript-eslint` strictTypeChecked config
- Strict TypeScript checking enforced: `tseslint.configs.strictTypeChecked` at `packages/core/src` level
- React hooks lint rules enabled: `eslint-plugin-react-hooks`
- React refresh plugin for fast refresh in development: `eslint-plugin-react-refresh`
- Unused variable rule with `_` prefix bypass: `"@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }]`

**Type Safety:**

- Strict type checking required—no `any` types unless absolutely necessary
- Function parameter types explicitly declared
- Return types explicitly declared on exported functions
- Generic types used for collection operations

## Import Organization

**Order:**

1. React/External dependencies (e.g., `import { forwardRef, useEffect } from "react"`)
2. Third-party packages (e.g., `import { format } from "date-fns"`)
3. Internal type imports (e.g., `import type { CalendarEvent } from "../types"`)
4. Internal utilities/hooks/store (e.g., `import { useCalendarStore }`)
5. Internal components (e.g., `import { CalendarBody }`)
6. CSS/styles (if any)

**Example from `packages/core/src/components/Calendar.tsx`:**

```typescript
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { format } from "date-fns";
import type { CalendarProps, CalendarRef, CalendarViewType } from "../types";
import { useCalendarStore } from "../store/calendar-store";
import { CalendarProvider } from "./CalendarProvider";
import { CalendarBody } from "./CalendarBody";
import { CalendarToolbar } from "../toolbar/CalendarToolbar";
```

**Path Aliases:**

- `@pro-calendr-react/core` maps to `packages/core/src` (configured in `vitest.config.ts`)
- Relative imports used within package: `../types`, `../../utils`, `./CalendarBody`

## Error Handling

**Strategy:** Minimal explicit error handling in current codebase; relies on:

- TypeScript type safety to prevent invalid operations
- Input validation at component boundaries
- Graceful fallback for edge cases (e.g., `default` branches in switch statements always return sensible defaults)

**Patterns:**

- No try-catch blocks in utility functions (they assume valid input)
- Null coalescing for optional values: `views = ["week", "day", "month", "list"]` provides defaults
- Object destructuring with defaults: `{ slotDuration = DEFAULTS.slotDuration }`
- Type narrowing for Date/string union types: `const start = typeof e.start === "string" ? new Date(e.start) : e.start;`

## Logging

**Framework:** `console` (no dedicated logging library imported)

**Patterns:**

- No logging statements observed in core source files
- Logging reserved for debugging; not used in production code
- Tests use `vi.fn()` mock functions to track calls instead of logging

## Comments

**When to Comment:**

- JSDoc blocks for exported functions explaining purpose and parameters
- Inline comments for non-obvious logic (e.g., "Longer events first (for better stacking)" in `event-filter.ts:75`)
- Comments explaining algorithm choices or future TODOs

**JSDoc/TSDoc:**

- Standard JSDoc format with `/**` block comments
- Parameter documentation: `@param name - description`
- Example from `packages/core/src/utils/date-utils.ts:18-23`:

```typescript
/**
 * Format a date using date-fns format tokens.
 */
export function formatDate(date: Date, formatStr: string): string {
  return format(date, formatStr);
}
```

**TODO/FIXME Pattern:**

- TODOs reference milestone numbers (e.g., `// TODO: Milestone 7.3`, `// TODO: Milestone 5`)
- Located in `packages/core/src/components/Calendar.tsx:83-89` for unimplemented API methods
- No FIXME comments found; issues tracked in comments only when blocking

## Function Design

**Size:** Prefer small, focused functions; utility functions typically 5-30 lines

**Parameters:**

- Named parameters preferred over positional when 3+ args
- Destructuring for component props: `{ events, dateRange, slotDuration = DEFAULTS.slotDuration }`
- Optional parameters with defaults using assignment: `hour12 = false`

**Return Values:**

- Explicit return types on all exported functions
- Return void when function has side effects only (e.g., `setView: (view: CalendarViewType) => void`)
- Utility functions return data (arrays, objects, primitives)
- No implicit returns of undefined; null used explicitly for "no value"

**Example from `packages/core/src/utils/event-filter.ts`:**

```typescript
export function filterEventsInRange(
  events: CalendarEvent[],
  dateRange: { start: Date; end: Date },
): CalendarEvent[] {
  const rangeStart = dateRange.start.getTime();
  const rangeEnd = dateRange.end.getTime();

  return events.filter((event) => {
    const eventStart = parseDate(event.start).getTime();
    const eventEnd = parseDate(event.end).getTime();
    return eventStart < rangeEnd && eventEnd > rangeStart;
  });
}
```

## Module Design

**Exports:**

- Explicit `export` keyword for all public APIs
- Type exports use `export type` for tree-shaking
- Barrel files used for grouping (e.g., `packages/core/src/types/index.ts` exports from domain modules)
- Each view is independently importable via `@pro-calendr-react/core/views/<name>` for tree-shaking

**Barrel Files:**

- Used at `packages/core/src/types/index.ts` to re-export domain types
- Pattern: `export type * from "./calendar"`
- Not used excessively elsewhere; most utilities exported directly

**Example from `packages/core/src/types/index.ts`:**

```typescript
export type * from "./calendar";
export type * from "./event";
export type * from "./resource";
export type * from "./interaction";
export type * from "./theme";
export type * from "./plugin";
export type * from "./config";
```

## Test File Organization

**Co-located with Source:**

- Tests live in `__tests__/` subdirectories next to source (e.g., `src/utils/__tests__/date-utils.test.ts`)
- One test file per source file, mirroring the structure

**Naming:**

- Test files use same name as source with `.test.ts` or `.test.tsx` suffix
- Test suites named after the module being tested (e.g., `describe("parseDate"`)
- Test cases named descriptively: `it("parses ISO string to Date")`

---

_Convention analysis: 2025-02-16_
