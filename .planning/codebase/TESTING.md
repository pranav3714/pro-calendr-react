# Testing Patterns

**Analysis Date:** 2025-02-16

## Test Framework

**Runner:**

- Vitest 2.1.0
- Config: `vitest.config.ts` at repository root
- Environment: jsdom (for DOM testing)

**Assertion Library:**

- Vitest built-in assertions
- `@testing-library/react` for component rendering and interaction
- `@testing-library/jest-dom` for DOM matchers
- `@testing-library/user-event` for user interactions

**Run Commands:**

```bash
pnpm test              # Watch mode (default)
pnpm test:ci           # Single run with coverage
pnpm vitest run path/to/file  # Run single test file
```

## Test File Organization

**Location:**

- Co-located in `__tests__/` subdirectories next to source files
- Pattern: `src/[domain]/__tests__/[name].test.ts[x]`

**Examples:**

- `packages/core/src/utils/__tests__/date-utils.test.ts`
- `packages/core/src/utils/__tests__/event-filter.test.ts`
- `packages/core/src/components/__tests__/Calendar.test.tsx`
- `packages/core/src/store/__tests__/calendar-store.test.ts`
- `packages/core/src/views/week/__tests__/WeekView.test.tsx`

**Naming:**

- Test files match source file name with `.test.ts` or `.test.tsx` suffix
- Test suites use `describe()` blocks named after the module/function being tested
- Test cases use `it()` with descriptive English phrases

**Include Pattern:**

- Config: `vitest.config.ts` line 16: `include: ["packages/**/src/**/*.test.{ts,tsx}"]`
- Excludes: node_modules, dist, storybook-static, coverage

## Test Structure

**Suite Organization:**

```typescript
describe("Calendar", () => {
  beforeEach(() => {
    // Setup before each test
    resetStore();
  });

  it("renders without crashing", () => {
    // Test implementation
    render(<Calendar />);
    expect(screen.getByTestId("pro-calendr-react")).toBeInTheDocument();
  });

  it("navigates to previous week when Prev is clicked", () => {
    const onDateRangeChange = vi.fn();
    render(<Calendar defaultDate={new Date(2026, 1, 11)} onDateRangeChange={onDateRangeChange} />);

    fireEvent.click(screen.getByText("Prev"));

    expect(onDateRangeChange).toHaveBeenCalled();
  });
});
```

**Patterns:**

**Setup/Teardown:**

- `beforeEach()` used for test isolation
- Store reset pattern in `packages/core/src/components/__tests__/Calendar.test.tsx:18-30`:

```typescript
function resetStore() {
  useCalendarStore.setState({
    currentView: "week",
    currentDate: new Date(),
    dateRange: { start: new Date(), end: new Date() },
    firstDay: 1,
    selection: null,
    dragState: null,
    hoveredSlot: null,
    filteredResourceIds: [],
  });
}

beforeEach(() => {
  resetStore();
});
```

**Assertions:**

- Vitest/Jest-DOM matchers for DOM queries: `.toBeInTheDocument()`, `.toBeDefined()`, `.toBeNull()`
- Equality checks: `.toBe()`, `.toEqual()`
- Collection checks: `.toHaveLength()`, `.toContain()`
- Spy assertions: `.toHaveBeenCalled()`, `.toHaveBeenCalledWith()`

**Test Data Factories:**

- `makeEvent()` factory pattern used across multiple test files
- Purpose: Generate consistent test event objects with sensible defaults
- Pattern from `packages/core/src/components/__tests__/Calendar.test.tsx:8-16`:

```typescript
function makeEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: "1",
    title: "Test Event",
    start: new Date(2026, 1, 11, 9, 0), // Wed Feb 11
    end: new Date(2026, 1, 11, 10, 0),
    ...overrides,
  };
}
```

- Same pattern used in `event-filter.test.ts`, `WeekView.test.tsx`, and other test files
- Allows test cases to override only necessary fields

**Fixed Dates:**

