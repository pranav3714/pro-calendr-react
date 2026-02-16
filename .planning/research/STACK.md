# Stack Research

**Domain:** React calendar component library (scheduler, timeline, resource views)
**Researched:** 2026-02-16
**Confidence:** HIGH

## Existing Stack (No Changes Needed)

These are already in the project and remain the correct choices. Not re-researched.

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| React | ^18.0.0 / ^19.0.0 | UI framework | Peer dep, stable |
| TypeScript | ^5.7.0 | Type safety | Dev dep, stable |
| date-fns | ^4.1.0 | Date math | Dep, stable |
| date-fns-tz | ^3.2.0 | Timezone support | Dep, stable |
| @tanstack/react-virtual | ^3.11.0 | Row/column virtualization | Dep, stable (latest: 3.13.18) |
| zustand | ^5.0.0 | Internal state management | Dep, stable (latest: 5.0.11) |
| tsup | ^8.3.0 | Multi-entry bundling | Dev dep, stable |
| Tailwind CSS | ^3.4.0 | Utility-first CSS | Dev dep, stable |
| Vitest | ^2.1.0 | Testing | Dev dep, stable |
| Storybook | ^8.5.0 | Component dev | Dev dep, stable |

## New Dependencies to Add

### Drag and Drop: Custom Pointer Events (no library)

| Decision | Use custom pointer events | Confidence: HIGH |
|----------|--------------------------|-------------------|

**Recommendation: Do NOT add a drag-and-drop library. Build custom drag using pointer events.**

**Why:**

1. **Calendar DnD is not generic DnD.** Calendar drag-and-drop needs time-snapping, resource lane awareness, resize handles, multi-day spanning, and preview rendering. Generic DnD libraries (dnd-kit, pragmatic-drag-and-drop) solve drag-between-containers and sortable-lists -- they don't solve time-grid snapping. You end up fighting the library's abstractions more than benefiting from them.

2. **FullCalendar, react-big-calendar, and Schedule-X all use custom pointer/mouse event implementations.** This is the industry pattern for calendar DnD. They do not wrap generic DnD libraries.

3. **Pointer Events API is mature and sufficient.** `pointerdown`, `pointermove`, `pointerup` with `setPointerCapture` handles mouse, touch, and pen input in a single code path. No library needed.

4. **The store already has `DragState`.** The Zustand store already defines `DragOrigin`, `DragPosition`, `DragState`, and `DropValidationResult` types. The `useDrag` hook stub exists. The architecture is ready for a custom implementation.

5. **Bundle size = 0.** No additional dependency.

**What to build:**
- `useDrag` hook: manages `pointerdown/move/up`, pointer capture, throttled position updates
- `useResize` hook: same pattern but for event edge handles
- `useDragPreview` hook: renders ghost element following cursor
- Snap-to-grid utility: converts pixel positions to time slots
- Drop validation: uses existing `DropValidationResult` type

**Alternatives considered:**

| Library | Version | Why Not |
|---------|---------|---------|
| @dnd-kit/core | 6.3.1 | Frozen since Dec 2024. Maintainer is rewriting as @dnd-kit/react (v0.3.0, pre-stable). The old API won't get updates; the new API isn't production-ready. Calendar DnD needs time-snapping which dnd-kit doesn't provide. |
| @dnd-kit/react | 0.3.0 | Published today (2026-02-16). Pre-stable (0.x). API may change. Not battle-tested. |
| @atlaskit/pragmatic-drag-and-drop | 1.7.7 | Actively maintained by Atlassian. Good for Trello-style board DnD. But it's built on HTML5 Drag API which has touch limitations (unreliable on iOS). Calendar needs pointer events for cross-device consistency. Also doesn't provide time-grid snapping. |
| react-dnd | - | Legacy. HTML5 backend has same touch issues. Community has moved on. |

---

### Floating Positioning: @floating-ui/react

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| @floating-ui/react | ^0.27.0 | Context menus, event popovers, tooltips | HIGH |

**Why @floating-ui/react:**

1. **Positioning engine for any floating element.** Context menus, event detail popovers, tooltip previews, and dropdown filters all need smart positioning that avoids viewport edges. Floating UI handles flip, shift, offset, and auto-placement middleware.

2. **Headless, not opinionated.** Provides hooks (`useFloating`, `useClick`, `useDismiss`, `useRole`, `useInteractions`) -- no pre-built UI. Fits the library's own headless/customizable philosophy.

3. **Built-in accessibility.** `useRole` adds correct ARIA attributes. `useDismiss` handles Escape key and outside clicks. `useFocus` and `useHover` handle interaction modes.

4. **Lightweight.** ~5KB gzipped for the React package. No heavy UI framework dependency.

