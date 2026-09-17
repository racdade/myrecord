import { format, parseISO } from "date-fns";
import { enUS, es } from "date-fns/locale";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { resolverRango } from "@/lib/reportes/acceso";
import { rangoMes } from "@/lib/semana";
import { formatearRangoHora } from "@/lib/formato-hora";
import { TendenciaChart } from "./tendencia-chart";
import { CalendarioMensual } from "./calendario-mensual";

const LOCALES_DATE_FNS = { es, en: enUS };

interface ReportesSearchParams {
  modo?: string;
  desde?: string;
  hasta?: string;
}

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<ReportesSearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const modo = params.modo === "mes" || params.modo === "rango" ? params.modo : "semana";
  const rango = resolverRango(params);
  const reporte = await construirReporte(supabase, user.id, rango);

  const mesActual = rangoMes();
  const { data: turnosMes } = await supabase
    .from("shifts")
    .select("*")
    .eq("user_id", user.id)
    .gte("fecha", mesActual.inicio)
    .lte("fecha", mesActual.fin);
  const { data: feriadosMes } = await supabase
    .from("holidays")
    .select("fecha, nombre")
    .gte("fecha", mesActual.inicio)
    .lte("fecha", mesActual.fin);
  const { data: profile } = await supabase.from("profiles").select("formato_hora").eq("id", user.id).single();
  const formatoHora = profile?.formato_hora ?? "24h";

  const locale = await getLocale();
  const dateFnsLocale = LOCALES_DATE_FNS[locale as "es" | "en"] ?? es;

  const datosTendencia = reporte.tendencia.map((p) => ({
    etiqueta: format(parseISO(p.semanaInicio), "d MMM", { locale: dateFnsLocale }),
    horas: p.horas,
    extras: p.extras,
  }));

  const queryExport = new URLSearchParams({ modo, ...(modo === "rango" ? { desde: rango.inicio, hasta: rango.fin } : {}) });

  const t = await getTranslations("reportes");
  const tc = await getTranslations("comun");

  const ETIQUETAS_TIPO: Record<string, string> = {
    normal: tc("normal"),
    feriado: tc("feriado"),
    libre: tc("libre"),
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("filtro")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Link href="/reportes?modo=semana" className={buttonVariants({ variant: modo === "semana" ? "default" : "outline", size: "sm" })}>
              {t("semanaActual")}
            </Link>
            <Link href="/reportes?modo=mes" className={buttonVariants({ variant: modo === "mes" ? "default" : "outline", size: "sm" })}>
              {t("mesActual")}
            </Link>
          </div>
          <form method="get" className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="modo" value="rango" />
            <div className="grid gap-1.5">
              <Label htmlFor="desde">{t("desde")}</Label>
              <Input id="desde" name="desde" type="date" defaultValue={modo === "rango" ? rango.inicio : undefined} required />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="hasta">{t("hasta")}</Label>
              <Input id="hasta" name="hasta" type="date" defaultValue={modo === "rango" ? rango.fin : undefined} required />
            </div>
            <Button type="submit" variant={modo === "rango" ? "default" : "outline"}>
              {t("aplicarRango")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <TarjetaResumen titulo={t("horas")} valor={`${reporte.horas.toFixed(1)} h`} />
        <TarjetaResumen titulo={t("extras")} valor={`${reporte.extras.toFixed(1)} h`} />
        <TarjetaResumen titulo={t("pagoEstimado")} valor={reporte.formatoMoneda.format(reporte.pagoEstimado)} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("turnosDelAl", { desde: rango.inicio, hasta: rango.fin })}</CardTitle>
          <div className="flex gap-2">
            <a href={`/api/reportes/csv?${queryExport.toString()}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              {t("exportarCSV")}
            </a>
            <a href={`/api/reportes/pdf?${queryExport.toString()}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              {t("exportarPDF")}
            </a>
          </div>
        </CardHeader>
        <CardContent>
          {reporte.turnos.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noHayTurnos")}</p>
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
                      <TableCell>{formatearRangoHora(turno.hora_inicio, turno.hora_fin, formatoHora)}</TableCell>
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
          <CardTitle>{t("tendencia")}</CardTitle>
        </CardHeader>
        <CardContent>
          <TendenciaChart datos={datosTendencia} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("calendarioDelMes")}</CardTitle>
        </CardHeader>
        <CardContent>
          <CalendarioMensual
            mesRef={new Date()}
            turnos={turnosMes ?? []}
            feriados={feriadosMes ?? []}
            locale={locale}
            diasSemana={t.raw("diasSemana")}
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
