"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const PALETTE = {
  light: { surface: "#fcfcfb", gridline: "#e1e0d9", axis: "#c3c2b7", muted: "#898781", bar: "#2a78d6", ink: "#0b0b0b" },
  dark: { surface: "#1a1a19", gridline: "#2c2c2a", axis: "#383835", muted: "#898781", bar: "#3987e5", ink: "#ffffff" },
};

export function MonthlyChart({ data, label, dark }: { data: { month: string; count: number }[]; label: string; dark: boolean }) {
  const colors = dark ? PALETTE.dark : PALETTE.light;

  return (
    <div
      className="h-64 w-full rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
      style={{ backgroundColor: colors.surface }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={colors.gridline} />
          <XAxis dataKey="month" tick={{ fill: colors.muted, fontSize: 12 }} axisLine={{ stroke: colors.axis }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: colors.muted, fontSize: 12 }} axisLine={false} tickLine={false} width={24} />
          <Tooltip
            cursor={{ fill: colors.gridline }}
            contentStyle={{ borderColor: colors.gridline, background: colors.surface, color: colors.ink, fontSize: 12 }}
            formatter={(value) => [value, label]}
          />
          <Bar dataKey="count" fill={colors.bar} radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
