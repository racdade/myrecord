import { format, parseISO } from "date-fns";
import { enUS, es } from "date-fns/locale";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { construirReporte } from "@/lib/reportes/construir";
import { puedeVerReporteDe, resolverRango } from "@/lib/reportes/acceso";
import { rangoMes } from "@/lib/semana";
import { formatearRangoHora } from "@/lib/formato-hora";
import { TendenciaChart } from "../../reportes/tendencia-chart";
import { CalendarioMensual } from "../../reportes/calendario-mensual";

const LOCALES_DATE_FNS = { es, en: enUS };

interface DetalleSearchParams {
  modo?: string;
  desde?: string;
  hasta?: string;
}

export default async function DetalleMiembroPage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<DetalleSearchParams>;
}) {
  const { userId } = await params;
  const busqueda = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!(await puedeVerReporteDe(supabase, user.id, userId))) {
    notFound();
  }

  const modo = busqueda.modo === "mes" || busqueda.modo === "rango" ? busqueda.modo : "semana";
  const rango = resolverRango(busqueda);
  const reporte = await construirReporte(supabase, userId, rango);

  const { data: profileAdmin } = await supabase.from("profiles").select("formato_hora").eq("id", user.id).single();
  const formatoHora = profileAdmin?.formato_hora ?? "24h";

  const mesActual = rangoMes();
  const { data: turnosMes } = await supabase
    .from("shifts")
    .select("*")
    .eq("user_id", userId)
    .gte("fecha", mesActual.inicio)
    .lte("fecha", mesActual.fin);
  const { data: feriadosMes } = await supabase
    .from("holidays")
    .select("fecha, nombre")
    .gte("fecha", mesActual.inicio)
    .lte("fecha", mesActual.fin);

  const locale = await getLocale();
  const dateFnsLocale = LOCALES_DATE_FNS[locale as "es" | "en"] ?? es;

  const datosTendencia = reporte.tendencia.map((p) => ({
    etiqueta: format(parseISO(p.semanaInicio), "d MMM", { locale: dateFnsLocale }),
    horas: p.horas,
    extras: p.extras,
  }));

  const queryExport = new URLSearchParams({
    userId,
    modo,
    ...(modo === "rango" ? { desde: rango.inicio, hasta: rango.fin } : {}),
  });

  const t = await getTranslations("equipo");
  const tr = await getTranslations("reportes");
  const tc = await getTranslations("comun");

  const ETIQUETAS_TIPO: Record<string, string> = {
    normal: tc("normal"),
    feriado: tc("feriado"),
    libre: tc("libre"),
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{reporte.nombre}</h1>
        <Link href="/equipo" className={buttonVariants({ variant: "outline", size: "sm" })}>
          {t("volverAlEquipo")}
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/equipo/${userId}?modo=semana`}
          className={buttonVariants({ variant: modo === "semana" ? "default" : "outline", size: "sm" })}
        >
          {tr("semanaActual")}
        </Link>
        <Link
          href={`/equipo/${userId}?modo=mes`}
          className={buttonVariants({ variant: modo === "mes" ? "default" : "outline", size: "sm" })}
        >
          {tr("mesActual")}
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <TarjetaResumen titulo={tr("horas")} valor={`${reporte.horas.toFixed(1)} h`} />
        <TarjetaResumen titulo={tr("extras")} valor={`${reporte.extras.toFixed(1)} h`} />
        <TarjetaResumen titulo={tr("pagoEstimado")} valor={reporte.formatoMoneda.format(reporte.pagoEstimado)} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{tr("turnosDelAl", { desde: rango.inicio, hasta: rango.fin })}</CardTitle>
          <div className="flex gap-2">
            <a
              href={`/api/reportes/csv?${queryExport.toString()}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              {tr("exportarCSV")}
            </a>
            <a
              href={`/api/reportes/pdf?${queryExport.toString()}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              {tr("exportarPDF")}
            </a>
          </div>
        </CardHeader>
        <CardContent>
          {reporte.turnos.length === 0 ? (
            <p className="text-sm text-muted-foreground">{tr("noHayTurnos")}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{tc("fecha")}</TableHead>
                    <TableHead>{tc("tipo")}</TableHead>
                    <TableHead>{tc("horario")}</TableHead>
                    <TableHead>{tc("nota")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reporte.turnos.map((turno) => (
                    <TableRow key={turno.id}>
                      <TableCell>{turno.fecha}</TableCell>
                      <TableCell>{ETIQUETAS_TIPO[turno.tipo] ?? turno.tipo}</TableCell>
                      <TableCell>
                        {formatearRangoHora(turno.hora_inicio, turno.hora_fin, formatoHora)}
                      </TableCell>
                      <TableCell className="max-w-40 truncate">{turno.nota ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tr("tendencia")}</CardTitle>
        </CardHeader>
        <CardContent>
          <TendenciaChart datos={datosTendencia} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tr("calendarioDelMes")}</CardTitle>
        </CardHeader>
        <CardContent>
          <CalendarioMensual
            mesRef={new Date()}
            turnos={turnosMes ?? []}
            feriados={feriadosMes ?? []}
            locale={locale}
            diasSemana={tr.raw("diasSemana")}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function TarjetaResumen({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-normal text-muted-foreground">{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{valor}</p>
      </CardContent>
    </Card>
  );
}
