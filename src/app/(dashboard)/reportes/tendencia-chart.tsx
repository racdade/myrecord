"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTranslations } from "next-intl";

export interface PuntoTendenciaGrafico {
  etiqueta: string;
  horas: number;
  extras: number;
}

export function TendenciaChart({ datos }: { datos: PuntoTendenciaGrafico[] }) {
  const t = useTranslations("reportes");

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={datos}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="etiqueta" fontSize={12} tickLine={false} />
        <YAxis fontSize={12} tickLine={false} width={32} />
        <Tooltip formatter={(value) => `${Number(value).toFixed(2)} h`} />
        <Legend />
        <Bar dataKey="horas" name={t("horas")} stackId="horas" fill="#2563eb" />
        <Bar dataKey="extras" name={t("extras")} stackId="horas" fill="#f59e0b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
