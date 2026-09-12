// SPDX-License-Identifier: GPL-3.0-only
"use client";

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

export function clientHasConsent(category: ConsentCategory): boolean {
  if (category === "essential") return true;
  if (typeof document === "undefined") return false;
  const raw = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`))
    ?.split("=")[1];
  if (!raw) return false;
  try {
    const decoded = decodeURIComponent(raw);
    const parsed = parseConsent(decoded);
    if (!parsed) return false;
    return parsed[category] === true;
  } catch {
    return false;
  }
}

export function clientSetConsent(state: ConsentState) {
  const value = encodeURIComponent(JSON.stringify(state));
  const maxAge = ONE_YEAR;
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
  document.cookie = `${CONSENT_PREFS_COOKIE}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
  try {
    localStorage.setItem("cookie-consent", JSON.stringify(state));
  } catch {}
}
