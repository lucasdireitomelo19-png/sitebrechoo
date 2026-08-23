"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function RevenueChart({ data }: { data: { date: string; totalReais: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#78716c" }} />
        <YAxis tick={{ fontSize: 12, fill: "#78716c" }} width={48} />
        <Tooltip
          formatter={(value) =>
            Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
          }
        />
        <Line type="monotone" dataKey="totalReais" stroke="#1c1917" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