- Tests use fixed dates (e.g., `new Date(2026, 1, 11)`) to avoid flakiness
- Reference date: February 2026 (chosen so Feb 11 is Wednesday, Feb 9 is Monday)
- Prevents test failures when test runs on different calendar dates

## Mocking

**Framework:**

- Vitest's `vi` object for mocks and spies
- React Testing Library for component mocking via render context

**Patterns:**

**Function Mocks:**

```typescript
// From packages/core/src/components/__tests__/Calendar.test.tsx:68
const onDateRangeChange = vi.fn();
render(<Calendar defaultDate={new Date(2026, 1, 11)} onDateRangeChange={onDateRangeChange} />);
fireEvent.click(screen.getByText("Prev"));
expect(onDateRangeChange).toHaveBeenCalled();
```

**Store Mocks:**

- Use `useCalendarStore.setState()` to mock store state
- Reset before each test using `beforeEach()` and `resetStore()`

**DOM Mocks (from vitest.setup.ts):**

```typescript
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: MockIntersectionObserver,
});

class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: MockResizeObserver,
});
```

**What to Mock:**

- Callback props that need to be verified (e.g., `onEventClick`, `onDateRangeChange`)
- Browser APIs (IntersectionObserver, ResizeObserver, matchMedia)
- Date when testing time-dependent logic (use fixed dates instead of `new Date()`)

**What NOT to Mock:**

- Components being tested (render actual component)
- date-fns utilities (use real implementation for date math)
- Calendar store (reset between tests instead of mocking)
- Event data (use factory pattern with real data shape)

## Fixtures and Factories

**Test Data:**

```typescript
// Pattern from packages/core/src/utils/__tests__/event-filter.test.ts:12-20
function makeEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: "1",
    title: "Test",
    start: new Date(2026, 1, 14, 9, 0),
    end: new Date(2026, 1, 14, 10, 0),
    ...overrides,
  };
}

// Usage
const events = [
  makeEvent({ id: "1", start: new Date(2026, 1, 12, 9, 0), end: new Date(2026, 1, 12, 10, 0) }),
];
```

**Location:**

- Defined inline at top of test file (not in separate fixtures directory)
- Each test file that needs test data defines its own `makeEvent()` helper
- Range constants defined near top: `const range = { start: new Date(2026, 1, 9), end: new Date(2026, 1, 15) };`

## Coverage

**Requirements:**

- Enforced via `vitest.config.ts` lines 28-33:
  - Statements: 80%
  - Branches: 75%
  - Functions: 80%
  - Lines: 80%

**View Coverage:**

```bash
pnpm test:ci
```

- Generates: text report (console), lcov report, HTML report

**Coverage Exclusions (vitest.config.ts:21-26):**

- `.stories.tsx` files (Storybook stories)
- `.test.ts` and `.test.tsx` files (test code itself)
- `index.ts` files (barrel exports)
- `__tests__/` directories
- `types/` directories (type definitions)

## Test Types

**Unit Tests:**

- Scope: Individual functions and utilities
- Approach: Direct function calls with test data
- Examples:
  - `date-utils.test.ts`: Tests for `parseDate`, `isSameDay`, `formatDate`, `getDateRange`, etc.
  - `event-filter.test.ts`: Tests for `filterEventsInRange`, `groupEventsByDate`, `sortEventsByStart`
  - `calendar-store.test.ts`: Tests for Zustand store actions

**Example from `date-utils.test.ts:17-41`:**

```typescript
describe("parseDate", () => {
  it("parses ISO string to Date", () => {
    const result = parseDate("2026-02-14T10:00:00.000Z");
    expect(result).toBeInstanceOf(Date);
  });

  it("returns Date object as-is", () => {
    const date = new Date();
    expect(parseDate(date)).toBe(date);
  });
});

describe("isSameDay", () => {
  it("returns true for same day", () => {
    const a = new Date(2026, 1, 14, 10, 0);
    const b = new Date(2026, 1, 14, 18, 30);
    expect(isSameDay(a, b)).toBe(true);
  });
});
```

**Integration Tests:**

