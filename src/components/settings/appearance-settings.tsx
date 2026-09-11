"use client";

import { useTransition } from "react";
import { Sun, Moon, Globe } from "lucide-react";
import { setTheme } from "@/app/actions/theme";
import { setLocale } from "@/app/actions/locale";
import type { Theme } from "@/lib/theme";
import type { Locale } from "@/i18n/get-dictionary";

const THEMES: { value: Theme; label: string; Icon: React.ElementType }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
];

const LOCALES: { value: Locale; label: string }[] = [
  { value: "en", label: "English" },
  { value: "tr", label: "Türkçe" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "ru", label: "Русский" },
  { value: "zh", label: "中文" },
];

export function AppearanceSettings({ currentTheme, currentLocale }: { currentTheme: Theme; currentLocale: Locale }) {
  const [isPending, startTransition] = useTransition();

  function handleThemeChange(value: Theme) {
    startTransition(() => {
      setTheme(value);
    });
  }

  function handleLocaleChange(value: Locale) {
    startTransition(() => {
      setLocale(value);
    });
  }

  return (
    <>
      {/* Theme — only here, not in sidebar/header */}
      <section>
        <h2 className="mb-2 px-1 font-[var(--font-sans)] text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Theme
        </h2>
        <div className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          {THEMES.map((t) => {
            const Icon = t.Icon;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => handleThemeChange(t.value)}
                disabled={isPending}
                className="flex w-full items-center justify-between border-b border-[var(--border)] last:border-b-0 px-4 py-3 text-left hover:bg-[var(--surface-elevated)] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} className="text-muted-foreground" />
                  <span className="font-[var(--font-sans)] text-sm text-foreground">{t.label}</span>
                </div>
                {currentTheme === t.value && <div className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* Language — only here */}
      <section>
        <h2 className="mb-2 px-1 font-[var(--font-sans)] text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Language
        </h2>
        <div className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          {LOCALES.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => handleLocaleChange(l.value)}
              disabled={isPending}
              className="flex w-full items-center justify-between border-b border-[var(--border)] last:border-b-0 px-4 py-3 text-left hover:bg-[var(--surface-elevated)] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              <div className="flex items-center gap-3">
                <Globe size={16} className="text-muted-foreground" />
                <span className="font-[var(--font-sans)] text-sm text-foreground">{l.label}</span>
                <span className="font-[var(--font-sans)] text-xs text-muted-foreground">({l.value.toUpperCase()})</span>
              </div>
              {currentLocale === l.value && <div className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />}
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
