import { cookies } from "next/headers";

export type Theme = "light" | "dark" | "high-contrast";

export const THEMES: Theme[] = ["light", "dark", "high-contrast"];

export async function getTheme(): Promise<Theme> {
  const cookieTheme = (await cookies()).get("theme")?.value;
  if (cookieTheme && THEMES.includes(cookieTheme as Theme)) {
    return cookieTheme as Theme;
  }
  return "light";
}
