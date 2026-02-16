// ── Types ────────────────────────────────────────────────────────────────────

export interface Resource {
  id: string;
  name: string;
  subLabel: string;
}

export interface ResourceGroup {
  id: string;
  label: string;
  resources: Resource[];
}

export interface BookingTypeStyle {
  label: string;
  dot: string;
  bg: string;
  border: string;
  text: string;
  sub: string;
  badge: string;
  ring: string;
  headerBg: string;
}

export interface Booking {
  id: string;
  resourceId: string;
  linkedResourceIds?: string[];
  type: string;
  title: string;
  student?: string;
  instructor?: string;
  aircraft?: string;
  startMinutes: number;
  endMinutes: number;
  status: "confirmed" | "pending";
  notes?: string;
}

export interface AnchorRect {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
}

// ── Resource Groups ──────────────────────────────────────────────────────────

export const RESOURCE_GROUPS: ResourceGroup[] = [
  {
    id: "aircraft",
    label: "Aircraft",
    resources: [
      { id: "cs-umh", name: "CS-UMH", subLabel: "Cessna 172S" },
      { id: "cs-umg", name: "CS-UMG", subLabel: "Piper PA-28" },
      { id: "cs-uml", name: "CS-UML", subLabel: "Cessna 152" },
      { id: "cs-umx", name: "CS-UMX", subLabel: "Diamond DA42" },
      { id: "cs-ump", name: "CS-UMP", subLabel: "Cessna 172R" },
      { id: "cs-umr", name: "CS-UMR", subLabel: "Piper PA-28R" },
    ],
  },
  {
    id: "instructors",
    label: "Instructors",
    resources: [
      { id: "inst-js", name: "José Silva", subLabel: "FI / IRI" },
      { id: "inst-ms", name: "Miguel Santos", subLabel: "FI / CRI" },
      { id: "inst-af", name: "Ana Ferreira", subLabel: "FI" },
      { id: "inst-pc", name: "Pedro Costa", subLabel: "FI / IRI / CRI" },
      { id: "inst-mo", name: "Maria Oliveira", subLabel: "FI" },
    ],
  },
  {
    id: "simulators",
    label: "Simulators",
    resources: [
      { id: "sim-fnpt2", name: "FNPT II", subLabel: "Multi-Engine" },
      { id: "sim-fnpt1", name: "FNPT I", subLabel: "Single-Engine" },
      { id: "sim-bitd", name: "BITD", subLabel: "Basic Instrument" },
    ],
  },
  {
    id: "rooms",
    label: "Rooms",
    resources: [
      { id: "room-br1", name: "Briefing Room 1", subLabel: "6 seats" },
      { id: "room-br2", name: "Briefing Room 2", subLabel: "4 seats" },
      { id: "room-ca", name: "Classroom A", subLabel: "20 seats" },
      { id: "room-cb", name: "Classroom B", subLabel: "12 seats" },
    ],
  },
];

// ── Booking Type Definitions ─────────────────────────────────────────────────

export const BOOKING_TYPES: Record<string, BookingTypeStyle> = {
  flight: {
    label: "Flight",
    dot: "bg-blue-500",
    bg: "bg-blue-50 hover:bg-blue-100/80",
    border: "border-l-blue-500",
    text: "text-blue-800",
    sub: "text-blue-600/70",
    badge: "bg-blue-100 text-blue-700",
    ring: "ring-blue-200",
    headerBg: "bg-blue-500",
  },
  ground: {
    label: "Ground School",
    dot: "bg-amber-500",
    bg: "bg-amber-50 hover:bg-amber-100/80",
    border: "border-l-amber-500",
    text: "text-amber-800",
    sub: "text-amber-600/70",
    badge: "bg-amber-100 text-amber-700",
    ring: "ring-amber-200",
    headerBg: "bg-amber-500",
  },
  simulator: {
    label: "Simulator",
    dot: "bg-violet-500",
    bg: "bg-violet-50 hover:bg-violet-100/80",
    border: "border-l-violet-500",
    text: "text-violet-800",
    sub: "text-violet-600/70",
    badge: "bg-violet-100 text-violet-700",
    ring: "ring-violet-200",
    headerBg: "bg-violet-500",
  },
  theory: {
    label: "Theory",
    dot: "bg-teal-500",
    bg: "bg-teal-50 hover:bg-teal-100/80",
    border: "border-l-teal-500",
    text: "text-teal-800",
    sub: "text-teal-600/70",
    badge: "bg-teal-100 text-teal-700",
    ring: "ring-teal-200",
    headerBg: "bg-teal-500",
  },
  exam: {
    label: "Exam",
    dot: "bg-rose-500",
    bg: "bg-rose-50 hover:bg-rose-100/80",
    border: "border-l-rose-500",
    text: "text-rose-800",
    sub: "text-rose-600/70",
    badge: "bg-rose-100 text-rose-700",
    ring: "ring-rose-200",
    headerBg: "bg-rose-500",
  },
  maintenance: {
    label: "Maintenance",
    dot: "bg-slate-500",
    bg: "bg-slate-100 hover:bg-slate-200/80",
    border: "border-l-slate-400",
    text: "text-slate-700",
    sub: "text-slate-500/70",
    badge: "bg-slate-200 text-slate-700",
    ring: "ring-slate-200",
    headerBg: "bg-slate-500",
  },
  briefing: {
    label: "Briefing",
    dot: "bg-indigo-500",
    bg: "bg-indigo-50 hover:bg-indigo-100/80",
    border: "border-l-indigo-500",
    text: "text-indigo-800",
    sub: "text-indigo-600/70",
    badge: "bg-indigo-100 text-indigo-700",
    ring: "ring-indigo-200",
    headerBg: "bg-indigo-500",
  },
};

