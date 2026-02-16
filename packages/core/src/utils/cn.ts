/**
 * Merge CSS class names, filtering out falsy values.
 * Simple utility -- no external dependency needed.
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
