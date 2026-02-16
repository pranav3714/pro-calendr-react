import { useEffect, useRef, type RefObject } from "react";
import type { CalendarViewType, KeyboardShortcutsConfig, Selection } from "../types";
import type { DragPhase } from "../types/interaction";
import { KEYS } from "../constants/keys";

export interface UseKeyboardOptions {
  rootRef: RefObject<HTMLElement | null>;
  config: KeyboardShortcutsConfig;
  setView: (view: CalendarViewType) => void;
  navigateDate: (dir: "prev" | "next" | "today") => void;
  cancelDrag: () => void;
  setSelection: (sel: Selection | null) => void;
  getDragPhase: () => DragPhase;
  getSelection: () => Selection | null;
}

/** Tags that should suppress keyboard shortcuts (text input contexts) */
const INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

function isInputTarget(target: EventTarget | null): boolean {
  if (!target) return false;
  const el = target as HTMLElement;
  if (INPUT_TAGS.has(el.tagName)) return true;
  if (el.isContentEditable) return true;
  return false;
}

export function useKeyboard(options: UseKeyboardOptions): void {
  const { rootRef, config } = options;

  // Stable ref to avoid recreating listener on option changes
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (!config.enabled) return;

    const root = rootRef.current;
    if (!root) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const opts = optionsRef.current;

      // Guard: don't intercept shortcuts when focus is in a text input
      if (isInputTarget(e.target)) return;

      switch (e.key) {
        // Escape priority chain: drag > selection > nothing
        case KEYS.ESCAPE: {
          const phase = opts.getDragPhase();
          if (phase === "pending" || phase === "dragging") {
            opts.cancelDrag();
            e.preventDefault();
            return;
          }

          const selection = opts.getSelection();
          if (selection) {
            opts.setSelection(null);
            e.preventDefault();
            return;
          }

          // Nothing to cancel -- let Escape propagate
          return;
        }

        // View shortcuts
        case KEYS.TODAY:
          opts.navigateDate("today");
          return;

        case KEYS.DAY_VIEW:
          opts.setView("day");
          return;

        case KEYS.WEEK_VIEW:
          opts.setView("week");
          return;

        case KEYS.MONTH_VIEW:
          opts.setView("month");
          return;

        default: {
          // Custom bindings
          if (opts.config.customBindings?.[e.key]) {
            opts.config.customBindings[e.key]();
            return;
          }
          break;
        }
      }
    };

    root.addEventListener("keydown", handleKeyDown);

    return () => {
      root.removeEventListener("keydown", handleKeyDown);
    };
  }, [rootRef, config.enabled]);
}
