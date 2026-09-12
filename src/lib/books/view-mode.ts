// SPDX-License-Identifier: GPL-3.0-only
import { clientHasConsent } from "@/lib/cookies-client";

export type ViewMode = "card" | "list";

export function getInitialView(): ViewMode {
  if (typeof document === "undefined") return "card";
  const cookie = document.cookie
    .split("; ")
    .find((c) => c.startsWith("view-mode="))
    ?.split("=")[1];
  if (cookie === "list" || cookie === "card") return cookie as ViewMode;
  try {
    const ls = localStorage.getItem("view-mode");
    if (ls === "list" || ls === "card") return ls as ViewMode;
  } catch {}
  return "card";
}

export function setViewCookie(mode: ViewMode) {
  const hasPref = clientHasConsent("preferences");
  const maxAge = 60 * 60 * 24 * 365;
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  if (hasPref || !document.cookie.includes("cookie-consent=")) {
    try {
      const raw = document.cookie.includes("cookie-consent=") ? document.cookie : "";
      const hasReject = raw.includes("preferences%22%3Afalse") || raw.includes('"preferences":false');
      if (hasReject) {
        localStorage.setItem("view-mode", mode);
        return;
      }
    } catch {}
    document.cookie = `view-mode=${mode}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
  } else {
    try {
      localStorage.setItem("view-mode", mode);
    } catch {}
  }
}
