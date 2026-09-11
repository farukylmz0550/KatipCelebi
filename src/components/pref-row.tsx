"use client";

export function PrefRow({
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
