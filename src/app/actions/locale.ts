"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { Locale } from "@/i18n/get-dictionary";

export async function setLocale(locale: Locale) {
  const raw = (await cookies()).get("cookie-consent")?.value;
  if (raw) {
    const parsed = (() => {
      try {
        return JSON.parse(raw) as { preferences?: boolean };
      } catch {
        return null;
      }
    })();
    if (parsed && parsed.preferences === false) {
      revalidatePath("/");
      return;
    }
  }
  (await cookies()).set("locale", locale, {
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  revalidatePath("/");
}
