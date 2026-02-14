export function snapToGrid(position: number, gridSize: number): number {
  return Math.round(position / gridSize) * gridSize;
}
