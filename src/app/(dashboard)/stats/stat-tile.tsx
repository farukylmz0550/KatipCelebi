export function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="editorial-label">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums">{value}</p>
    </div>
  );
}
