import type React from "react";
import type { GroupIconProps } from "../../interfaces/shared-component-props";

function AircraftIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
      <path d="M6.428 1.151C6.708.591 7.213 0 8 0s1.292.592 1.572 1.151l.162.318c.1.196.2.41.267.544a4 4 0 0 0 .45.674l3.725 4.478a.5.5 0 0 1-.044.682l-.535.535a.5.5 0 0 1-.575.1L9.64 6.67a.5.5 0 0 0-.658.26L8.5 8.083l2.9 4.348a.5.5 0 0 1-.076.612l-.535.535a.5.5 0 0 1-.584.1L6.5 11.8l-.5 2.7a.5.5 0 0 1-.4.4l-.7.1a.5.5 0 0 1-.556-.378L3.5 11.5l-1-.5a.5.5 0 0 1-.1-.584l1.878-3.705a.5.5 0 0 1 .26-.658L6.67 5.64a.5.5 0 0 0 .1-.575L5.233 1.69c-.1-.196-.2-.41-.267-.544a4 4 0 0 0-.45-.674l-.162-.318z" />
    </svg>
  );
}

function InstructorsIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

function SimulatorsIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function RoomsIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  );
}

const ICON_MAP: Partial<Record<string, () => React.JSX.Element>> = {
  aircraft: AircraftIcon,
  instructors: InstructorsIcon,
  simulators: SimulatorsIcon,
  rooms: RoomsIcon,
};

export function GroupIcon({ groupId }: GroupIconProps) {
  const IconComponent = ICON_MAP[groupId];

  if (!IconComponent) {
    return null;
  }

  return <IconComponent />;
}
