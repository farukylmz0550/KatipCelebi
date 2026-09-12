// SPDX-License-Identifier: GPL-3.0-only
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { SettingsForm } from "./settings-form";
import { getSettings } from "@/app/actions/settings";
import { getTheme } from "@/lib/theme";

export default async function SettingsPage() {
  const dict = await getDictionary();
  const settings = await getSettings();
  const theme = await getTheme();
  const locale = await getLocale();

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-[var(--font-serif)] text-2xl font-semibold tracking-tight text-foreground">
          {dict.nav.settings}
        </h1>
        <p className="font-[var(--font-sans)] text-sm text-muted-foreground">{dict.nav.settings}</p>
      </header>
      <SettingsForm
        settings={settings}
        currentTheme={theme}
        currentLocale={locale}
        dict={{ settings: { goalReminders: dict.settings.goalReminders } }}
      />
    </div>
  );
}
