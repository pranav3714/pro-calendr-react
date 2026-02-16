---
phase: 05-resources-listview
plan: 01
subsystem: ui
tags: [zustand, react, resource-tree, hooks]

# Dependency graph
requires:
  - phase: 01-foundation-theming
    provides: CalendarStore slices, CalendarProvider, CalendarContext, CalendarClassNames
provides:
  - ResourceSlice with collapse state (collapsedGroupIds, toggleGroupCollapse, setCollapsedGroupIds)
  - buildResourceTree pure utility for grouping/filtering/sorting resources
  - useResources computation hook producing ResourceTree
  - CalendarConfig extended with 6 resource props
  - CalendarClassNames with 4 list view slots
affects: [05-02-listview, 06-timeline-view, resource-aware-views]

# Tech tracking
tech-stack:
  added: []
  patterns: [resource-tree-computation, group-collapse-state, set-based-filtering]

key-files:
  created:
    - packages/core/src/utils/resource-utils.ts
    - packages/core/src/utils/__tests__/resource-utils.test.ts
    - packages/core/src/hooks/use-resources.ts
  modified:
    - packages/core/src/store/slices/resource-slice.ts
    - packages/core/src/components/CalendarProvider.tsx
    - packages/core/src/types/theme.ts
    - packages/core/src/hooks/index.ts

key-decisions:
  - "collapsedGroupIds uses string[] (not Set) per Zustand Object.is equality pitfall -- Set mutations bypass change detection"
  - "buildResourceTree accepts arrays but converts to Set internally for O(1) lookups"
  - "Groups with no matching resources are excluded from the tree output"
  - "Resources with groupId not matching any defined group are placed in ungrouped"

patterns-established:
  - "Resource tree computation: pure function + useMemo hook pattern for derived resource state"
  - "Collapse state pattern: string[] in store with toggle action using filter/spread for immutable updates"

# Metrics
duration: 3min
completed: 2026-02-17
---

# Phase 5 Plan 1: Resource Data Layer Summary

**Resource data layer with Zustand collapse state, pure buildResourceTree utility for group/filter/sort, useResources hook, and CalendarConfig resource props**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-16T20:15:15Z
- **Completed:** 2026-02-16T20:18:15Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Extended ResourceSlice with collapsedGroupIds, toggleGroupCollapse, and setCollapsedGroupIds for group collapse management
- Created buildResourceTree pure utility with two-level grouping, filtering, collapse state tracking, and order-based sorting
- Created useResources hook computing ResourceTree from CalendarConfig + store state via useMemo
- Wired 6 resource props (resources, resourceGroups, resourceLabel, resourceGroupHeader, resourceAreaWidth, filterResourcesWithEvents) through CalendarConfig and CalendarProviderProps
- Added 4 list view classNames slots (listView, listDateHeader, listEventRow, listEmptyMessage)
- 10 comprehensive tests covering all buildResourceTree behaviors

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend ResourceSlice and create buildResourceTree utility with tests** - `0f1896b` (feat)
2. **Task 2: Create useResources hook, wire CalendarConfig with resource props, add classNames slots** - `673fe36` (feat)

## Files Created/Modified
- `packages/core/src/store/slices/resource-slice.ts` - Extended with collapsedGroupIds, toggleGroupCollapse, setCollapsedGroupIds
- `packages/core/src/utils/resource-utils.ts` - Pure buildResourceTree function with ResourceGroupNode/ResourceTree types
- `packages/core/src/utils/__tests__/resource-utils.test.ts` - 10 tests for buildResourceTree
- `packages/core/src/hooks/use-resources.ts` - useResources hook computing ResourceTree from config + store
- `packages/core/src/hooks/index.ts` - Added useResources export
- `packages/core/src/components/CalendarProvider.tsx` - Added 6 resource fields to CalendarConfig and CalendarProviderProps
- `packages/core/src/types/theme.ts` - Added listView, listDateHeader, listEventRow, listEmptyMessage to CalendarClassNames

## Decisions Made
- collapsedGroupIds uses string[] (not Set) to work correctly with Zustand's Object.is equality check -- Set mutations would bypass change detection
- buildResourceTree accepts arrays as parameters but converts to Set internally for O(1) lookup performance
- Groups with no matching resources after filtering are excluded from the tree output (no empty group nodes)
- Resources with a groupId that does not match any defined group are placed in the ungrouped array

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Resource data layer complete, ready for Plan 02 (ListView component)
- useResources hook available for any view needing resource-aware rendering
- CalendarConfig resource props wired through for consumer configuration

---
*Phase: 05-resources-listview*
*Completed: 2026-02-17*
