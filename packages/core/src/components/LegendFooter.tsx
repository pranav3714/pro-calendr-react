import type { LegendFooterProps } from "../interfaces/legend-footer-props";
import { cn } from "../utils/cn";

export function LegendFooter({ bookingTypes }: LegendFooterProps) {
  const typeEntries = Object.entries(bookingTypes);

  return (
    <div className="pro-calendr-react-legend flex items-center gap-3 overflow-x-auto border-t border-[var(--cal-border)] bg-[var(--cal-bg)] px-4 py-1.5">
      <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-[var(--cal-text-subtle)]">
        Legend
      </span>

      {typeEntries.map(([type, config]) => (
        <span key={type} className="flex shrink-0 items-center gap-1">
          <span className={cn("h-2 w-2 shrink-0 rounded-sm", config.dot)} />
          <span className="text-[10px] text-[var(--cal-text-muted)]">{config.label}</span>
        </span>
      ))}
    </div>
  );
}
