// SPDX-License-Identifier: GPL-3.0-only
"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Palette, Sun, Moon } from "lucide-react";
import { setTheme } from "@/app/actions/theme";
import type { Theme } from "@/lib/theme";

interface ThemeDropdownProps {
  currentTheme: Theme;
}

const THEME_OPTIONS: { value: Theme; label: string; Icon: React.ElementType }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
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
        <div className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--surface-elevated)] shadow-lg">
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.Icon;
            return (
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
                className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left font-[var(--font-sans)] text-sm transition-colors hover:bg-accent disabled:opacity-50 ${
                  currentTheme === opt.value ? "text-[var(--accent)]" : "text-foreground"
                }`}
              >
                <Icon size={16} className="shrink-0" />
                <span>{opt.label}</span>
                {currentTheme === opt.value && <div className="ml-auto h-2 w-2 rounded-full bg-[var(--accent)]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
