import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names. Used to add/override state classes and for conditional
 * variants — NOT for building styles out of raw utilities in components.
 * Style rules live in src/styles/globals.css.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
