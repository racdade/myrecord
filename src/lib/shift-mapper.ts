import type { ReglasExtras, Turno } from "@/lib/calc";
import { REGLAS_POR_DEFECTO } from "@/lib/calc";
import type { OvertimeRuleRow, ShiftRow } from "@/types/database";

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

/** Convierte una fila de `overtime_rules` a las `ReglasExtras` que espera lib/calc. */
export function filaAReglas(fila: OvertimeRuleRow | null | undefined): ReglasExtras {
  if (!fila) return REGLAS_POR_DEFECTO;
  return {
    horasDia: Number(fila.horas_dia),
    horasSemana: Number(fila.horas_semana),
    modo: fila.modo,
    tramo1Horas: Number(fila.tramo1_horas),
    tramo1Pct: Number(fila.tramo1_pct),
    tramo2Pct: Number(fila.tramo2_pct),
    feriadoPct: Number(fila.feriado_pct),
    nocturnoPct: Number(fila.nocturno_pct),
    nocturnoInicio: fila.nocturno_inicio.slice(0, 5),
    nocturnoFin: fila.nocturno_fin.slice(0, 5),
  };
}
