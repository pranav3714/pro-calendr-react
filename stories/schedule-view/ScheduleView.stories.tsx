import type { Meta, StoryObj } from "@storybook/react";
import ScheduleView from "./ScheduleView";

const meta: Meta<typeof ScheduleView> = {
  title: "Demo/ScheduleView",
  component: ScheduleView,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    dayStartHour: {
      control: { type: "range", min: 0, max: 12, step: 1 },
      description: "Start hour of the day timeline",
    },
    dayEndHour: {
      control: { type: "range", min: 12, max: 24, step: 1 },
      description: "End hour of the day timeline",
    },
  },
};

export default meta;

type Story = StoryObj<typeof ScheduleView>;

export const Default: Story = {
  args: {
    dayStartHour: 0,
    dayEndHour: 24,
  },
};

export const BusinessHours: Story = {
  args: {
    dayStartHour: 7,
    dayEndHour: 19,
  },
};
