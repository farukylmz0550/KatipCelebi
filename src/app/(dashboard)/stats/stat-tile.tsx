import type { ReactNode } from "react";

export function StatTile({ label, value, icon }: { label: string; value: string | number; icon?: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-accent/50">
      <div className="flex items-center gap-2">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-card-foreground">{value}</p>
    </div>
  );
}
