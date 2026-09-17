import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { construirReporte } from "@/lib/reportes/construir";
import { puedeVerReporteDe, resolverRango } from "@/lib/reportes/acceso";
import { formatearHora } from "@/lib/formato-hora";

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

  const { data: profile } = await supabase.from("profiles").select("formato_hora").eq("id", user.id).single();
  const formatoHora = profile?.formato_hora ?? "24h";

  const encabezados = ["Fecha", "Tipo", "Entrada", "Salida", "Descanso (min)", "Nota"];
  const filas = reporte.turnos.map((t) => [
    t.fecha,
    ETIQUETAS_TIPO[t.tipo] ?? t.tipo,
    formatearHora(t.hora_inicio, formatoHora),
    formatearHora(t.hora_fin, formatoHora),
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
