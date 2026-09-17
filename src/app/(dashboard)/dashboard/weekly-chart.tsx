"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface DatoDiaGrafico {
  dia: string;
  normales: number;
  extra: number;
}

export function WeeklyChart({ datos }: { datos: DatoDiaGrafico[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={datos}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="dia" fontSize={12} tickLine={false} />
        <YAxis fontSize={12} tickLine={false} width={32} />
        <Tooltip formatter={(value) => `${Number(value).toFixed(2)} h`} />
        <Legend />
        <Bar dataKey="normales" name="Normales" stackId="horas" fill="#2563eb" />
        <Bar dataKey="extra" name="Extra" stackId="horas" fill="#f59e0b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
