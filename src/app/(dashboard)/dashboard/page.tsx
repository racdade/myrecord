import { eachDayOfInterval, format, parseISO } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";
import { calcularPagoEstimado, minutosAHoras, minutosNetosTurno, resumirSemana } from "@/lib/calc";
import { filaAReglas, filaATurno } from "@/lib/shift-mapper";
import { fechaISO, inicioMes, rangoSemanaActual } from "@/lib/semana";
import { ConectarCalendarButton } from "@/components/conectar-calendar-button";
import { actualizarAjustes } from "../actions";
import { desconectarGoogleCalendar } from "../calendario-actions";
import { WeeklyChart, type DatoDiaGrafico } from "./weekly-chart";

const LOCALES_DATE_FNS = { es, en: enUS };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: reglaRow }, { data: conexionCalendar }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("overtime_rules").select("*").eq("user_id", user.id).single(),
    supabase.from("google_connections").select("*").eq("user_id", user.id).single(),
  ]);

  const reglas = filaAReglas(reglaRow);

  const tarifaHora = profile?.tarifa_hora ?? 0;
  const moneda = profile?.moneda ?? "PEN";

  const { inicio: inicioSemana, fin: finSemana } = rangoSemanaActual();
  const inicioDelMes = inicioMes();
  const rangoInicio = inicioDelMes < inicioSemana ? inicioDelMes : inicioSemana;

  const { data: turnosRango, error } = await supabase
    .from("shifts")
    .select("*")
    .eq("user_id", user.id)
    .gte("fecha", rangoInicio)
    .lte("fecha", finSemana);

  if (error) throw new Error(error.message);

  const turnos = turnosRango ?? [];
  const turnosSemana = turnos.filter((t) => t.fecha >= inicioSemana && t.fecha <= finSemana);
  const turnosMes = turnos.filter((t) => t.fecha >= inicioDelMes);

  const resumenSemana = resumirSemana(turnosSemana.map(filaATurno), reglas);
  const pagoEstimadoSemana = calcularPagoEstimado(resumenSemana, tarifaHora, reglas);

  // "Horas del mes" es la suma simple de horas netas trabajadas, sin pasar
  // por el reparto normal/extra de resumirSemana (esa lógica asume que el
  // rango que recibe es una sola semana; aplicarla a un mes completo
  // calcularía mal el tope semanal).
  const minutosNetosMes = turnosMes.reduce(
    (total, turno) => total + minutosNetosTurno(filaATurno(turno)),
    0,
  );

  const horasSemana = minutosAHoras(resumenSemana.minutosNormales + resumenSemana.minutosTramo1 + resumenSemana.minutosTramo2);
  const extrasSemana = minutosAHoras(resumenSemana.minutosTramo1 + resumenSemana.minutosTramo2);
  const horasMes = minutosAHoras(minutosNetosMes);

  const formatoMoneda = new Intl.NumberFormat("es-PE", { style: "currency", currency: moneda });

  const locale = await getLocale();
  const dateFnsLocale = LOCALES_DATE_FNS[locale as "es" | "en"] ?? es;

  const diasSemana = eachDayOfInterval({ start: parseISO(inicioSemana), end: parseISO(finSemana) });
  const limiteDiaMin = reglas.horasDia * 60;
  const datosGrafico: DatoDiaGrafico[] = diasSemana.map((dia) => {
    const fecha = fechaISO(dia);
    const netosDia = turnosSemana
      .filter((t) => t.fecha === fecha)
      .reduce((total, turno) => total + minutosNetosTurno(filaATurno(turno)), 0);
    return {
      dia: format(dia, "EEE d", { locale: dateFnsLocale }),
      normales: minutosAHoras(Math.min(netosDia, limiteDiaMin)),
      extra: minutosAHoras(Math.max(0, netosDia - limiteDiaMin)),
    };
  });

  const t = await getTranslations("dashboard");
  const tc = await getTranslations("comun");

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <TarjetaResumen titulo={t("horasDeLaSemana")} valor={`${horasSemana.toFixed(1)} h`} />
        <TarjetaResumen titulo={t("extrasDeLaSemana")} valor={`${extrasSemana.toFixed(1)} h`} />
        <TarjetaResumen titulo={t("horasDelMes")} valor={`${horasMes.toFixed(1)} h`} />
        <TarjetaResumen titulo={t("pagoEstimadoSemana")} valor={formatoMoneda.format(pagoEstimadoSemana)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("horasPorDia")}</CardTitle>
        </CardHeader>
        <CardContent>
          <WeeklyChart datos={datosGrafico} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("tarifaYReglas")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={actualizarAjustes} className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="nombre">{t("nombre")}</Label>
              <Input
                id="nombre"
                name="nombre"
                type="text"
                maxLength={100}
                defaultValue={profile?.nombre ?? ""}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="fechaNacimiento">{t("fechaNacimiento")}</Label>
              <Input
                id="fechaNacimiento"
                name="fechaNacimiento"
                type="date"
                defaultValue={profile?.fecha_nacimiento ?? ""}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="tarifaHora">{t("tarifaPorHora", { moneda })}</Label>
              <Input
                id="tarifaHora"
                name="tarifaHora"
                type="number"
                min={0}
                step="0.01"
                defaultValue={tarifaHora}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="horasDia">{t("horasNormalesDia")}</Label>
              <Input
                id="horasDia"
                name="horasDia"
                type="number"
                min={1}
                max={24}
                step="0.5"
                defaultValue={reglas.horasDia}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="horasSemana">{t("horasNormalesSemana")}</Label>
              <Input
                id="horasSemana"
                name="horasSemana"
                type="number"
                min={1}
                max={168}
                step="1"
                defaultValue={reglas.horasSemana}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="modo">{t("cuandoCuentaComoExtra")}</Label>
              <select
                id="modo"
                name="modo"
                defaultValue={reglas.modo}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                <option value="dia">{t("porDia")}</option>
                <option value="semana">{t("porSemana")}</option>
                <option value="ambos">{t("ambos")}</option>
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="tramo1Horas">{t("horasTramo1")}</Label>
              <Input
                id="tramo1Horas"
                name="tramo1Horas"
                type="number"
                min={0}
                step="0.5"
                defaultValue={reglas.tramo1Horas}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="tramo1Pct">{t("recargoTramo1")}</Label>
              <Input
                id="tramo1Pct"
                name="tramo1Pct"
                type="number"
                min={0}
                step="0.01"
                defaultValue={reglas.tramo1Pct}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="tramo2Pct">{t("recargoTramo2")}</Label>
              <Input
                id="tramo2Pct"
                name="tramo2Pct"
                type="number"
                min={0}
                step="0.01"
                defaultValue={reglas.tramo2Pct}
                required
              />
            </div>
            <div className="flex items-end sm:col-span-3">
              <Button type="submit">{tc("guardar")}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("googleCalendar")}</CardTitle>
        </CardHeader>
        <CardContent>
          {conexionCalendar ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">{t("conectado")}</p>
              <form action={desconectarGoogleCalendar}>
                <Button type="submit" variant="outline">
                  {t("desconectar")}
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">{t("conectaTuCuenta")}</p>
              <ConectarCalendarButton />
            </div>
          )}
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
