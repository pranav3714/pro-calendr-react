import type { ReactNode } from "react";
import type { CalendarResource } from "./resource";
import type { ContextMenuTarget, ContextMenuItem, DropValidationResult } from "./interaction";
import type { CalendarEvent } from "./event";

export interface TimelineBand {
  id: string;
  label?: string;
  start: Date;
  end: Date;
  color: string;
  opacity?: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface CalendarPlugin {
  /** Unique plugin name */
  name: string;
  /** Add visual bands/overlays to the timeline */
  timelineBands?: (dateRange: DateRange) => TimelineBand[];
  /** Decorate resource labels with additional content */
  resourceDecorator?: (resource: CalendarResource) => ReactNode;
  /** Add items to context menus */
  contextMenuItems?: (target: ContextMenuTarget) => ContextMenuItem[];
  /** Custom drop validation */
  validateDrop?: (info: {
    event: CalendarEvent;
    newStart: Date;
    newEnd: Date;
    newResourceId?: string;
  }) => DropValidationResult;
  /** Custom toolbar widgets */
  toolbarWidgets?: {
    position: "left" | "center" | "right";
    render: () => ReactNode;
  }[];
}
