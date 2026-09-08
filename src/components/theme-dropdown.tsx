"use client";

import { useTransition } from "react";
import { Palette } from "lucide-react";
import { setTheme } from "@/app/actions/theme";
import type { Theme } from "@/lib/theme";

interface ThemeDropdownProps {
  currentTheme: Theme;
}

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: "light", label: "☀️ Light" },
  { value: "dark", label: "🌙 Dark" },
  { value: "light-contrast", label: "🔲 Light Contrast" },
  { value: "dark-contrast", label: "🔳 Dark Contrast" },
  { value: "amoled", label: "⬛ AMOLED" },
];

export function ThemeDropdown({ currentTheme }: ThemeDropdownProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="relative">
      <select
        value={currentTheme}
        onChange={(e) => {
          const value = e.target.value as Theme;
          startTransition(() => {
            setTheme(value);
          });
        }}
        disabled={isPending}
        className="appearance-none rounded-md border border-border bg-card px-2 py-1 pr-6 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
        aria-label="Theme"
      >
        {THEME_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <Palette
        size={12}
        className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}
