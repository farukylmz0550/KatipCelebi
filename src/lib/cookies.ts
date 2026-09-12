// SPDX-License-Identifier: GPL-3.0-only
import { cookies } from "next/headers";
import {
  CONSENT_COOKIE,
  CONSENT_PREFS_COOKIE,
  ONE_YEAR,
  parseConsent,
  type ConsentCategory,
  type ConsentState,
} from "./cookies-shared";

export {
  type ConsentCategory,
  type ConsentState,
  CONSENT_COOKIE,
  CONSENT_PREFS_COOKIE,
  parseConsent,
} from "./cookies-shared";

export async function getConsent(): Promise<ConsentState | null> {
  const raw = (await cookies()).get(CONSENT_COOKIE)?.value;
  return parseConsent(raw);
}

export async function hasConsent(category: ConsentCategory): Promise<boolean> {
  if (category === "essential") return true;
  const consent = await getConsent();
  if (!consent) return false;
  return consent[category] === true;
}

export async function setConsentCookie(state: ConsentState) {
  const value = JSON.stringify(state);
  const opts = {
    maxAge: ONE_YEAR,
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
  (await cookies()).set(CONSENT_COOKIE, value, opts);
  (await cookies()).set(CONSENT_PREFS_COOKIE, value, opts);
}
