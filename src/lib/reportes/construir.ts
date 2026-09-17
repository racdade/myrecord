import type { createClient } from "@/lib/supabase/server";
import { calcularPagoEstimado, minutosAHoras, resumirSemana, type ResumenSemana } from "@/lib/calc";
import { filaAReglas, filaATurno } from "@/lib/shift-mapper";
import { semanasEnRango, ultimasSemanas, type RangoFechas } from "@/lib/semana";
import type { ShiftRow } from "@/types/database";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export interface PuntoTendencia {
  semanaInicio: string;
  horas: number;
  extras: number;
}

export interface ReporteDatos {
  rango: RangoFechas;
  nombre: string;
  moneda: string;
  formatoMoneda: Intl.NumberFormat;
  turnos: ShiftRow[];
  horas: number;
  extras: number;
  pagoEstimado: number;
  tendencia: PuntoTendencia[];
  feriados: { fecha: string; nombre: string }[];
}

const RESUMEN_VACIO: ResumenSemana = {
  minutosNormales: 0,
  minutosTramo1: 0,
  minutosTramo2: 0,
  minutosFeriado: 0,
  minutosNocturnos: 0,
  minutosTotales: 0,
};

function sumarResumenes(resumenes: ResumenSemana[]): ResumenSemana {
  return resumenes.reduce(
    (total, r) => ({
      minutosNormales: total.minutosNormales + r.minutosNormales,
      minutosTramo1: total.minutosTramo1 + r.minutosTramo1,
      minutosTramo2: total.minutosTramo2 + r.minutosTramo2,
      minutosFeriado: total.minutosFeriado + r.minutosFeriado,
      minutosNocturnos: total.minutosNocturnos + r.minutosNocturnos,
      minutosTotales: total.minutosTotales + r.minutosTotales,
    }),
    RESUMEN_VACIO,
  );
}

/**
 * Arma los datos de /reportes (y de /equipo/[userId]) para un usuario y un
 * rango de fechas. `resumirSemana` de lib/calc solo vale semana por semana
 * (los topes de horas extra son semanales), así que para un rango de varias
 * semanas se corre una vez por cada semana que lo compone y se suman los
 * minutos ya clasificados — nunca se le pasa un rango largo de una sola vez.
 */
export async function construirReporte(
  supabase: SupabaseServerClient,
  userId: string,
  rango: RangoFechas,
): Promise<ReporteDatos> {
  const semanasTendencia = ultimasSemanas(12);
  const inicioConsulta =
    semanasTendencia[0].inicio < rango.inicio ? semanasTendencia[0].inicio : rango.inicio;

  const [{ data: perfil }, { data: reglaRow }, { data: turnosAmplios }, { data: feriadosRows }] =
    await Promise.all([
      supabase.from("profiles").select("nombre, email, tarifa_hora, moneda").eq("id", userId).single(),
      supabase.from("overtime_rules").select("*").eq("user_id", userId).single(),
      supabase.from("shifts").select("*").eq("user_id", userId).gte("fecha", inicioConsulta).lte("fecha", rango.fin),
      supabase.from("holidays").select("fecha, nombre").gte("fecha", rango.inicio).lte("fecha", rango.fin),
    ]);

  const reglas = filaAReglas(reglaRow);
  const todosLosTurnos = turnosAmplios ?? [];

  function resumenDeSemana(semana: RangoFechas): ResumenSemana {
    const turnosSemana = todosLosTurnos.filter((t) => t.fecha >= semana.inicio && t.fecha <= semana.fin);
    return resumirSemana(turnosSemana.map(filaATurno), reglas);
  }

  const resumenRango = sumarResumenes(semanasEnRango(rango).map(resumenDeSemana));
  const horas = minutosAHoras(resumenRango.minutosNormales + resumenRango.minutosTramo1 + resumenRango.minutosTramo2);
  const extras = minutosAHoras(resumenRango.minutosTramo1 + resumenRango.minutosTramo2);
  const pagoEstimado = calcularPagoEstimado(resumenRango, perfil?.tarifa_hora ?? 0, reglas);

  const tendencia: PuntoTendencia[] = semanasTendencia.map((semana) => {
    const resumenSemana = resumenDeSemana(semana);
    return {
      semanaInicio: semana.inicio,
      horas: minutosAHoras(resumenSemana.minutosNormales + resumenSemana.minutosTramo1 + resumenSemana.minutosTramo2),
      extras: minutosAHoras(resumenSemana.minutosTramo1 + resumenSemana.minutosTramo2),
    };
  });

  const turnosDelRango = todosLosTurnos
    .filter((t) => t.fecha >= rango.inicio && t.fecha <= rango.fin)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const moneda = perfil?.moneda ?? "PEN";

  return {
    rango,
    nombre: perfil?.nombre ?? perfil?.email ?? "Sin nombre",
    moneda,
    formatoMoneda: new Intl.NumberFormat("es-PE", { style: "currency", currency: moneda }),
    turnos: turnosDelRango,
    horas,
    extras,
    pagoEstimado,
    tendencia,
    feriados: (feriadosRows ?? []).map((f) => ({ fecha: f.fecha, nombre: f.nombre })),
  };
}