- Scope: Components with multiple units working together
- Approach: Render component, fire events, verify callbacks and state changes
- Examples:
  - `Calendar.test.tsx`: Tests Calendar component with various props, navigation, view changes
  - `WeekView.test.tsx`: Tests WeekView component rendering events and layout

**Example from `Calendar.test.tsx:67-95`:**

```typescript
it("navigates to previous week when Prev is clicked", () => {
  const onDateRangeChange = vi.fn();
  render(<Calendar defaultDate={new Date(2026, 1, 11)} onDateRangeChange={onDateRangeChange} />);

  fireEvent.click(screen.getByText("Prev"));

  expect(onDateRangeChange).toHaveBeenCalled();
  const range = onDateRangeChange.mock.calls[onDateRangeChange.mock.calls.length - 1][0] as {
    start: Date;
    end: Date;
  };
  // New range should be before Feb 9 (which was the start of the week for Feb 11)
  expect(range.start.getTime()).toBeLessThan(new Date(2026, 1, 9).getTime());
});
```

**E2E Tests:**

- Not currently used in codebase
- Storybook stories (`stories/`) serve as manual acceptance tests

## Common Patterns

**Async Testing:**

```typescript
// From packages/core/src/components/__tests__/Calendar.test.tsx:196-201
it("exposes ref API - navigateDate", () => {
  const ref = createRef<CalendarRef>();
  const onDateRangeChange = vi.fn();
  render(
    <Calendar
      ref={ref}
      defaultDate={new Date(2026, 1, 11)}
      onDateRangeChange={onDateRangeChange}
    />,
  );

  act(() => {
    getRef(ref).navigateDate("next");
  });

  expect(onDateRangeChange).toHaveBeenCalled();
});
```

**Helper Functions:**

- `getRef(ref)`: Safely extracts ref and throws if not set (from `Calendar.test.tsx:32-35`)

```typescript
function getRef(ref: React.RefObject<CalendarRef | null>): CalendarRef {
  if (!ref.current) throw new Error("Ref not set");
  return ref.current;
}
```

**Error Testing:**

- Type casting for extracting callback arguments:

```typescript
const range = onDateRangeChange.mock.calls[onDateRangeChange.mock.calls.length - 1][0] as {
  start: Date;
  end: Date;
};
```

**Date Testing:**

- Always use fixed dates to avoid test flakiness
- Pattern: `new Date(2026, 1, 11)` (note: month is 0-indexed, so 1 = February)
- Document date context in comments: `// Wed Feb 11`, `// Monday Feb 9`

**DOM Queries:**

- Use data-testid for reliable element selection: `screen.getByTestId("pro-calendr-react")`
- Text queries for user-facing text: `screen.getByText("Prev")`, `screen.getByText("Today")`
- getAllByText for multiple matches: `screen.getAllByText(/Mon|Tue|Wed|Thu|Fri|Sat|Sun/)`

## Test Coverage Status

**Current Coverage (8 test files, 118+ tests):**

- `date-utils.test.ts`: Comprehensive coverage of date formatting and range calculation
- `event-filter.test.ts`: Coverage of event filtering, grouping, and sorting
- `event-position.test.ts`: Event positioning logic (layout collision detection)
- `slot.test.ts`: Time slot generation and parsing
- `snap.test.ts`: Event snapping to time grid
- `Calendar.test.tsx`: 42+ test cases covering rendering, navigation, refs, callbacks
- `calendar-store.test.ts`: Store actions and state management
- `WeekView.test.tsx`: Week view rendering, events, all-day events

**Gaps:**

- Month view tests: Not yet implemented
- Day view tests: Not yet implemented
- Timeline view tests: Not yet implemented
- List view tests: Not yet implemented
- Keyboard interaction: `use-keyboard.ts` has TODO marker, no tests
- Virtualization: `use-virtualization.ts` has TODO marker, no tests
- Drag and drop: Not yet implemented
- Accessibility: Limited a11y testing

---

_Testing analysis: 2025-02-16_
