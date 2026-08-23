"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function RevenueChart({ data }: { data: { date: string; totalReais: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e6dac6" />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#6b5d50" }} />
        <YAxis tick={{ fontSize: 12, fill: "#6b5d50" }} width={48} />
        <Tooltip
          formatter={(value) =>
            Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
          }
        />
        <Line type="monotone" dataKey="totalReais" stroke="#7c8b5e" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
