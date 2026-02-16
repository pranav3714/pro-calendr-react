export interface SelectionOverlayProps {
  selection: { startY: number; endY: number } | null;
}

export function SelectionOverlay({ selection }: SelectionOverlayProps) {
  if (!selection) return null;

  const top = Math.min(selection.startY, selection.endY);
  const height = Math.abs(selection.endY - selection.startY);

  return (
    <div
      className="pro-calendr-react-selection-overlay"
      style={{
        top,
        height,
        left: 0,
        right: 0,
      }}
    />
  );
}
