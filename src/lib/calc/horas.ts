import type { ReglasExtras, ResumenSemana, Turno } from "./types";

const MINUTOS_POR_DIA = 24 * 60;

function parseHoraAMinutos(hora: string): number {
  const [horas, minutos] = hora.split(":").map(Number);
  return horas * 60 + minutos;
}

/**
 * Minutos brutos de un turno (sin descontar el descanso). Si la hora de fin
 * es menor o igual a la de inicio, se asume que el turno cruza la medianoche.
 */
function minutosBrutosTurno(horaInicio: string, horaFin: string): number {
  const inicio = parseHoraAMinutos(horaInicio);
  const fin = parseHoraAMinutos(horaFin);
  const bruto = fin - inicio;
  return bruto > 0 ? bruto : bruto + MINUTOS_POR_DIA;
}

/** Minutos netos trabajados en un turno (bruto menos descanso). */
export function minutosNetosTurno(turno: Turno): number {
  if (turno.tipo === "libre" || !turno.horaInicio || !turno.horaFin) return 0;
  const bruto = minutosBrutosTurno(turno.horaInicio, turno.horaFin);
  return Math.max(0, bruto - turno.descansoMin);
}

function dentroDeVentanaNocturna(
  minutoDelDia: number,
  inicioNocturno: number,
  finNocturno: number,
): boolean {
  if (inicioNocturno === finNocturno) return false;
  if (inicioNocturno < finNocturno) {
    return minutoDelDia >= inicioNocturno && minutoDelDia < finNocturno;
  }
  // La ventana nocturna cruza la medianoche (ej. 22:00-06:00).
  return minutoDelDia >= inicioNocturno || minutoDelDia < finNocturno;
}

/**
 * Minutos de un turno que caen dentro de la ventana nocturna configurada.
 * Se calcula sobre el bruto (no se sabe en qué momento del turno ocurre el
 * descanso), así que en resumirSemana se limita al total de minutos netos.
 */
export function minutosNocturnosTurno(turno: Turno, reglas: ReglasExtras): number {
  if (turno.tipo === "libre" || !turno.horaInicio || !turno.horaFin) return 0;

  const inicio = parseHoraAMinutos(turno.horaInicio);
  const fin = inicio + minutosBrutosTurno(turno.horaInicio, turno.horaFin);
  const inicioNocturno = parseHoraAMinutos(reglas.nocturnoInicio);
  const finNocturno = parseHoraAMinutos(reglas.nocturnoFin);

  let minutos = 0;
  for (let m = inicio; m < fin; m++) {
    if (dentroDeVentanaNocturna(m % MINUTOS_POR_DIA, inicioNocturno, finNocturno)) {
      minutos++;
    }
  }
  return minutos;
}

/**
 * Reparte las horas de una semana (o cualquier rango de turnos) en normales,
 * extra tramo 1 / tramo 2, feriado y nocturnas.
 *
 * Criterio para modo "ambos" (no es asesoría legal, ver PLAN.md §2.8):
 * primero se separa el excedente diario de cada día por encima de
 * `horasDia`; con las horas que quedan clasificadas como "normales" se
 * revisa si el total semanal aún supera `horasSemana` y, de ser así, ese
 * remanente también pasa a extra. Así ninguna hora se cuenta dos veces.
 *
 * El tramo 1 / tramo 2 (25% / 35% por defecto) se aplica sobre el total de
 * horas extra de la semana ya sumadas, no por día, para no tener que decidir
 * en qué orden ocurrieron las horas extra cuando hay varios turnos.
 */
export function resumirSemana(turnos: Turno[], reglas: ReglasExtras): ResumenSemana {
  const netosPorDia = new Map<string, number>();
  let minutosFeriado = 0;
  let minutosNocturnos = 0;

  for (const turno of turnos) {
    if (turno.tipo === "libre") continue;

    const netos = minutosNetosTurno(turno);
    minutosNocturnos += Math.min(minutosNocturnosTurno(turno, reglas), netos);

    if (turno.tipo === "feriado") {
      minutosFeriado += netos;
      continue;
    }

    netosPorDia.set(turno.fecha, (netosPorDia.get(turno.fecha) ?? 0) + netos);
  }

  const limiteDiaMin = reglas.horasDia * 60;
  const aplicaLimiteDiario = reglas.modo === "dia" || reglas.modo === "ambos";

  let minutosNormales = 0;
  let minutosExtra = 0;

  for (const netosDia of netosPorDia.values()) {
    if (!aplicaLimiteDiario) {
      minutosNormales += netosDia;
      continue;
    }
    const extraDia = Math.max(0, netosDia - limiteDiaMin);
    minutosExtra += extraDia;
    minutosNormales += netosDia - extraDia;
  }

  const aplicaLimiteSemanal = reglas.modo === "semana" || reglas.modo === "ambos";
  if (aplicaLimiteSemanal) {
    const limiteSemanaMin = reglas.horasSemana * 60;
    const excedente = Math.max(0, minutosNormales - limiteSemanaMin);
    minutosExtra += excedente;
    minutosNormales -= excedente;
  }

  const limiteTramo1Min = reglas.tramo1Horas * 60;
  const minutosTramo1 = Math.min(minutosExtra, limiteTramo1Min);
  const minutosTramo2 = Math.max(0, minutosExtra - limiteTramo1Min);

  return {
    minutosNormales,
    minutosTramo1,
    minutosTramo2,
    minutosFeriado,
    minutosNocturnos,
    minutosTotales: minutosNormales + minutosTramo1 + minutosTramo2 + minutosFeriado,
  };
}

/**
 * Pago estimado = horas × tarifa, con recargo por tramo de extra y feriado,
 * más un recargo nocturno adicional. El recargo nocturno se suma aparte y no
 * se compone con el de tramo/feriado (ej. una hora extra Y nocturna no
 * multiplica ambos recargos) — simplificación intencional para la Fase 1.
 */
export function calcularPagoEstimado(
  resumen: ResumenSemana,
  tarifaHora: number,
  reglas: ReglasExtras,
): number {
  const tarifaMin = tarifaHora / 60;

  const pagoBase =
    resumen.minutosNormales * tarifaMin +
    resumen.minutosTramo1 * tarifaMin * (1 + reglas.tramo1Pct) +
    resumen.minutosTramo2 * tarifaMin * (1 + reglas.tramo2Pct) +
    resumen.minutosFeriado * tarifaMin * (1 + reglas.feriadoPct);

  const recargoNocturno = resumen.minutosNocturnos * tarifaMin * reglas.nocturnoPct;

  return pagoBase + recargoNocturno;
}

export function minutosAHoras(minutos: number): number {
  return minutos / 60;
}
