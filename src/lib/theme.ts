import { cookies } from "next/headers";

export type Theme = "light" | "dark" | "light-contrast" | "dark-contrast" | "amoled";

export const THEMES: Theme[] = ["light", "dark", "light-contrast", "dark-contrast", "amoled"];

export async function getTheme(): Promise<Theme> {
  const cookieTheme = (await cookies()).get("theme")?.value;
  if (cookieTheme && THEMES.includes(cookieTheme as Theme)) {
    return cookieTheme as Theme;
  }
  return "light";
}