5. **Industry standard.** Used by Radix UI, Base UI, shadcn/ui, and hundreds of component libraries. 1,496 dependents on npm. Actively maintained (latest: 0.27.17, published Feb 2026).

6. **React 18/19 compatible.** Peer dependency is `react >= 17.0.0`.

**What it enables:**
- Context menu positioning at pointer coordinates
- Event detail popover anchored to event elements
- Tooltip previews on hover
- Filter/search dropdown positioning

**Alternative considered:**

| Alternative | Why Not |
|-------------|---------|
| Radix UI Context Menu | Full component, not headless primitives. Would impose markup structure on library consumers. Heavier dependency. |
| Custom `position: fixed` + manual calculation | Reinventing flip/shift/overflow detection. Floating UI already solved this. |

---

### Class Name Merging: clsx

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| clsx | ^2.1.0 | Conditional class name composition | HIGH |

**Why clsx:**

1. **The project currently uses raw string concatenation** (`className={`pro-calendr-react ${classNames?.root ?? ""}`}`). As views multiply (5 views + resource system + drag states + selection states + density modes), conditional class logic will become unmaintainable without a utility.

2. **239 bytes gzipped.** Essentially free in bundle size.

3. **3x faster than classnames** in benchmarks (12.8M ops/sec vs 3.9M ops/sec). In a calendar rendering 1000+ event blocks with conditional classes, this matters.

4. **clsx/lite (140 bytes)** is even smaller and ignores non-string arguments -- ideal for Tailwind-only usage where you never pass objects.

5. **No tailwind-merge needed as a dependency.** tailwind-merge (3.4.1) resolves Tailwind class conflicts, but that's a concern for *consumers* overriding classes, not for the library's internal usage. The library controls its own class generation and can avoid conflicts by design. Consumers can wrap with their own `cn()` utility if needed. Adding tailwind-merge as a dependency would add ~12KB gzipped to all consumers' bundles.

---

### No Additional Dependencies Needed

The following features should be built with existing tools or browser APIs:

| Feature | Approach | Why No Library |
|---------|----------|----------------|
| **Keyboard navigation** | Custom `useKeyboard` hook + `keydown` events | Roving tabindex and arrow key grid navigation are ~100 lines of code. The WAI-ARIA grid pattern is well-documented. A library would be heavier than the implementation. |
| **Multi-select** | Extend existing `Selection` type in Zustand store | Selection state is 3-4 store properties + Shift/Ctrl modifier detection. Already have `useSelection` hook stub. |
| **Search/filter** | Pure filtering logic in a `useFilteredEvents` hook | String matching on event titles/descriptions is trivial. No search library needed for client-side filtering of calendar events. |
| **Skeleton loading** | CSS animation with Tailwind `animate-pulse` | Calendar skeletons are rectangular blocks mimicking the time grid. 20-30 lines of CSS. Adding react-loading-skeleton (3.5.0) would add a dependency for something achievable with `<div className="animate-pulse bg-gray-200 rounded" />`. |
| **Dark mode** | CSS custom properties + `.dark` class toggle | Already architected with `--cal-*` variables. No library needed. |
| **Theming** | CSS custom properties + `classNames` prop | Already architected. Consumers override via CSS variables or Tailwind. |
| **Event collision/overlap** | Custom layout algorithm (column packing) | This is domain-specific math (finding overlapping time ranges, assigning columns). No library exists for this -- every calendar implements its own. `collision.ts` and `conflict.ts` utils already exist. |

---

## Development Dependencies to Add

| Tool | Version | Purpose | Confidence |
|------|---------|---------|------------|
| @storybook/addon-a11y | ^8.5.0 | Accessibility auditing in Storybook | HIGH (already installed) |
| @testing-library/user-event | ^14.5.0 | Simulating pointer/keyboard events in tests | HIGH (already installed) |

