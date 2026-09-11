"use client";

import { useCookieConsent } from "@/lib/use-cookie-consent";
import { CookieConsentDesktop } from "@/components/cookie-consent-desktop";
import { CookieConsentMobile } from "@/components/cookie-consent-mobile";

export type CookieDict = {
  title: string;
  subtitle: string;
  desc: string;
  descMuted: string;
  mobileDesc: string;
  essentialTitle: string;
  essentialDesc: string;
  preferencesTitle: string;
  preferencesDesc: string;
  analyticsTitle: string;
  analyticsDesc: string;
  accept: string;
  reject: string;
  preferencesBtn: string;
  save: string;
  back: string;
  close: string;
  licensesLink: string;
};

const FALLBACK: CookieDict = {
  title: "Cookies",
  subtitle: "For your personal library",
  desc: "Book Shelf uses cookies to personalize your experience — to remember preferences like theme, language, sidebar state and view mode. Essential cookies are required for session security.",
  descMuted:
    "If you reject preference cookies, preferences are stored only on this device and not persisted across sessions.",
  mobileDesc: "We use cookies to remember preferences (theme, language, sidebar). Legally we need your consent.",
  essentialTitle: "Essential",
  essentialDesc: "Session, security, login. Cannot be disabled.",
  preferencesTitle: "Preferences",
  preferencesDesc: "Theme, language, sidebar, card/list view.",
  analyticsTitle: "Analytics",
  analyticsDesc: "Anonymous usage statistics (currently inactive).",
  accept: "Accept",
  reject: "Reject",
  preferencesBtn: "Preferences",
  save: "Save",
  back: "Back",
  close: "Close",
  licensesLink: "See Licenses page for details.",
};

export function CookieConsent({ dict }: { dict?: CookieDict }) {
  const t: CookieDict = dict ?? FALLBACK;
  const consent = useCookieConsent();

  if (!consent.visible) return null;

  return (
    <>
      {/* Desktop: centered modal with overlay */}
      <CookieConsentDesktop t={t} consent={consent} />
      {/* Mobile: bottom banner, safe-area respected */}
      <CookieConsentMobile t={t} consent={consent} />
    </>
  );
}
