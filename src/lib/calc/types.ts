export type TipoTurno = "normal" | "feriado" | "libre";

export interface Turno {
  fecha: string; // "YYYY-MM-DD"
  /** null solo cuando tipo === "libre" */
  horaInicio: string | null; // "HH:mm"
  /** null solo cuando tipo === "libre" */
  horaFin: string | null; // "HH:mm"
  descansoMin: number;
  tipo: TipoTurno;
}

export type ModoExtras = "dia" | "semana" | "ambos";

export interface ReglasExtras {
  horasDia: number;
  horasSemana: number;
  modo: ModoExtras;
  /** Horas semanales de extra pagadas al tramo1Pct antes de pasar al tramo2Pct. */
  tramo1Horas: number;
  tramo1Pct: number;
  tramo2Pct: number;
  feriadoPct: number;
  nocturnoPct: number;
  nocturnoInicio: string; // "HH:mm"
  nocturnoFin: string; // "HH:mm"
}

export const REGLAS_POR_DEFECTO: ReglasExtras = {
  horasDia: 8,
  horasSemana: 48,
  modo: "ambos",
  tramo1Horas: 2,
  tramo1Pct: 0.25,
  tramo2Pct: 0.35,
  feriadoPct: 1.0,
  nocturnoPct: 0.35,
  nocturnoInicio: "22:00",
  nocturnoFin: "06:00",
};

export interface ResumenSemana {
  minutosNormales: number;
  minutosTramo1: number;
  minutosTramo2: number;
  minutosFeriado: number;
  minutosNocturnos: number;
  minutosTotales: number;
}
