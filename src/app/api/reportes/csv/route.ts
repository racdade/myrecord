import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { construirReporte } from "@/lib/reportes/construir";
import { puedeVerReporteDe, resolverRango } from "@/lib/reportes/acceso";

const ETIQUETAS_TIPO: Record<string, string> = {
  normal: "Normal",
  feriado: "Feriado",
  libre: "Libre",
};

function celdaCsv(valor: string): string {
  return `"${valor.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const userId = searchParams.get("userId") ?? user.id;
  if (!(await puedeVerReporteDe(supabase, user.id, userId))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const rango = resolverRango({
    modo: searchParams.get("modo"),
    desde: searchParams.get("desde"),
    hasta: searchParams.get("hasta"),
  });

  const reporte = await construirReporte(supabase, userId, rango);

  const encabezados = ["Fecha", "Tipo", "Entrada", "Salida", "Descanso (min)", "Nota"];
  const filas = reporte.turnos.map((t) => [
    t.fecha,
    ETIQUETAS_TIPO[t.tipo] ?? t.tipo,
    t.hora_inicio?.slice(0, 5) ?? "",
    t.hora_fin?.slice(0, 5) ?? "",
    String(t.descanso_min),
    t.nota ?? "",
  ]);

  const csv = [encabezados, ...filas].map((fila) => fila.map(celdaCsv).join(",")).join("\r\n");
  // BOM para que Excel reconozca UTF-8 (tildes, ñ) correctamente.
  const contenido = "﻿" + csv;

  return new NextResponse(contenido, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="turnos_${rango.inicio}_a_${rango.fin}.csv"`,
    },
  });
}