No new dev dependencies are needed. The existing test and dev toolchain is complete.

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **react-dnd** | Legacy library. HTML5 backend has touch issues. Community has moved to dnd-kit/pragmatic. No calendar-specific features. | Custom pointer events |
| **react-beautiful-dnd** | Deprecated by Atlassian. Replaced by pragmatic-drag-and-drop. No new releases. | Custom pointer events |
| **@dnd-kit/core** (for new features) | Frozen since Dec 2024. Maintainer is rewriting as @dnd-kit/react. Old API won't receive updates. | Custom pointer events |
| **@dnd-kit/react** | v0.3.0 pre-stable (0.x). API may break. Not production-ready for a library that others depend on. | Custom pointer events |
| **tailwind-merge** (as a library dep) | Adds ~12KB to all consumers. Library controls its own classes -- no conflicts to resolve internally. | Let consumers add their own `cn()` if needed |
| **react-loading-skeleton** | Dependency for 20 lines of CSS. Calendar skeletons are simple rectangles. | Tailwind `animate-pulse` + `--cal-*` variables |
| **cmdk / kbar** | Command palette libraries. Calendar search is simpler -- a filtered list, not a command palette. Over-engineered for the use case. | Custom `useFilteredEvents` hook + basic input |
| **react-hotkeys-hook** | Calendar keyboard shortcuts are a small, contained set (arrows, Enter, Escape, Tab, Shift). A 10-line `useEffect` with `keydown` is sufficient. | Custom `useKeyboard` hook |
| **immer** (as middleware) | The Zustand store is simple flat state with ~10 properties. Immer's structural sharing adds overhead without benefit. If state nesting grows significantly later, reconsider. | Direct Zustand `set()` calls |
| **Radix UI primitives** | Would impose markup structure on consumers. A calendar library should own its DOM. Radix components are designed for app-level usage, not for wrapping inside another component library. | @floating-ui/react for positioning only |

---

## Installation

```bash
# New runtime dependency
pnpm add @floating-ui/react clsx

# That's it. Everything else is already installed or built custom.
```

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| @floating-ui/react ^0.27.0 | React ^18.0.0 / ^19.0.0 | Peer dep: react >= 17.0.0. Safe with project's React range. |
| clsx ^2.1.0 | Any bundler | Zero dependencies. Pure ESM + CJS. |
| @tanstack/react-virtual ^3.11.0 | React 18/19 | Note: v3 uses `flushSync` which triggers console warnings in React 19 dev mode. Not a bug -- cosmetic only. |
| zustand ^5.0.0 | React 18/19 | v5 dropped default exports. Project already uses named imports (`create`). |
| date-fns ^4.1.0 | date-fns-tz ^3.2.0 | date-fns 4 is ESM-first. Requires tsup's ESM output (already configured). |

---

## Stack Patterns by Feature

**If adding context menus:**
- Use @floating-ui/react `useFloating` + `useInteractions` + `useDismiss`
- Position at pointer coordinates via `virtualElement` pattern
- Close on Escape, outside click, or menu item selection

**If adding event popovers:**
- Use @floating-ui/react with `flip` + `shift` + `offset` middleware
- Anchor to the event element, flip to opposite side if viewport edge
- Support both click-to-open and hover-to-preview modes

**If adding drag-and-drop:**
- Use `pointerdown` on event element, `pointermove` on document, `pointerup` on document
- Call `setPointerCapture` on pointerdown for reliable tracking
- Throttle pointermove to 60fps via `requestAnimationFrame`
- Update Zustand `dragState` on each frame
- Snap to time grid using existing slot utilities

**If adding keyboard navigation:**
- Implement roving tabindex pattern on the calendar grid
- Arrow keys move focus between cells (day/time slots)
- Enter/Space selects or opens events
- Escape closes popovers/deselects
- Tab moves focus out of the grid to the next focusable element
- Use `role="grid"`, `role="row"`, `role="gridcell"` ARIA attributes

---

## Sources

- npm registry -- verified all version numbers via `npm view` (HIGH confidence)
- [dnd-kit maintenance issue #1194](https://github.com/clauderic/dnd-kit/issues/1194) -- maintainer confirmed rewrite in progress, old API frozen (HIGH confidence)
- [dnd-kit/react discussion #1842](https://github.com/clauderic/dnd-kit/discussions/1842) -- no maintainer response on stability timeline (HIGH confidence)
- [Puck: Top 5 DnD Libraries for React 2026](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react) -- ecosystem overview (MEDIUM confidence)
- [WAI-ARIA Keyboard Interface Practices](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/) -- keyboard navigation patterns (HIGH confidence)
- [Floating UI React docs](https://floating-ui.com/docs/react) -- API reference, examples (HIGH confidence)
- [npm-compare: clsx vs classnames](https://npm-compare.com/classnames,clsx) -- benchmark data (MEDIUM confidence)
- [tailwind-merge discussion #243](https://github.com/dcastil/tailwind-merge/discussions/243) -- performance comparison with clsx (MEDIUM confidence)
- [Pointer Events DnD in React (Jan 2026)](https://medium.com/@aswathyraj/how-i-built-drag-and-drop-in-react-without-libraries-using-pointer-events-a0f96843edb7) -- custom DnD pattern validation (MEDIUM confidence)
- [React Aria Calendar](https://react-spectrum.adobe.com/react-aria/Calendar.html) -- ARIA calendar patterns reference (HIGH confidence)

---
*Stack research for: React calendar component library with DnD, keyboard nav, virtualization*
*Researched: 2026-02-16*
