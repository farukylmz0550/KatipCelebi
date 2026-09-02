export default function LeaderboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-neutral-200 px-3 py-3 last:border-0 dark:border-neutral-800">
            <div className="h-4 w-8 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-4 flex-1 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-4 w-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-4 w-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
