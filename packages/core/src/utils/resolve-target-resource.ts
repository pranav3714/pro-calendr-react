import type { RowData } from "../interfaces/row-data";

interface ResolveTargetResourceParams {
  readonly relativeY: number;
  readonly rows: readonly RowData[];
}

interface ResolveTargetResourceResult {
  readonly resourceId: string;
  readonly rowY: number;
  readonly rowHeight: number;
}

export function resolveTargetResource({
  relativeY,
  rows,
}: ResolveTargetResourceParams): ResolveTargetResourceResult | null {
  if (rows.length === 0) {
    return null;
  }

  for (const row of rows) {
    if (relativeY >= row.y && relativeY < row.y + row.rowHeight) {
      return {
        resourceId: row.resource.id,
        rowY: row.y,
        rowHeight: row.rowHeight,
      };
    }
  }

  return null;
}
