import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScheduleCalendar } from "../packages/core/src/ScheduleCalendar";

const meta: Meta<typeof ScheduleCalendar> = {
  title: "ScheduleCalendar",
  component: ScheduleCalendar,
};

export default meta;

type Story = StoryObj<typeof ScheduleCalendar>;

export const Default: Story = {
  args: {
    bookings: [],
    resourceGroups: [],
  },
};
