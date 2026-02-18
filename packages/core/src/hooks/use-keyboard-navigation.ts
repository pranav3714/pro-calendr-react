import { useEffect, useRef } from "react";
import type { UseKeyboardNavigationParams } from "../interfaces/keyboard-navigation-params";
import { useScheduleStore } from "./use-schedule-store";

function isEditableTarget({ target }: { readonly target: EventTarget | null }): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tagName = target.tagName.toLowerCase();
  return tagName === "input" || tagName === "textarea" || tagName === "select";
}

function hasModifierKey({ event }: { readonly event: KeyboardEvent }): boolean {
  return event.metaKey || event.ctrlKey || event.altKey;
}

export function useKeyboardNavigation({ enabled }: UseKeyboardNavigationParams): void {
  const navigateDate = useScheduleStore({ selector: (s) => s.navigateDate });
  const setViewMode = useScheduleStore({ selector: (s) => s.setViewMode });
  const isFilterDropdownOpen = useScheduleStore({ selector: (s) => s.isFilterDropdownOpen });
  const toggleFilterDropdown = useScheduleStore({ selector: (s) => s.toggleFilterDropdown });

  const navigateDateRef = useRef(navigateDate);
  const setViewModeRef = useRef(setViewMode);
  const isFilterDropdownOpenRef = useRef(isFilterDropdownOpen);
  const toggleFilterDropdownRef = useRef(toggleFilterDropdown);

  navigateDateRef.current = navigateDate;
  setViewModeRef.current = setViewMode;
  isFilterDropdownOpenRef.current = isFilterDropdownOpen;
  toggleFilterDropdownRef.current = toggleFilterDropdown;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (isEditableTarget({ target: event.target })) {
        return;
      }

      if (hasModifierKey({ event })) {
        return;
      }

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          navigateDateRef.current({ direction: "prev" });
          break;

        case "ArrowRight":
          event.preventDefault();
          navigateDateRef.current({ direction: "next" });
          break;

        case "t":
          event.preventDefault();
          navigateDateRef.current({ direction: "today" });
          break;

        case "d":
          event.preventDefault();
          setViewModeRef.current({ mode: "day" });
          break;

        case "w":
          event.preventDefault();
          setViewModeRef.current({ mode: "week" });
          break;

        case "m":
          event.preventDefault();
          setViewModeRef.current({ mode: "month" });
          break;

        case "Escape":
          if (isFilterDropdownOpenRef.current) {
            event.preventDefault();
            toggleFilterDropdownRef.current();
          }
          break;

        default:
          break;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled]);
}
