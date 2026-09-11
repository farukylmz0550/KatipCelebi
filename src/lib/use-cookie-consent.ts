"use client";

import { useCallback, useEffect, useState } from "react";
import { clientSetConsent, type ConsentState } from "@/lib/cookies-client";

export type ConsentView = "banner" | "preferences";

/**
 * Consent state + decision logic for the cookie banner. The component stays
 * purely presentational — visibility, the current view and the preference
 * toggles live here.
 */
export function useCookieConsent() {
  const [visible, setVisible] = useState(false);
  const [view, setView] = useState<ConsentView>("banner");
  const [preferences, setPreferences] = useState(true);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const has = document.cookie.includes("cookie-consent=");
    const local = (() => {
      try {
        return localStorage.getItem("cookie-consent");
      } catch {
        return null;
      }
    })();
    if (!has && !local) {
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const persist = useCallback((state: ConsentState) => {
    clientSetConsent(state);
    setVisible(false);
  }, []);

  const acceptAll = useCallback(() => {
    persist({ essential: true, preferences: true, analytics: false, timestamp: Date.now() });
  }, [persist]);

  const rejectAll = useCallback(() => {
    persist({ essential: true, preferences: false, analytics: false, timestamp: Date.now() });
  }, [persist]);

  const savePreferences = useCallback(() => {
    persist({ essential: true, preferences, analytics, timestamp: Date.now() });
  }, [persist, preferences, analytics]);

  const dismiss = useCallback(() => setVisible(false), []);

  return {
    visible,
    view,
    preferences,
    analytics,
    setView,
    setPreferences,
    setAnalytics,
    acceptAll,
    rejectAll,
    savePreferences,
    dismiss,
  };
}
