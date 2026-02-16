export interface DropIndicatorProps {
  top: number;
  height: number;
  isValid: boolean;
}

export function DropIndicator({ top, height, isValid }: DropIndicatorProps) {
  const validityClass = isValid
    ? "pro-calendr-react-drop-indicator--valid"
    : "pro-calendr-react-drop-indicator--invalid";

  return (
    <div
      className={`pro-calendr-react-drop-indicator ${validityClass}`}
      style={{
        top,
        height,
        left: 0,
        right: 0,
      }}
    />
  );
}
