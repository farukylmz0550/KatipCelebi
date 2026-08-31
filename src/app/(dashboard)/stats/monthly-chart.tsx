"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function MonthlyChart({ data, label }: { data: { month: string; count: number }[]; label: string }) {
  return (
    <div className="h-64 w-full rounded-lg border border-neutral-200 bg-[#fcfcfb] p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#e1e0d9" />
          <XAxis dataKey="month" tick={{ fill: "#898781", fontSize: 12 }} axisLine={{ stroke: "#c3c2b7" }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: "#898781", fontSize: 12 }} axisLine={false} tickLine={false} width={24} />
          <Tooltip
            cursor={{ fill: "#e1e0d9" }}
            contentStyle={{ borderColor: "#e1e0d9", fontSize: 12 }}
            formatter={(value) => [value, label]}
          />
          <Bar dataKey="count" fill="#2a78d6" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
