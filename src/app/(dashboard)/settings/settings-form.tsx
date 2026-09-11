"use client";

import Link from "next/link";
import { Scale, ChevronRight } from "lucide-react";
import type { Theme } from "@/lib/theme";
import type { Locale } from "@/i18n/get-dictionary";
import type { UserSettingsData } from "@/app/actions/settings";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { AppearanceSettings } from "@/components/settings/appearance-settings";

interface SettingsFormProps {
  settings: UserSettingsData;
  currentTheme: Theme;
  currentLocale: Locale;
  dict?: {
    settings?: {
      goalReminders?: string;
    };
  };
}

export function SettingsForm({ settings, currentTheme, currentLocale, dict }: SettingsFormProps) {
  return (
    <div className="space-y-6">
      <NotificationSettings settings={settings} dict={{ goalReminders: dict?.settings?.goalReminders }} />
      <AppearanceSettings currentTheme={currentTheme} currentLocale={currentLocale} />

      {/* Licenses — link to /licenses */}
      <section>
        <h2 className="mb-2 px-1 font-[var(--font-sans)] text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          About
        </h2>
        <Link
          href="/licenses"
          className="flex w-full items-center justify-between rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 hover:bg-[var(--surface-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        >
          <div className="flex items-center gap-3">
            <Scale size={16} className="text-muted-foreground" />
            <span className="font-[var(--font-sans)] text-sm text-foreground">Licenses</span>
          </div>
          <ChevronRight size={16} className="text-muted-foreground" />
        </Link>
      </section>
    </div>
  );
}
