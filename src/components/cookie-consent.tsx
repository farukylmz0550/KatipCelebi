"use client";

import { useEffect, useState } from "react";
import { Cookie, Shield, BarChart3, Settings, X } from "lucide-react";
import { clientSetConsent, type ConsentState } from "@/lib/cookies-client";

type View = "banner" | "preferences";

type CookieDict = {
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

export function CookieConsent({ dict }: { dict?: CookieDict }) {
  const t: CookieDict = dict ?? {
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
    reject: "Reddet",
    preferencesBtn: "Tercihler",
    save: "Kaydet",
    back: "Geri",
    close: "Kapat",
    licensesLink: "See Licenses page for details.",
  };
  const [visible, setVisible] = useState(false);
  const [view, setView] = useState<View>("banner");
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

  function acceptAll() {
    const state: ConsentState = { essential: true, preferences: true, analytics: false, timestamp: Date.now() };
    clientSetConsent(state);
    setVisible(false);
  }

  function rejectAll() {
    const state: ConsentState = { essential: true, preferences: false, analytics: false, timestamp: Date.now() };
    clientSetConsent(state);
    setVisible(false);
  }

  function savePreferences() {
    const state: ConsentState = { essential: true, preferences, analytics, timestamp: Date.now() };
    clientSetConsent(state);
    setVisible(false);
  }

  if (!visible) return null;

  const cardBase = "paper-surface border border-[var(--border)] bg-[var(--surface-elevated)] shadow-lg rounded-[12px]";

  return (
    <>
      {/* Desktop: centered modal with overlay */}
      <div className="fixed inset-0 z-[100] hidden md:flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
        <div className={`${cardBase} w-full max-w-[520px] overflow-hidden`}>
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Cookie size={18} />
                </div>
                <div>
                  <h2 className="font-[var(--font-serif)] text-[16px] font-semibold text-foreground">{t.title}</h2>
                  <p className="font-[var(--font-sans)] text-xs text-muted-foreground">{t.subtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setVisible(false)}
                className="rounded-[8px] p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                aria-label={t.close}
              >
                <X size={16} />
              </button>
            </div>

            {view === "banner" ? (
              <>
                <p className="mt-4 font-[var(--font-sans)] text-sm leading-relaxed text-foreground">{t.desc}</p>
                <p className="mt-2 font-[var(--font-sans)] text-xs leading-relaxed text-muted-foreground">
                  {t.descMuted}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    onClick={acceptAll}
                    className="rounded-[8px] bg-[var(--accent)] px-5 py-2.5 font-[var(--font-sans)] text-sm font-medium text-white hover:bg-[var(--accent-hover)] active:bg-[var(--accent-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  >
                    {t.accept}
                  </button>
                  <button
                    onClick={rejectAll}
                    className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 font-[var(--font-sans)] text-sm font-medium text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  >
                    {t.reject}
                  </button>
                  <button
                    onClick={() => setView("preferences")}
                    className="rounded-[8px] border border-[var(--border)] bg-transparent px-5 py-2.5 font-[var(--font-sans)] text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  >
                    {t.preferencesBtn}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mt-4 space-y-3">
                  <PrefRow
                    icon={<Shield size={16} />}
                    title={t.essentialTitle}
                    desc={t.essentialDesc}
                    checked
                    disabled
                  />
                  <PrefRow
                    icon={<Settings size={16} />}
                    title={t.preferencesTitle}
                    desc={t.preferencesDesc}
                    checked={preferences}
                    onChange={setPreferences}
                  />
                  <PrefRow
                    icon={<BarChart3 size={16} />}
                    title={t.analyticsTitle}
                    desc={t.analyticsDesc}
                    checked={analytics}
                    onChange={setAnalytics}
                  />
                </div>
                <div className="mt-6 flex gap-2">
                  <button
                    onClick={savePreferences}
                    className="rounded-[8px] bg-[var(--accent)] px-5 py-2.5 font-[var(--font-sans)] text-sm font-medium text-white hover:bg-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  >
                    {t.save}
                  </button>
                  <button
                    onClick={() => setView("banner")}
                    className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 font-[var(--font-sans)] text-sm text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  >
                    {t.back}
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="border-t border-[var(--border)] bg-[var(--surface)] px-6 py-3">
            <p className="font-[var(--font-sans)] text-[11px] text-muted-foreground">
              {t.licensesLink}{" "}
              <a href="/licenses" className="underline hover:text-foreground">
                Lisanslar
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Mobile: bottom banner, safe-area respected */}
      <div className="fixed inset-x-0 bottom-0 z-[100] md:hidden p-3 safe-bottom">
        <div className={`${cardBase} mx-auto max-w-[640px] overflow-hidden`}>
          {view === "banner" ? (
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Cookie size={16} />
                </div>
                <div className="flex-1">
                  <h2 className="font-[var(--font-serif)] text-sm font-semibold text-foreground">{t.title}</h2>
                  <p className="mt-1 font-[var(--font-sans)] text-xs leading-relaxed text-muted-foreground line-clamp-3">
                    {t.mobileDesc}
                  </p>
                </div>
                <button
                  onClick={() => setVisible(false)}
                  className="rounded-[8px] p-1 text-muted-foreground hover:bg-accent"
                  aria-label={t.close}
                >
                  <X size={14} />
                </button>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={acceptAll}
                  className="flex-1 rounded-[8px] bg-[var(--accent)] px-3 py-2.5 font-[var(--font-sans)] text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
                >
                  {t.accept}
                </button>
                <button
                  onClick={rejectAll}
                  className="flex-1 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 font-[var(--font-sans)] text-sm font-medium text-foreground"
                >
                  {t.reject}
                </button>
                <button
                  onClick={() => setView("preferences")}
                  className="rounded-[8px] border border-[var(--border)] px-3 py-2.5 font-[var(--font-sans)] text-xs text-muted-foreground"
                >
                  {t.preferencesBtn}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-[var(--font-sans)] text-sm font-semibold text-foreground">{t.preferencesTitle}</h3>
                <button onClick={() => setView("banner")} className="text-xs text-muted-foreground underline">
                  {t.back}
                </button>
              </div>
              <div className="mt-3 space-y-2">
                <PrefRow icon={<Shield size={14} />} title={t.essentialTitle} desc={t.essentialDesc} checked disabled />
                <PrefRow
                  icon={<Settings size={14} />}
                  title={t.preferencesTitle}
                  desc={t.preferencesDesc}
                  checked={preferences}
                  onChange={setPreferences}
                />
                <PrefRow
                  icon={<BarChart3 size={14} />}
                  title={t.analyticsTitle}
                  desc={t.analyticsDesc}
                  checked={analytics}
                  onChange={setAnalytics}
                />
              </div>
              <button
                onClick={savePreferences}
                className="mt-4 w-full rounded-[8px] bg-[var(--accent)] py-2.5 font-[var(--font-sans)] text-sm font-medium text-white"
              >
                {t.save}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function PrefRow({
  icon,
  title,
  desc,
  checked,
  onChange,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  checked: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <div className="text-muted-foreground">{icon}</div>
        <div>
          <p className="font-[var(--font-sans)] text-sm font-medium text-foreground">{title}</p>
          <p className="font-[var(--font-sans)] text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          className="sr-only peer"
        />
        <div
          className={`h-5 w-9 rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--ring)] ${
            checked ? "bg-[var(--accent)]" : "bg-[var(--border)]"
          } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <div
            className={`h-4 w-4 translate-y-0.5 rounded-full bg-background shadow-sm transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`}
          />
        </div>
      </label>
    </div>
  );
}
