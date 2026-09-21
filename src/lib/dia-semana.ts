import { format, parseISO } from "date-fns";
import { enUS, es } from "date-fns/locale";

const LOCALES_DATE_FNS = { es, en: enUS };

/** Nombre del día de la semana ("Lunes", "Monday"...) para una fecha "YYYY-MM-DD". */
export function nombreDiaSemana(fechaISO: string, locale: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaISO)) return "—";
  const dateFnsLocale = LOCALES_DATE_FNS[locale as "es" | "en"] ?? es;
  const nombre = format(parseISO(fechaISO), "EEEE", { locale: dateFnsLocale });
  return nombre.charAt(0).toUpperCase() + nombre.slice(1);
}
