import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { renderHook, act } from "@testing-library/react";
import type { StoreApi } from "zustand/vanilla";
import type { ScheduleStore } from "../../interfaces/store-types";
import { createScheduleStore } from "../../store/create-schedule-store";
import { ScheduleStoreContext } from "../../components/ScheduleStoreContext";
import { useKeyboardNavigation } from "../use-keyboard-navigation";

function createWrapper({ store }: { readonly store: StoreApi<ScheduleStore> }) {
  return function Wrapper({ children }: { readonly children: React.ReactNode }) {
    return React.createElement(ScheduleStoreContext.Provider, { value: store }, children);
  };
}

function pressKey({
  key,
  target,
  ctrlKey,
}: {
  readonly key: string;
  readonly target?: EventTarget;
  readonly ctrlKey?: boolean;
}): void {
  const event = new KeyboardEvent("keydown", {
    key,
    bubbles: true,
    ctrlKey: ctrlKey ?? false,
  });

  if (target) {
    Object.defineProperty(event, "target", { value: target });
  }

  document.dispatchEvent(event);
}

describe("useKeyboardNavigation", () => {
  let store: StoreApi<ScheduleStore>;

  beforeEach(() => {
    store = createScheduleStore({ config: { defaultViewMode: "day" } });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("navigates to previous date on ArrowLeft", () => {
    const initialDate = store.getState().currentDate;
    renderHook(
      () => {
        useKeyboardNavigation({ enabled: true });
      },
      {
        wrapper: createWrapper({ store }),
      },
    );

    act(() => {
      pressKey({ key: "ArrowLeft" });
    });

    const newDate = store.getState().currentDate;
    expect(newDate.getTime()).toBeLessThan(initialDate.getTime());
  });

  it("navigates to next date on ArrowRight", () => {
    const initialDate = store.getState().currentDate;
    renderHook(
      () => {
        useKeyboardNavigation({ enabled: true });
      },
      {
        wrapper: createWrapper({ store }),
      },
    );

    act(() => {
      pressKey({ key: "ArrowRight" });
    });

    const newDate = store.getState().currentDate;
    expect(newDate.getTime()).toBeGreaterThan(initialDate.getTime());
  });

  it("navigates to today on 't' key", () => {
    store.getState().navigateDate({ direction: "prev" });
    store.getState().navigateDate({ direction: "prev" });
    const offsetDate = store.getState().currentDate;
    const today = new Date();
    expect(offsetDate.getDate()).not.toBe(today.getDate());

    renderHook(
      () => {
        useKeyboardNavigation({ enabled: true });
      },
      {
        wrapper: createWrapper({ store }),
      },
    );

    act(() => {
      pressKey({ key: "t" });
    });

    const newDate = store.getState().currentDate;
    expect(newDate.getDate()).toBe(today.getDate());
  });

  it("switches to day view on 'd' key", () => {
    store.getState().setViewMode({ mode: "week" });

    renderHook(
      () => {
        useKeyboardNavigation({ enabled: true });
      },
      {
        wrapper: createWrapper({ store }),
      },
    );

    act(() => {
      pressKey({ key: "d" });
    });
    expect(store.getState().viewMode).toBe("day");
  });

  it("switches to week view on 'w' key", () => {
    renderHook(
      () => {
        useKeyboardNavigation({ enabled: true });
      },
      {
        wrapper: createWrapper({ store }),
      },
    );

    act(() => {
      pressKey({ key: "w" });
    });
    expect(store.getState().viewMode).toBe("week");
  });

  it("switches to month view on 'm' key", () => {
    renderHook(
      () => {
        useKeyboardNavigation({ enabled: true });
      },
      {
        wrapper: createWrapper({ store }),
      },
    );

    act(() => {
      pressKey({ key: "m" });
    });
    expect(store.getState().viewMode).toBe("month");
  });

  it("closes filter dropdown on Escape when open", () => {
    store.getState().toggleFilterDropdown();
    expect(store.getState().isFilterDropdownOpen).toBe(true);

    renderHook(
      () => {
        useKeyboardNavigation({ enabled: true });
      },
      {
        wrapper: createWrapper({ store }),
      },
    );

    act(() => {
      pressKey({ key: "Escape" });
    });
    expect(store.getState().isFilterDropdownOpen).toBe(false);
  });

  it("does not close filter dropdown on Escape when already closed", () => {
    expect(store.getState().isFilterDropdownOpen).toBe(false);

    renderHook(
      () => {
        useKeyboardNavigation({ enabled: true });
      },
      {
        wrapper: createWrapper({ store }),
      },
    );

    act(() => {
      pressKey({ key: "Escape" });
    });
    expect(store.getState().isFilterDropdownOpen).toBe(false);
  });

  it("ignores keys when target is an input element", () => {
    renderHook(
      () => {
        useKeyboardNavigation({ enabled: true });
      },
      {
        wrapper: createWrapper({ store }),
      },
    );

    const input = document.createElement("input");

    act(() => {
      pressKey({ key: "d", target: input });
    });
    expect(store.getState().viewMode).toBe("day");
  });

  it("ignores keys when modifier key is held", () => {
    renderHook(
      () => {
        useKeyboardNavigation({ enabled: true });
      },
      {
        wrapper: createWrapper({ store }),
      },
    );

    act(() => {
      pressKey({ key: "w", ctrlKey: true });
    });
    expect(store.getState().viewMode).toBe("day");
  });

  it("does nothing when disabled", () => {
    renderHook(
      () => {
        useKeyboardNavigation({ enabled: false });
      },
      {
        wrapper: createWrapper({ store }),
      },
    );

    act(() => {
      pressKey({ key: "w" });
    });
    expect(store.getState().viewMode).toBe("day");
  });
});
