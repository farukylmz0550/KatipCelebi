export default function StatsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded bg-[var(--disabled-surface)]" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-[12px] border border-[var(--border)] bg-[var(--surface)]"
          />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-[12px] border border-[var(--border)] bg-[var(--surface)]" />
    </div>
  );
}
