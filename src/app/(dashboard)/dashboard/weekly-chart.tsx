"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTranslations } from "next-intl";

export interface DatoDiaGrafico {
  dia: string;
  normales: number;
  extra: number;
}

export function WeeklyChart({ datos }: { datos: DatoDiaGrafico[] }) {
  const t = useTranslations("reportes");

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={datos}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="dia" fontSize={12} tickLine={false} />
        <YAxis fontSize={12} tickLine={false} width={32} />
        <Tooltip formatter={(value) => `${Number(value).toFixed(2)} h`} />
        <Legend />
        <Bar dataKey="normales" name={t("horas")} stackId="horas" fill="#2563eb" />
        <Bar dataKey="extra" name={t("extras")} stackId="horas" fill="#f59e0b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
