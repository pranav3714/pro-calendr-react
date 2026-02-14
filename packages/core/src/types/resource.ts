export interface CalendarResource {
  /** Unique resource identifier */
  id: string;
  /** Display title for the resource */
  title: string;
  /** Group ID for grouping resources */
  groupId?: string;
  /** Sort order within group */
  order?: number;
  /** Arbitrary metadata attached to the resource */
  extendedProps?: Record<string, unknown>;
}

export interface CalendarResourceGroup {
  /** Unique group identifier */
  id: string;
  /** Display title for the group */
  title: string;
  /** Sort order */
  order?: number;
}

export interface ResourceLabelProps {
  resource: CalendarResource;
}

export interface ResourceGroupHeaderProps {
  group: CalendarResourceGroup;
  resources: CalendarResource[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}
