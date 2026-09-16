import type { Turno } from "@/lib/calc";
import type { ShiftRow } from "@/types/database";

/** Convierte una fila de `shifts` (snake_case, de Supabase) al `Turno` que espera lib/calc. */
export function filaATurno(fila: ShiftRow): Turno {
  return {
    fecha: fila.fecha,
    horaInicio: fila.hora_inicio,
    horaFin: fila.hora_fin,
    descansoMin: fila.descanso_min,
    tipo: fila.tipo,
  };
}
