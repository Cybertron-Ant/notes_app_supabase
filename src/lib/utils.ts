import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useTheme as useNextTheme } from "next-themes";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const useTheme = () => {
  const theme = useNextTheme();
  return theme;
};
