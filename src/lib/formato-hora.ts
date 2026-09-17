import type { FormatoHoraDB } from "@/types/database";

/** "14:00" con formato_hora="24h" → "14:00"; con "12h" → "2:00 p. m.". */
export function formatearHora(horaHHMM: string | null | undefined, formato: FormatoHoraDB): string {
  if (!horaHHMM) return "";
  const hora = horaHHMM.slice(0, 5);
  if (formato === "24h") return hora;

  const [horasStr, minutosStr] = hora.split(":");
  const horas24 = Number(horasStr);
  const sufijo = horas24 < 12 ? "a. m." : "p. m.";
  const horas12 = horas24 % 12 === 0 ? 12 : horas24 % 12;
  return `${horas12}:${minutosStr} ${sufijo}`;
}

/** "14:00" / "22:00" → "14:00 – 22:00" o "2:00 p. m. – 10:00 p. m." según el formato. */
export function formatearRangoHora(
  horaInicio: string | null | undefined,
  horaFin: string | null | undefined,
  formato: FormatoHoraDB,
): string {
  if (!horaInicio || !horaFin) return "—";
  return `${formatearHora(horaInicio, formato)} – ${formatearHora(horaFin, formato)}`;
}
