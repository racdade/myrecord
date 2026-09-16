import { endOfWeek, formatISO, startOfWeek } from "date-fns";

export function fechaISO(fecha: Date): string {
  return formatISO(fecha, { representation: "date" });
}

/** Semana de lunes a domingo que contiene `fechaRef` (hoy por defecto). */
export function rangoSemanaActual(fechaRef: Date = new Date()) {
  const inicio = startOfWeek(fechaRef, { weekStartsOn: 1 });
  const fin = endOfWeek(fechaRef, { weekStartsOn: 1 });
  return { inicio: fechaISO(inicio), fin: fechaISO(fin) };
}

/** Primer día del mes que contiene `fechaRef`, en formato YYYY-MM-DD. */
export function inicioMes(fechaRef: Date = new Date()): string {
  return fechaISO(new Date(fechaRef.getFullYear(), fechaRef.getMonth(), 1));
}
