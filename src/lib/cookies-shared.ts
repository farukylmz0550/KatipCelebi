// SPDX-License-Identifier: GPL-3.0-only
export type ConsentCategory = "essential" | "preferences" | "analytics";

export type ConsentState = {
  essential: true;
  preferences: boolean;
  analytics: boolean;
  timestamp: number;
};

export const CONSENT_COOKIE = "cookie-consent";
export const CONSENT_PREFS_COOKIE = "cookie-consent-prefs";

export const ONE_YEAR = 60 * 60 * 24 * 365;

export function parseConsent(value: string | undefined): ConsentState | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<ConsentState>;
    if (typeof parsed.preferences !== "boolean") return null;
    if (typeof parsed.analytics !== "boolean") return null;
    return {
      essential: true,
      preferences: parsed.preferences,
      analytics: parsed.analytics,
      timestamp: typeof parsed.timestamp === "number" ? parsed.timestamp : Date.now(),
    };
  } catch {
    if (value === "accepted") return { essential: true, preferences: true, analytics: false, timestamp: Date.now() };
    if (value === "rejected") return { essential: true, preferences: false, analytics: false, timestamp: Date.now() };
    return null;
  }
}
