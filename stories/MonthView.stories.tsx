import { useState, useCallback, useMemo } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Booking } from "../packages/core/src/interfaces/booking";
import { ScheduleProvider } from "../packages/core/src/components/ScheduleProvider";
import { MonthView } from "../packages/core/src/views/month/MonthView";
import { BOOKING_TYPES } from "../packages/core/src/constants/booking-types";
import { getMonthDays } from "../packages/core/src/utils/date-helpers";
import { formatDateKey } from "../packages/core/src/utils/format-date-key";

function generateMonthBookings(): Booking[] {
  const today = new Date();
  const monthDays = getMonthDays({ date: today });
  const bookings: Booking[] = [];
  let nextId = 1;

  const types = ["flight", "ground", "simulator", "theory", "exam", "maintenance", "briefing"];
  const titles: Record<string, string[]> = {
    flight: ["VFR Navigation", "IFR Training", "Solo XC", "Night Flight", "Circuits"],
    ground: ["Air Law", "Human Factors", "Met Briefing"],
    simulator: ["IR Approaches", "GNSS Approaches", "Basic IF"],
    theory: ["Navigation Theory", "Performance", "Flight Planning"],
    exam: ["PPL Progress Check", "ATPL Theory Exam"],
    maintenance: ["100h Inspection", "Annual Check"],
    briefing: ["Morning Brief", "Pre-flight Brief", "Debrief"],
  };

  for (const day of monthDays) {
    const dateKey = formatDateKey({ date: day });
    const dayOfMonth = day.getDate();
    const bookingCount = (dayOfMonth % 5) + 1;

    for (let i = 0; i < bookingCount; i++) {
      const typeIndex = (dayOfMonth + i) % types.length;
      const type = types[typeIndex];
      const typeTitles = titles[type];
      const title = typeTitles[(dayOfMonth + i) % typeTitles.length];

      bookings.push({
        id: `mb-${String(nextId++)}`,
        resourceId: `r-${String(i)}`,
        date: dateKey,
        type,
        title,
        startMinutes: 480 + i * 120,
        endMinutes: 540 + i * 120,
        status: i === 0 ? "pending" : "confirmed",
      });
    }
  }

  return bookings;
}

function InteractiveMonthView() {
  const initialBookings = useMemo(() => generateMonthBookings(), []);
  const [log, setLog] = useState<string[]>([]);
  const today = useMemo(() => new Date(), []);

  const addLog = useCallback((message: string) => {
    setLog((prev) => [message, ...prev].slice(0, 20));
  }, []);

  const handleDayClick = useCallback(
    ({ date }: { readonly date: Date }) => {
      addLog(`Day clicked: ${date.toLocaleDateString()}`);
    },
    [addLog],
  );

  return (
    <div className="pro-calendr-react flex h-screen flex-col">
      <div className="flex flex-1 flex-col overflow-hidden">
        <ScheduleProvider defaultViewMode="month">
          <MonthView
            bookings={initialBookings}
            bookingTypes={BOOKING_TYPES}
            currentDate={today}
            onDayClick={handleDayClick}
          />
        </ScheduleProvider>
      </div>

      <div className="h-32 shrink-0 overflow-auto border-t border-gray-200 bg-gray-50 p-3">
        <div className="mb-1 text-xs font-semibold text-gray-500">Event Log</div>
        {log.length === 0 && (
          <div className="text-xs text-gray-400">Click a day cell to navigate</div>
        )}
        {log.map((entry, i) => (
          <div key={`${entry}-${String(i)}`} className="font-mono text-xs text-gray-600">
            {entry}
          </div>
        ))}
      </div>
    </div>
  );
}

const meta: Meta<typeof InteractiveMonthView> = {
  title: "MonthView/Interactive",
  component: InteractiveMonthView,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof InteractiveMonthView>;

export const Default: Story = {};
