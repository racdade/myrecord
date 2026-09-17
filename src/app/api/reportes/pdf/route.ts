import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { createClient } from "@/lib/supabase/server";
import { construirReporte, type ReporteDatos } from "@/lib/reportes/construir";
import { puedeVerReporteDe, resolverRango } from "@/lib/reportes/acceso";
import { formatearRangoHora } from "@/lib/formato-hora";
import type { FormatoHoraDB } from "@/types/database";

export const runtime = "nodejs";

const ETIQUETAS_TIPO: Record<string, string> = {
  normal: "Normal",
  feriado: "Feriado",
  libre: "Libre",
};

const COLUMNAS = [
  { titulo: "Fecha", ancho: 75 },
  { titulo: "Tipo", ancho: 60 },
  { titulo: "Horario", ancho: 130 },
  { titulo: "Descanso", ancho: 60 },
  { titulo: "Nota", ancho: 130 },
];

function generarPdf(reporte: ReporteDatos, formatoHora: FormatoHoraDB): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(18).font("Helvetica-Bold").text("Reporte de horas — app-horas");
    doc.moveDown(0.3);
    doc
      .fontSize(11)
      .font("Helvetica")
      .fillColor("#555555")
      .text(`${reporte.nombre} · del ${reporte.rango.inicio} al ${reporte.rango.fin}`);
    doc.moveDown();

    doc.fillColor("#000000").fontSize(12);
    doc.text(`Horas: ${reporte.horas.toFixed(1)} h`);
    doc.text(`Extras: ${reporte.extras.toFixed(1)} h`);
    doc.text(`Pago estimado: ${reporte.formatoMoneda.format(reporte.pagoEstimado)}`);
    doc.moveDown();

    const inicioX = doc.page.margins.left;
    let y = doc.y;

    function encabezadoTabla() {
      doc.font("Helvetica-Bold").fontSize(10);
      let x = inicioX;
      for (const columna of COLUMNAS) {
        doc.text(columna.titulo, x, y, { width: columna.ancho });
        x += columna.ancho;
      }
      y += 16;
      doc
        .moveTo(inicioX, y - 4)
        .lineTo(x, y - 4)
        .strokeColor("#dddddd")
        .stroke();
      doc.font("Helvetica").fontSize(9);
    }

    encabezadoTabla();

    for (const turno of reporte.turnos) {
      if (y > doc.page.height - doc.page.margins.bottom - 20) {
        doc.addPage();
        y = doc.page.margins.top;
        encabezadoTabla();
      }

      const horario = formatearRangoHora(turno.hora_inicio, turno.hora_fin, formatoHora);
      const valores = [
        turno.fecha,
        ETIQUETAS_TIPO[turno.tipo] ?? turno.tipo,
        horario,
        `${turno.descanso_min} min`,
        turno.nota ?? "",
      ];

      let x = inicioX;
      valores.forEach((valor, i) => {
        doc.text(valor, x, y, { width: COLUMNAS[i].ancho });
        x += COLUMNAS[i].ancho;
      });
      y += 16;
    }

    if (reporte.turnos.length === 0) {
      doc.text("No hay turnos en este rango.", inicioX, y);
    }

    doc.end();
  });
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
  const buffer = await generarPdf(reporte, profile?.formato_hora ?? "24h");

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="reporte_${rango.inicio}_a_${rango.fin}.pdf"`,
    },
  });
}
