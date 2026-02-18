export interface LayoutConfig {
  readonly hourWidth: number;
  readonly rowHeight: number;
  readonly sidebarWidth: number;
  readonly groupHeaderHeight: number;
  readonly timeHeaderHeight: number;
  readonly snapInterval: number;
  readonly dayStartHour: number;
  readonly dayEndHour: number;
  readonly dragThreshold: number;
  readonly resizeThreshold: number;
  readonly minDuration: number;
}
