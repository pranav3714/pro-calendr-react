import type { ViewMode } from "./view-mode";
import type { DragOrigin, DragPhase, DragPosition } from "./drag-state";
import type { ResizeEdge, ResizeOrigin, ResizePhase, ResizePosition } from "./resize-state";
import type { PopoverAnchor } from "./popover-state";

export interface NavigationSlice {
  readonly viewMode: ViewMode;
  readonly currentDate: Date;
  readonly setViewMode: (params: { readonly mode: ViewMode }) => void;
  readonly setCurrentDate: (params: { readonly date: Date }) => void;
  readonly navigateDate: (params: { readonly direction: "prev" | "next" | "today" }) => void;
}

export interface ResourceSlice {
  readonly collapsedGroupIds: Set<string>;
  readonly toggleGroupCollapse: (params: { readonly groupId: string }) => void;
  readonly setCollapsedGroupIds: (params: { readonly ids: Set<string> }) => void;
}

export interface FilterSlice {
  readonly activeTypeFilter: string | null;
  readonly isFilterDropdownOpen: boolean;
  readonly setActiveTypeFilter: (params: { readonly type: string | null }) => void;
  readonly toggleFilterDropdown: () => void;
}

export interface SelectionSlice {
  readonly selectedBookingId: string | null;
  readonly popoverAnchor: PopoverAnchor | null;
  readonly selectBooking: (params: {
    readonly bookingId: string;
    readonly anchor: PopoverAnchor;
  }) => void;
  readonly clearSelection: () => void;
}

export interface DragSlice {
  readonly dragPhase: DragPhase;
  readonly draggedBookingId: string | null;
  readonly dragOrigin: DragOrigin | null;
  readonly dragPosition: DragPosition | null;
  readonly startDragPending: (params: {
    readonly bookingId: string;
    readonly origin: DragOrigin;
  }) => void;
  readonly startDragging: () => void;
  readonly updateDragPosition: (params: { readonly position: DragPosition }) => void;
  readonly completeDrag: () => {
    readonly bookingId: string;
    readonly origin: DragOrigin;
    readonly finalPosition: DragPosition;
  } | null;
  readonly cancelDrag: () => void;
}

export interface ResizeSlice {
  readonly resizePhase: ResizePhase;
  readonly resizedBookingId: string | null;
  readonly resizeEdge: ResizeEdge | null;
  readonly resizeOrigin: ResizeOrigin | null;
  readonly resizePosition: ResizePosition | null;
  readonly startResizePending: (params: {
    readonly bookingId: string;
    readonly edge: ResizeEdge;
    readonly origin: ResizeOrigin;
  }) => void;
  readonly startResizing: () => void;
  readonly updateResizePosition: (params: { readonly position: ResizePosition }) => void;
  readonly completeResize: () => {
    readonly bookingId: string;
    readonly edge: ResizeEdge;
    readonly origin: ResizeOrigin;
    readonly finalPosition: ResizePosition;
  } | null;
  readonly cancelResize: () => void;
}

export type ScheduleStore = NavigationSlice &
  ResourceSlice &
  FilterSlice &
  SelectionSlice &
  DragSlice &
  ResizeSlice;
