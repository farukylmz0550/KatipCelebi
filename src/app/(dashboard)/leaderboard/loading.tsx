export default function LeaderboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded bg-[var(--disabled-surface)]" />
      <div className="overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--surface)]">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-[var(--border)] px-3 py-3 last:border-0">
            <div className="h-4 w-8 animate-pulse rounded bg-[var(--disabled-surface)]" />
            <div className="h-4 flex-1 animate-pulse rounded bg-[var(--disabled-surface)]" />
            <div className="h-4 w-12 animate-pulse rounded bg-[var(--disabled-surface)]" />
            <div className="h-4 w-12 animate-pulse rounded bg-[var(--disabled-surface)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
