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

const THEMES: { value: Theme; label: string; icon: string }[] = [
  { value: "light", label: "Light", icon: "☀️" },
  { value: "dark", label: "Dark", icon: "🌙" },
  { value: "high-contrast", label: "High Contrast", icon: "◐" },
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
      <section>
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Bildirimler
        </h2>
        <div className="gnome-boxed-list">
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
      <section>
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Tema
        </h2>
        <div className="gnome-boxed-list">
          {THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => handleThemeChange(t.value)}
              disabled={isPending}
              className="gnome-boxed-list-item w-full text-left disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <span className="text-base">{t.icon}</span>
                <span className="text-sm text-foreground">{t.label}</span>
              </div>
              {currentTheme === t.value && (
                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
              )}
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
      className="gnome-boxed-list-item w-full text-left disabled:opacity-50"
    >
      <span className="text-sm text-foreground">{label}</span>
      <div
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
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