// ── Layout Constants ─────────────────────────────────────────────────────────

export const DAY_START_HOUR = 0;
export const DAY_END_HOUR = 24;
export const HOUR_WIDTH = 128;
export const ROW_HEIGHT = 56;
export const SIDEBAR_WIDTH = 208;
export const GROUP_HEADER_HEIGHT = 36;
export const SNAP_INTERVAL = 15;

// ── Helper Config ────────────────────────────────────────────────────────────

export interface HelperConfig {
  dayStartHour: number;
  dayEndHour: number;
  hourWidth: number;
}

// ── Pure Helpers ─────────────────────────────────────────────────────────────

export const formatTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export const minutesToPosition = (
  minutes: number,
  config: Pick<HelperConfig, "dayStartHour" | "hourWidth"> = {
    dayStartHour: DAY_START_HOUR,
    hourWidth: HOUR_WIDTH,
  },
): number => ((minutes - config.dayStartHour * 60) / 60) * config.hourWidth;

export const positionToMinutes = (
  px: number,
  config: Pick<HelperConfig, "dayStartHour" | "hourWidth"> = {
    dayStartHour: DAY_START_HOUR,
    hourWidth: HOUR_WIDTH,
  },
): number => Math.round((px / config.hourWidth) * 60 + config.dayStartHour * 60);

export const snapToGrid = (minutes: number): number =>
  Math.round(minutes / SNAP_INTERVAL) * SNAP_INTERVAL;

export const clampMinutes = (
  minutes: number,
  config: Pick<HelperConfig, "dayStartHour" | "dayEndHour"> = {
    dayStartHour: DAY_START_HOUR,
    dayEndHour: DAY_END_HOUR,
  },
): number => Math.max(config.dayStartHour * 60, Math.min(config.dayEndHour * 60, minutes));

// ── Date Helpers ─────────────────────────────────────────────────────────────

export const isSameDay = (d1: Date, d2: Date): boolean =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

export const getWeekDays = (date: Date): Date[] => {
  const d = new Date(date);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const wd = new Date(monday);
    wd.setDate(monday.getDate() + i);
    return wd;
  });
};

export const getMonthDays = (date: Date): Date[] => {
  const d = new Date(date);
  const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const days: Date[] = [];
  const endPadding = 6 - ((lastDay.getDay() + 6) % 7);
  for (let i = -startOffset; i <= lastDay.getDate() - 1 + endPadding; i++) {
    days.push(new Date(d.getFullYear(), d.getMonth(), i + 1));
  }
  return days;
};

export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const formatDateFull = (date: Date): string => {
  const d = new Date(date);
  const day = WEEKDAY_LABELS[(d.getDay() + 6) % 7];
  return `${day}, ${String(d.getDate())} ${MONTH_NAMES[d.getMonth()]} ${String(d.getFullYear())}`;
};

// ── Seeded Random ────────────────────────────────────────────────────────────

