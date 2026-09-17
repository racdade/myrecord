import { toZonedTime } from "date-fns-tz";

const ZONA_HORARIA = "America/Lima";

function elegirAlAzar<T>(lista: readonly T[]): T {
  return lista[Math.floor(Math.random() * lista.length)];
}

/** Combina una apertura y un cierre al azar (40 × 25 = 1000 mensajes posibles con las listas actuales). */
export function combinarMensaje(aperturas: readonly string[], cierres: readonly string[]): string {
  return `${elegirAlAzar(aperturas)} ${elegirAlAzar(cierres)}`;
}

export function mensajeCumpleanosAlAzar(mensajes: readonly string[]): string {
  return elegirAlAzar(mensajes);
}

/**
 * ¿Hoy (en America/Lima) es el cumpleaños de la persona? Compara solo mes y
 * día, no el año.
 */
export function esCumpleanosHoy(fechaNacimientoISO: string | null | undefined, ahora: Date = new Date()): boolean {
  if (!fechaNacimientoISO) return false;

  const [, mesStr, diaStr] = fechaNacimientoISO.split("-");
  const mesNacimiento = Number(mesStr);
  const diaNacimiento = Number(diaStr);
  if (!mesNacimiento || !diaNacimiento) return false;

  const hoyLima = toZonedTime(ahora, ZONA_HORARIA);
  return hoyLima.getMonth() + 1 === mesNacimiento && hoyLima.getDate() === diaNacimiento;
}
