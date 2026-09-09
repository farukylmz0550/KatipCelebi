"use client";

import { useTransition } from "react";
import { Sun, Moon } from "lucide-react";
import { updateSettings } from "@/app/actions/settings";
import { setTheme } from "@/app/actions/theme";
import type { Theme } from "@/lib/theme";
import type { UserSettingsData } from "@/app/actions/settings";

interface SettingsFormProps {
  settings: UserSettingsData;
  currentTheme: Theme;
}

const THEMES: { value: Theme; label: string; Icon: React.ElementType }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
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
        <h2 className="mb-2 px-1 font-[var(--font-sans)] text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Bildirimler
        </h2>
        <div className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
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
        <h2 className="mb-2 px-1 font-[var(--font-sans)] text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Tema
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
      className="flex w-full items-center justify-between border-b border-[var(--border)] last:border-b-0 px-4 py-3 text-left hover:bg-[var(--surface-elevated)] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
    >
      <span className="font-[var(--font-sans)] text-sm text-foreground">{label}</span>
      <div
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
      >
        <div
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`}
        />
      </div>
    </button>
  );
}
