export default function BooksLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded bg-[var(--disabled-surface)]" />
      <div className="h-32 animate-pulse rounded-[12px] border border-[var(--border)] bg-[var(--surface)]" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-[12px] border border-[var(--border)] bg-[var(--surface)]"
          />
        ))}
      </div>
    </div>
  );
}