const seededRandom = (seed: number) => {
  let s = seed;
  return (): number => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

const dateToSeed = (date: Date): number => {
  const d = new Date(date);
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
};

const pick = <T>(arr: readonly T[], rng: () => number): T => arr[Math.floor(rng() * arr.length)];

// ── Data Pools ───────────────────────────────────────────────────────────────

const STUDENTS = [
  "Nuno Rodrigues",
  "Sofia Mendes",
  "Tiago Almeida",
  "Maria Costa",
  "André Pereira",
  "Carolina Martins",
  "Hugo Fernandes",
  "Beatriz Santos",
  "Ricardo Lopes",
  "Inês Oliveira",
  "Daniel Ribeiro",
  "Mariana Sousa",
] as const;

const FLIGHT_TITLES = [
  "VFR Navigation",
  "Circuit Training",
  "Instrument Approach",
  "Cross-Country",
  "Solo Navigation",
  "Night Rating",
  "Emergency Procedures",
  "IFR Procedures",
  "ME Conversion",
  "Skills Test Prep",
  "Area Solo",
  "GF Training",
] as const;

const THEORY_SUBJECTS = [
  "Air Law",
  "Meteorology",
  "Navigation",
  "AGK",
  "Principles of Flight",
  "Performance",
  "Communications",
  "Human Factors",
] as const;

const GROUND_TITLES = [
  "Pre-flight Briefing",
  "Post-flight Debrief",
  "Nav Planning",
  "Weather Briefing",
  "Systems Review",
  "Performance Calc",
] as const;

const SIM_TITLES = [
  "IFR Procedures",
  "Emergency Drill",
  "ME Operations",
  "Night Circuits",
  "Instrument Scan",
  "Radio Nav",
] as const;

// ── Booking Generator ────────────────────────────────────────────────────────

export const generateBookingsForDate = (date: Date): Booking[] => {
  const d = new Date(date);
  const dayOfWeek = d.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const rng = seededRandom(dateToSeed(d));
  const bookings: Booking[] = [];
  let id = 1;

  const aircraft = RESOURCE_GROUPS[0].resources;
  const instructors = RESOURCE_GROUPS[1].resources;
  const sims = RESOURCE_GROUPS[2].resources;
  const rooms = RESOURCE_GROUPS[3].resources;

  const addBooking = (overrides: Omit<Booking, "id">) => {
    bookings.push({ id: `b-${String(dateToSeed(d))}-${String(id++)}`, ...overrides });
  };

  const usedSlots = new Map<string, { start: number; end: number }[]>();
  const isSlotFree = (resId: string, start: number, end: number): boolean => {
    const slots = usedSlots.get(resId) ?? [];
    return !slots.some((s) => start < s.end && end > s.start);
  };
  const markSlot = (resId: string, start: number, end: number) => {
    if (!usedSlots.has(resId)) usedSlots.set(resId, []);
    usedSlots.get(resId)?.push({ start, end });
  };

  // Fewer bookings on weekends
  const flightCount = isWeekend ? 3 : 6;
  const groundCount = isWeekend ? 1 : 3;
  const simCount = isWeekend ? 1 : 2;
  const theoryCount = isWeekend ? 0 : 2;
  const briefingCount = isWeekend ? 1 : 3;

  // Flight bookings
  for (let i = 0; i < flightCount; i++) {
    const ac = aircraft[i % aircraft.length];
    const inst = instructors[i % instructors.length];
    const startHour = 7 + Math.floor(rng() * 10);
    const startMin = rng() > 0.5 ? 0 : 30;
    const start = startHour * 60 + startMin;
    const duration = pick([60, 90, 120], rng);
    const end = Math.min(start + duration, DAY_END_HOUR * 60);
    if (isSlotFree(ac.id, start, end) && isSlotFree(inst.id, start, end)) {
      const student = pick(STUDENTS, rng);
      const title = pick(FLIGHT_TITLES, rng);
      const status = rng() > 0.3 ? ("confirmed" as const) : ("pending" as const);
      markSlot(ac.id, start, end);
      markSlot(inst.id, start, end);
      addBooking({
        resourceId: ac.id,
        linkedResourceIds: [inst.id],
        type: "flight",
        title,
        student,
        instructor: inst.name,
        aircraft: ac.name,
        startMinutes: start,
        endMinutes: end,
        status,
      });
      addBooking({
        resourceId: inst.id,
        linkedResourceIds: [ac.id],
        type: "flight",
        title,
        student,
        instructor: inst.name,
        aircraft: ac.name,
        startMinutes: start,
        endMinutes: end,
        status: rng() > 0.3 ? "confirmed" : "pending",
      });
    }
  }

  // Ground school
  for (let i = 0; i < groundCount; i++) {
    const room = rooms[i % 2];
    const inst = pick(instructors, rng);
    const startHour = 7 + Math.floor(rng() * 8);
    const start = startHour * 60;
    const end = start + pick([30, 45, 60], rng);
    if (isSlotFree(room.id, start, end)) {
      markSlot(room.id, start, end);
      addBooking({
        resourceId: room.id,
        type: "ground",
        title: pick(GROUND_TITLES, rng),
        student: pick(STUDENTS, rng),
        instructor: inst.name,
        startMinutes: start,
        endMinutes: Math.min(end, DAY_END_HOUR * 60),
        status: "confirmed",
      });
    }
  }

  // Briefings
  for (let i = 0; i < briefingCount; i++) {
    const room = rooms[i % 2];
    const inst = pick(instructors, rng);
    const startHour = 8 + Math.floor(rng() * 9);
    const start = startHour * 60 + (rng() > 0.5 ? 0 : 30);
    const end = start + pick([30, 45], rng);
    if (isSlotFree(room.id, start, end)) {
      markSlot(room.id, start, end);
      addBooking({
        resourceId: room.id,
        type: "briefing",
        title: pick(GROUND_TITLES, rng),
        student: pick(STUDENTS, rng),
        instructor: inst.name,
        startMinutes: start,
        endMinutes: Math.min(end, DAY_END_HOUR * 60),
        status: "confirmed",
      });
    }
  }

  // Simulator sessions
  for (let i = 0; i < simCount; i++) {
    const sim = sims[i % sims.length];
    const inst = pick(instructors, rng);
    const startHour = 8 + Math.floor(rng() * 8);
    const start = startHour * 60;
    const duration = pick([60, 90, 120], rng);
    const end = Math.min(start + duration, DAY_END_HOUR * 60);
    if (isSlotFree(sim.id, start, end)) {
      markSlot(sim.id, start, end);
      addBooking({
        resourceId: sim.id,
        type: "simulator",
        title: pick(SIM_TITLES, rng),
        student: pick(STUDENTS, rng),
        instructor: inst.name,
        startMinutes: start,
        endMinutes: end,
        status: rng() > 0.5 ? "confirmed" : "pending",
      });
    }
  }

  // Theory classes
  for (let i = 0; i < theoryCount; i++) {
    const room = rooms[2 + (i % 2)];
    const inst = pick(instructors, rng);
    const startHour = 9 + i * 3;
    const start = startHour * 60;
    const end = start + pick([90, 120], rng);
    if (isSlotFree(room.id, start, end)) {
      markSlot(room.id, start, end);
      addBooking({
        resourceId: room.id,
        type: "theory",
        title: pick(THEORY_SUBJECTS, rng),
        instructor: inst.name,
        startMinutes: start,
        endMinutes: Math.min(end, DAY_END_HOUR * 60),
        status: "confirmed",
        notes: `${String(Math.floor(rng() * 12 + 4))} students enrolled`,
      });
    }
  }

  // Occasional maintenance
  if (!isWeekend && rng() > 0.5) {
    const ac = pick(aircraft, rng);
    const start = 12 * 60;
    const end = 15 * 60;
    if (isSlotFree(ac.id, start, end)) {
      markSlot(ac.id, start, end);
      addBooking({
        resourceId: ac.id,
        type: "maintenance",
        title: pick(
          ["50h Inspection", "100h Inspection", "Annual Check", "Avionics Update", "Oil Change"],
          rng,
        ),
        startMinutes: start,
        endMinutes: end,
        status: "confirmed",
        notes: "Aircraft unavailable",
      });
    }
  }

  // Occasional exam
  if (!isWeekend && rng() > 0.4) {
    const room = rooms[2];
    const start = 14 * 60;
    const end = start + 120;
    if (isSlotFree(room.id, start, end)) {
      markSlot(room.id, start, end);
      addBooking({
        resourceId: room.id,
        type: "exam",
        title: pick(["Progress Test", "Skills Test", "Theory Exam", "Mock Exam"], rng),
        student: pick(STUDENTS, rng),
        startMinutes: start,
        endMinutes: end,
        status: "confirmed",
        notes: pick(["PPL Progress Test", "ATPL Theory - Air Law", "CPL Skills Test Prep"], rng),
      });
    }
  }

  return bookings;
};
