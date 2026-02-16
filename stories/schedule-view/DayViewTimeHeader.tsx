import React from "react";
import { SIDEBAR_WIDTH, HOUR_WIDTH } from "./scheduleData";

// ── Props ────────────────────────────────────────────────────────────────────

interface DayViewTimeHeaderProps {
  hours: number[];
  timelineWidth: number;
  dayStartHour: number;
  dayEndHour: number;
}

// ── Component ────────────────────────────────────────────────────────────────

const DayViewTimeHeader: React.FC<DayViewTimeHeaderProps> = React.memo(function DayViewTimeHeader({
  hours,
  timelineWidth,
  dayStartHour,
  dayEndHour,
}) {
  return (
    <div className="sticky top-0 z-20 flex" style={{ height: 40 }}>
      {/* Left corner label */}
      <div
        className="sticky left-0 z-30 flex shrink-0 items-end border-b border-r border-gray-200 bg-white px-3 pb-1.5"
        style={{ width: SIDEBAR_WIDTH }}
      >
        <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
          Resources
        </span>
      </div>

      {/* Time ruler area */}
      <div className="relative border-b border-gray-200 bg-white" style={{ width: timelineWidth }}>
        {hours.map((h) => {
          const x = (h - dayStartHour) * HOUR_WIDTH;
          const isLast = h === dayEndHour - 1;

          return (
            <div key={h} className="absolute bottom-0 top-0" style={{ left: x }}>
              {/* Hour label */}
              <span className="absolute bottom-1.5 left-2 text-[11px] font-medium tabular-nums text-gray-500">
                {String(h).padStart(2, "0")}:00
              </span>

              {/* Hour tick */}
              <div
                className="absolute bottom-0 left-0 bg-gray-300"
                style={{ width: 1, height: 2 }}
              />

              {/* Half-hour tick */}
              {!isLast && (
                <div
                  className="absolute bottom-0 bg-gray-200"
                  style={{ left: HOUR_WIDTH / 2, width: 1, height: 1.5 }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default DayViewTimeHeader;
