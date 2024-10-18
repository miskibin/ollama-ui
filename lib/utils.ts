import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { easterEggMapping } from "./easter-eggs";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function checkEasterEggs(input: string) {
  for (const egg of easterEggMapping) {
    if (egg.regex.test(input)) {
      return egg.photo;
    }
  }
  return null;
}
