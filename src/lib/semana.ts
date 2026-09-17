import { addWeeks, endOfMonth, endOfWeek, formatISO, parseISO, startOfMonth, startOfWeek, subWeeks } from "date-fns";

export interface RangoFechas {
  inicio: string;
  fin: string;
}

export function fechaISO(fecha: Date): string {
  return formatISO(fecha, { representation: "date" });
}

/** Semana de lunes a domingo que contiene `fechaRef` (hoy por defecto). */
export function rangoSemanaActual(fechaRef: Date = new Date()): RangoFechas {
  const inicio = startOfWeek(fechaRef, { weekStartsOn: 1 });
  const fin = endOfWeek(fechaRef, { weekStartsOn: 1 });
  return { inicio: fechaISO(inicio), fin: fechaISO(fin) };
}

/** Primer día del mes que contiene `fechaRef`, en formato YYYY-MM-DD. */
export function inicioMes(fechaRef: Date = new Date()): string {
  return fechaISO(new Date(fechaRef.getFullYear(), fechaRef.getMonth(), 1));
}

/** Mes completo (1º al último día) que contiene `fechaRef`. */
export function rangoMes(fechaRef: Date = new Date()): RangoFechas {
  return { inicio: fechaISO(startOfMonth(fechaRef)), fin: fechaISO(endOfMonth(fechaRef)) };
}

/** Las últimas `n` semanas (lunes a domingo), de la más antigua a la más reciente. */
export function ultimasSemanas(n: number, fechaRef: Date = new Date()): RangoFechas[] {
  const semanas: RangoFechas[] = [];
  for (let i = n - 1; i >= 0; i--) {
    semanas.push(rangoSemanaActual(subWeeks(fechaRef, i)));
  }
  return semanas;
}

/**
 * Todas las semanas (lunes a domingo) que tocan `rango`, de la más antigua a
 * la más reciente. `resumirSemana` de lib/calc solo es válido semana por
 * semana (los topes son semanales) — para un mes o un rango a medida hay que
 * sumar el resumen de cada semana que lo compone, no correrlo de una sola vez
 * sobre todo el rango.
 */
export function semanasEnRango(rango: RangoFechas): RangoFechas[] {
  const semanas: RangoFechas[] = [];
  let cursor = startOfWeek(parseISO(rango.inicio), { weekStartsOn: 1 });
  const fin = parseISO(rango.fin);
  while (cursor <= fin) {
    semanas.push(rangoSemanaActual(cursor));
    cursor = addWeeks(cursor, 1);
  }
  return semanas;
}
