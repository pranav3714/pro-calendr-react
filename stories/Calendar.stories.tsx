import type { Meta, StoryObj } from "@storybook/react";
import { Calendar } from "@pro-calendr-react/core";
import { mockEvents, mockResources, mockResourceGroups } from "./helpers/mock-data";

const meta: Meta<typeof Calendar> = {
  title: "Components/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof Calendar>;

export const Default: Story = {
  args: {
    events: mockEvents,
    defaultView: "week",
  },
};

export const WithResources: Story = {
  args: {
    events: mockEvents,
    resources: mockResources,
    resourceGroups: mockResourceGroups,
    defaultView: "timeline-week",
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    skeletonCount: 8,
  },
};

export const Empty: Story = {
  args: {
    events: [],
    defaultView: "month",
  },
};
