"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { Locale } from "@/i18n/get-dictionary";

export async function setLocale(locale: Locale) {
  (await cookies()).set("locale", locale, {
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  revalidatePath("/");
}
