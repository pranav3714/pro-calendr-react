import type { NowIndicatorProps } from "../interfaces/shared-component-props";

export function NowIndicator({ positionX }: NowIndicatorProps) {
  return (
    <div className="pro-calendr-react-now-line" style={{ left: positionX }}>
      <div className="pro-calendr-react-now-dot" />
    </div>
  );
}
