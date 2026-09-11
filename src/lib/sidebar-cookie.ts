import { clientHasConsent } from "@/lib/cookies-client";

/** Persist the sidebar collapse preference (cookie with consent, else localStorage). */
export function setSidebarCookie(collapsed: boolean) {
  const value = collapsed ? "1" : "0";
  const hasPref = clientHasConsent("preferences");
  const maxAge = 60 * 60 * 24 * 365;
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  if (hasPref || !document.cookie.includes("cookie-consent=")) {
    // if no consent yet, allow (implicit essential UX); if rejected, use localStorage
    try {
      const raw = document.cookie.includes("cookie-consent=") ? document.cookie : "";
      const hasReject = raw.includes("preferences%22%3Afalse") || raw.includes('"preferences":false');
      if (hasReject) {
        localStorage.setItem("sidebar-collapsed", value);
        return;
      }
    } catch {}
    document.cookie = `sidebar-collapsed=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
  } else {
    try {
      localStorage.setItem("sidebar-collapsed", value);
    } catch {}
  }
}
