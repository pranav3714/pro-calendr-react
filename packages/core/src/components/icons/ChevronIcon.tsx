import type { ChevronIconProps } from "../../interfaces/shared-component-props";
import { cn } from "../../utils/cn";

function getRotationClass({ isOpen }: ChevronIconProps): string {
  if (isOpen) {
    return "rotate-0";
  }
  return "-rotate-90";
}

export function ChevronIcon({ isOpen }: ChevronIconProps) {
  return (
    <svg
      className={cn("h-4 w-4 transition-transform duration-200", getRotationClass({ isOpen }))}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
