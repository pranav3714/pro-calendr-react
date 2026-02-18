import type { ResourceAvatarProps } from "../interfaces/shared-component-props";
import { cn } from "../utils/cn";

interface GetColorClassesParams {
  readonly groupId: string;
}

function getColorClasses({ groupId }: GetColorClassesParams): string {
  if (groupId === "aircraft") {
    return "bg-blue-100 text-blue-600";
  }
  if (groupId === "instructors") {
    return "bg-emerald-100 text-emerald-600";
  }
  if (groupId === "simulators") {
    return "bg-violet-100 text-violet-600";
  }
  return "bg-amber-100 text-amber-600";
}

interface GetInitialsParams {
  readonly groupId: string;
  readonly resourceName: string;
}

function getInitials({ groupId, resourceName }: GetInitialsParams): string {
  if (groupId === "aircraft") {
    return resourceName.slice(-3);
  }
  if (groupId === "instructors") {
    return resourceName
      .split(" ")
      .map((word) => word[0])
      .join("");
  }
  return resourceName.slice(0, 2).toUpperCase();
}

const SIZE_CLASSES: Record<string, string> = {
  sm: "w-6 h-6 rounded text-[9px]",
  md: "w-7 h-7 rounded-md text-[10px]",
};

export function ResourceAvatar({ groupId, resourceName, size = "md" }: ResourceAvatarProps) {
  return (
    <div
      className={cn(
        SIZE_CLASSES[size],
        "flex shrink-0 items-center justify-center font-bold",
        getColorClasses({ groupId }),
      )}
    >
      {getInitials({ groupId, resourceName })}
    </div>
  );
}
