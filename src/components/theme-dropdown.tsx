"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Palette } from "lucide-react";
import { setTheme } from "@/app/actions/theme";
import type { Theme } from "@/lib/theme";

interface ThemeDropdownProps {
  currentTheme: Theme;
}

const THEME_OPTIONS: { value: Theme; label: string; icon: string }[] = [
  { value: "light", label: "Light", icon: "☀️" },
  { value: "dark", label: "Dark", icon: "🌙" },
  { value: "high-contrast", label: "High Contrast", icon: "◐" },
];

export function ThemeDropdown({ currentTheme }: ThemeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        title="Tema"
      >
        <Palette size={16} />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setIsOpen(false);
                startTransition(() => {
                  setTheme(opt.value);
                });
              }}
              disabled={isPending}
              className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent disabled:opacity-50 ${
                currentTheme === opt.value
                  ? "text-primary"
                  : "text-foreground"
              }`}
            >
              <span className="text-base">{opt.icon}</span>
              <span>{opt.label}</span>
              {currentTheme === opt.value && (
                <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
