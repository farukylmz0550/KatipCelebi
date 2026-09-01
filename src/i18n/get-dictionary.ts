import { cookies } from "next/headers";
import en from "./dictionaries/en.json";
import tr from "./dictionaries/tr.json";
import es from "./dictionaries/es.json";
import fr from "./dictionaries/fr.json";
import ru from "./dictionaries/ru.json";
import zh from "./dictionaries/zh.json";

export const dictionaries = { en, tr, es, fr, ru, zh };
export type Locale = keyof typeof dictionaries;
export const LOCALES: Locale[] = ["en", "tr", "es", "fr", "ru", "zh"];

export async function getLocale(): Promise<Locale> {
  const cookieLocale = (await cookies()).get("locale")?.value;
  return cookieLocale && cookieLocale in dictionaries ? (cookieLocale as Locale) : "en";
}

export async function getDictionary() {
  return dictionaries[await getLocale()];
}
