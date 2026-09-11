"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { Locale } from "@/i18n/get-dictionary";

/**
 * Persist the browser locale cookie; for authenticated users also sync it to
 * UserSettings so server-side push notifications can be localized per user.
 */
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
  // v2.7.0 — persist locale for push-notification localization (best effort)
  try {
    const { auth } = await import("@/auth");
    const session = await auth();
    if (session?.user?.id) {
      await (
        await import("@/lib/db")
      ).db.userSettings.upsert({
        where: { userId: session.user.id },
        update: { locale },
        create: { userId: session.user.id, locale },
      });
    }
  } catch {}
  revalidatePath("/");
}
