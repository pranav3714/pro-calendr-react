import { useRef, useState, useEffect, useCallback, type RefObject } from "react";
import { KEYS } from "../constants/keys";

export interface GridPosition {
  row: number;
  col: number;
}

export interface UseRovingGridOptions {
  rows: number;
  cols: number;
  gridRef: RefObject<HTMLElement | null>;
  onCellActivate?: (pos: GridPosition) => void;
  onCellFocus?: (pos: GridPosition) => void;
  disabled?: boolean;
  initialPosition?: GridPosition;
}

export interface UseRovingGridReturn {
  focusedCell: GridPosition;
  setFocusedCell: (pos: GridPosition) => void;
  getTabIndex: (row: number, col: number) => 0 | -1;
  getCellProps: (
    row: number,
    col: number,
  ) => {
    tabIndex: 0 | -1;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onFocus: () => void;
    "data-grid-row": number;
    "data-grid-col": number;
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function useRovingGrid(options: UseRovingGridOptions): UseRovingGridReturn {
  const {
    rows,
    cols,
    gridRef,
    onCellActivate,
    onCellFocus,
    disabled = false,
    initialPosition,
  } = options;

  // Use ref for immediate keyboard response (no re-render lag on arrow press)
  const positionRef = useRef<GridPosition>(initialPosition ?? { row: 0, col: 0 });

  // Counter to force re-render when position changes so getTabIndex returns correct values
  const [, setRenderTick] = useState(0);

  // Track whether we need to move DOM focus after a position change
  const pendingFocusRef = useRef(false);

  // Sync initialPosition changes
  const initRow = initialPosition?.row;
  const initCol = initialPosition?.col;
  useEffect(() => {
    if (initRow != null && initCol != null) {
      const clamped: GridPosition = {
        row: clamp(initRow, 0, Math.max(0, rows - 1)),
        col: clamp(initCol, 0, Math.max(0, cols - 1)),
      };
      positionRef.current = clamped;
      setRenderTick((t) => t + 1);
    }
  }, [initRow, initCol, rows, cols]);

  // Move DOM focus to the currently focused cell when position changes
  useEffect(() => {
    if (!pendingFocusRef.current) return;
    pendingFocusRef.current = false;

    const grid = gridRef.current;
    if (!grid) return;

    const { row, col } = positionRef.current;
    const cell = grid.querySelector<HTMLElement>(
      `[data-grid-row="${String(row)}"][data-grid-col="${String(col)}"]`,
    );
    if (cell && cell !== document.activeElement) {
      cell.focus();
    }
  });

  const moveTo = useCallback(
    (nextRow: number, nextCol: number) => {
      const clampedRow = clamp(nextRow, 0, Math.max(0, rows - 1));
      const clampedCol = clamp(nextCol, 0, Math.max(0, cols - 1));

      const prev = positionRef.current;
      if (prev.row === clampedRow && prev.col === clampedCol) return;

      const next: GridPosition = { row: clampedRow, col: clampedCol };
      positionRef.current = next;
      pendingFocusRef.current = true;
      setRenderTick((t) => t + 1);

      onCellFocus?.(next);
    },
    [rows, cols, onCellFocus],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      const { row, col } = positionRef.current;
      let handled = true;

      switch (e.key) {
        case KEYS.UP:
          moveTo(row - 1, col);
          break;
        case KEYS.DOWN:
          moveTo(row + 1, col);
          break;
        case KEYS.PREV: // ArrowLeft
          moveTo(row, col - 1);
          break;
        case KEYS.NEXT: // ArrowRight
          moveTo(row, col + 1);
          break;
        case KEYS.HOME:
          if (e.ctrlKey || e.metaKey) {
            moveTo(0, 0);
          } else {
            moveTo(row, 0);
          }
          break;
        case KEYS.END:
          if (e.ctrlKey || e.metaKey) {
            moveTo(rows - 1, cols - 1);
          } else {
            moveTo(row, cols - 1);
          }
          break;
        case KEYS.ENTER:
        case KEYS.SPACE:
          onCellActivate?.(positionRef.current);
          break;
        default:
          handled = false;
          break;
      }

      if (handled) {
        e.preventDefault();
      }
    },
    [disabled, moveTo, rows, cols, onCellActivate],
  );

  const setFocusedCell = useCallback(
    (pos: GridPosition) => {
      const clampedRow = clamp(pos.row, 0, Math.max(0, rows - 1));
      const clampedCol = clamp(pos.col, 0, Math.max(0, cols - 1));

      positionRef.current = { row: clampedRow, col: clampedCol };
      pendingFocusRef.current = true;
      setRenderTick((t) => t + 1);

      onCellFocus?.({ row: clampedRow, col: clampedCol });
    },
    [rows, cols, onCellFocus],
  );

  // Read position from ref (render tick ensures fresh reads)
  const currentRow = positionRef.current.row;
  const currentCol = positionRef.current.col;

  const getTabIndex = useCallback(
    (row: number, col: number): 0 | -1 => {
      return currentRow === row && currentCol === col ? 0 : -1;
    },
    [currentRow, currentCol],
  );

  const handleFocus = useCallback(
    (row: number, col: number) => {
      const prev = positionRef.current;
      if (prev.row !== row || prev.col !== col) {
        positionRef.current = { row, col };
        setRenderTick((t) => t + 1);
        onCellFocus?.({ row, col });
      }
    },
    [onCellFocus],
  );

  const getCellProps = useCallback(
    (row: number, col: number) => ({
      tabIndex: getTabIndex(row, col),
      onKeyDown: handleKeyDown,
      onFocus: () => {
        handleFocus(row, col);
      },
      "data-grid-row": row,
      "data-grid-col": col,
    }),
    [getTabIndex, handleKeyDown, handleFocus],
  );

  return {
    focusedCell: positionRef.current,
    setFocusedCell,
    getTabIndex,
    getCellProps,
  };
}
