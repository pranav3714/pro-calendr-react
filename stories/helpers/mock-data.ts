import type {
  CalendarEvent,
  CalendarResource,
  CalendarResourceGroup,
} from "@pro-calendr-react/core";

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth();
const day = today.getDate();

function dateAt(dayOffset: number, hour: number, minute = 0): string {
  return new Date(year, month, day + dayOffset, hour, minute).toISOString();
}

export const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Team Standup",
    start: dateAt(0, 9, 0),
    end: dateAt(0, 9, 30),
    backgroundColor: "#3b82f6",
    textColor: "#ffffff",
  },
  {
    id: "2",
    title: "Design Review",
    start: dateAt(0, 10, 0),
    end: dateAt(0, 11, 30),
    backgroundColor: "#8b5cf6",
    textColor: "#ffffff",
    resourceIds: ["r1"],
  },
  {
    id: "3",
    title: "Lunch Break",
    start: dateAt(0, 12, 0),
    end: dateAt(0, 13, 0),
    backgroundColor: "#10b981",
    textColor: "#ffffff",
    display: "background",
  },
  {
    id: "4",
    title: "Sprint Planning",
    start: dateAt(1, 14, 0),
    end: dateAt(1, 15, 30),
    backgroundColor: "#f59e0b",
    textColor: "#000000",
    resourceIds: ["r1", "r2"],
  },
  {
    id: "5",
    title: "Code Review",
    start: dateAt(1, 10, 0),
    end: dateAt(1, 11, 0),
    backgroundColor: "#ef4444",
    textColor: "#ffffff",
    resourceIds: ["r2"],
  },
  {
    id: "6",
    title: "Client Call",
    start: dateAt(2, 15, 0),
    end: dateAt(2, 16, 0),
    backgroundColor: "#06b6d4",
    textColor: "#ffffff",
    resourceIds: ["r3"],
  },
  {
    id: "7",
    title: "Workshop",
    start: dateAt(-1, 9, 0),
    end: dateAt(-1, 17, 0),
    backgroundColor: "#ec4899",
    textColor: "#ffffff",
    allDay: true,
  },
];

export const mockResources: CalendarResource[] = [
  { id: "r1", title: "Room A", groupId: "g1", order: 1 },
  { id: "r2", title: "Room B", groupId: "g1", order: 2 },
  { id: "r3", title: "Room C", groupId: "g1", order: 3 },
  { id: "r4", title: "Alice Johnson", groupId: "g2", order: 1 },
  { id: "r5", title: "Bob Smith", groupId: "g2", order: 2 },
  { id: "r6", title: "Carol Williams", groupId: "g2", order: 3 },
];

export const mockResourceGroups: CalendarResourceGroup[] = [
  { id: "g1", title: "Rooms", order: 1 },
  { id: "g2", title: "People", order: 2 },
];
