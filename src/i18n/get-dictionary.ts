import { cookies } from "next/headers";
import en from "./dictionaries/en.json";
import tr from "./dictionaries/tr.json";

export const dictionaries = { en, tr };
export type Locale = keyof typeof dictionaries;
export const LOCALES: Locale[] = ["en", "tr"];

export async function getLocale(): Promise<Locale> {
  const cookieLocale = (await cookies()).get("locale")?.value;
  return cookieLocale && cookieLocale in dictionaries ? (cookieLocale as Locale) : "en";
}

export async function getDictionary() {
  return dictionaries[await getLocale()];
}
