"use client";

import { useTransition } from "react";
import { updateSettings } from "@/app/actions/settings";
import { setTheme } from "@/app/actions/theme";
import type { Theme } from "@/lib/theme";
import type { UserSettingsData } from "@/app/actions/settings";

interface SettingsFormProps {
  settings: UserSettingsData;
  currentTheme: Theme;
}

const THEMES: { value: Theme; label: string }[] = [
  { value: "light", label: "☀️ Light" },
  { value: "dark", label: "🌙 Dark" },
  { value: "light-contrast", label: "🔲 Light Contrast" },
  { value: "dark-contrast", label: "🔳 Dark Contrast" },
  { value: "amoled", label: "⬛ AMOLED" },
];

export function SettingsForm({ settings, currentTheme }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  function handleToggle(field: keyof UserSettingsData) {
    startTransition(() => {
      updateSettings({ [field]: !settings[field] });
    });
  }

  function handleThemeChange(value: Theme) {
    startTransition(() => {
      setTheme(value);
    });
  }

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Bildirimler</h2>
        <div className="space-y-2">
          <ToggleRow
            label="Bildirimleri etkinleştir"
            checked={settings.notificationsEnabled}
            onChange={() => handleToggle("notificationsEnabled")}
            disabled={isPending}
          />
          <ToggleRow
            label="Streak hatırlatıcıları"
            checked={settings.streakReminders}
            onChange={() => handleToggle("streakReminders")}
            disabled={isPending}
          />
          <ToggleRow
            label="Haftalık özet"
            checked={settings.weeklyDigest}
            onChange={() => handleToggle("weeklyDigest")}
            disabled={isPending}
          />
        </div>
      </section>

      {/* Theme */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Tema</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {THEMES.map((t) => (
            <button
              key={t.value}
              onClick={() => handleThemeChange(t.value)}
              disabled={isPending}
              className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                currentTheme === t.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground hover:bg-accent"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm transition-colors hover:bg-accent disabled:opacity-50"
    >
      <span>{label}</span>
      <div
        className={`relative h-5 w-9 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <div
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </div>
    </button>
  );
}
