/** Buckets finish dates into their last-6-months' "YYYY-MM" label, zero-filled. */
export function monthlyFinishCounts(finishedAt: Date[], now = new Date()): { month: string; count: number }[] {
  const months: { key: string; month: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, month: d.toLocaleDateString(undefined, { month: "short" }) });
  }

  const counts = new Map(months.map((m) => [m.key, 0]));
  for (const date of finishedAt) {
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return months.map((m) => ({ month: m.month, count: counts.get(m.key) ?? 0 }));
}
