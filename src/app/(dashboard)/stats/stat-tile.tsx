export function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <p className="text-sm text-[#898781]">{label}</p>
      <p className="text-2xl font-semibold text-[#0b0b0b] tabular-nums">{value}</p>
    </div>
  );
}
