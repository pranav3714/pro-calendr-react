export interface BuildGridBackgroundParams {
  readonly hourWidth: number;
  readonly hourLineColor?: string;
  readonly halfHourLineColor?: string;
}

export interface GridBackgroundResult {
  readonly backgroundImage: string;
  readonly backgroundSize: string;
}
