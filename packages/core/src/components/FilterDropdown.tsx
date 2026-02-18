import { useCallback, useEffect, useRef } from "react";
import type {
  FilterDropdownProps,
  GetFilterButtonIndicatorParams,
  ResolveTypeItemStyleParams,
} from "../interfaces/schedule-header-props";
import { cn } from "../utils/cn";
import { useScheduleStore } from "../hooks/use-schedule-store";
import { FilterIcon } from "./icons/FilterIcon";

function getFilterButtonIndicator({ hasActiveFilter }: GetFilterButtonIndicatorParams): string {
  if (hasActiveFilter) {
    return "text-[var(--cal-accent)]";
  }
  return "text-[var(--cal-text-muted)]";
}

function getAllTypesButtonStyle({ hasActiveFilter }: GetFilterButtonIndicatorParams): string {
  if (!hasActiveFilter) {
    return "font-medium text-[var(--cal-accent)]";
  }
  return "text-[var(--cal-text)]";
}

function resolveTypeItemStyle({ isActive }: ResolveTypeItemStyleParams): string {
  if (isActive) {
    return "font-medium text-[var(--cal-text)]";
  }
  return "text-[var(--cal-text-muted)]";
}

export function FilterDropdown({ bookingTypes }: FilterDropdownProps) {
  const activeTypeFilter = useScheduleStore({
    selector: (s) => s.activeTypeFilter,
  });
  const isFilterDropdownOpen = useScheduleStore({
    selector: (s) => s.isFilterDropdownOpen,
  });
  const setActiveTypeFilter = useScheduleStore({
    selector: (s) => s.setActiveTypeFilter,
  });
  const toggleFilterDropdown = useScheduleStore({
    selector: (s) => s.toggleFilterDropdown,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (!isFilterDropdownOpen) {
        return;
      }
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        toggleFilterDropdown();
      }
    },
    [isFilterDropdownOpen, toggleFilterDropdown],
  );

  const handleEscapeKey = useCallback(
    (event: KeyboardEvent) => {
      if (!isFilterDropdownOpen) {
        return;
      }
      if (event.key !== "Escape") {
        return;
      }
      event.stopPropagation();
      toggleFilterDropdown();
    },
    [isFilterDropdownOpen, toggleFilterDropdown],
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [handleClickOutside, handleEscapeKey]);

  const resolveNextFilter = useCallback(
    ({ type }: { readonly type: string | null }): string | null => {
      if (activeTypeFilter === type) {
        return null;
      }
      return type;
    },
    [activeTypeFilter],
  );

  const handleTypeClick = useCallback(
    ({ type }: { readonly type: string | null }) => {
      setActiveTypeFilter({ type: resolveNextFilter({ type }) });
      toggleFilterDropdown();
    },
    [resolveNextFilter, setActiveTypeFilter, toggleFilterDropdown],
  );

  const hasActiveFilter = activeTypeFilter !== null;
  const typeEntries = Object.entries(bookingTypes);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={toggleFilterDropdown}
        aria-expanded={isFilterDropdownOpen}
        aria-haspopup="menu"
        className={cn(
          "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
          "bg-[var(--cal-bg-muted)] hover:bg-[var(--cal-hover-bg)]",
          getFilterButtonIndicator({ hasActiveFilter }),
        )}
      >
        <FilterIcon />
        <span>Filter</span>
        {hasActiveFilter && <span className="h-1.5 w-1.5 rounded-full bg-[var(--cal-accent)]" />}
      </button>

      {isFilterDropdownOpen && (
        <div
          className="pro-calendr-react-filter-dropdown absolute right-0 top-full z-[var(--cal-z-popover)] mt-1 w-52 rounded-md border border-[var(--cal-border)] bg-[var(--cal-bg)] shadow-[var(--cal-shadow-md)]"
          role="menu"
        >
          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                handleTypeClick({ type: null });
              }}
              role="menuitem"
              className={cn(
                "flex w-full items-center gap-2 px-3 py-1.5 text-xs transition-colors",
                "hover:bg-[var(--cal-hover-bg)]",
                getAllTypesButtonStyle({ hasActiveFilter }),
              )}
            >
              All Types
            </button>

            {typeEntries.map(([type, config]) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  handleTypeClick({ type });
                }}
                role="menuitem"
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-1.5 text-xs transition-colors",
                  "hover:bg-[var(--cal-hover-bg)]",
                  resolveTypeItemStyle({ isActive: activeTypeFilter === type }),
                )}
              >
                <span className={cn("h-2 w-2 shrink-0 rounded-full", config.dot)} />
                <span>{config.label}</span>
                {activeTypeFilter === type && (
                  <span className="ml-auto text-[10px] text-[var(--cal-accent)]">Active</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
