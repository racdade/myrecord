import { describe, expect, it } from "vitest";
import {
  calcularPagoEstimado,
  minutosNetosTurno,
  minutosNocturnosTurno,
  resumirSemana,
} from "./horas";
import { REGLAS_POR_DEFECTO, type ReglasExtras, type Turno } from "./types";

function turno(parcial: Partial<Turno> & Pick<Turno, "fecha">): Turno {
  return {
    horaInicio: "09:00",
    horaFin: "17:00",
    descansoMin: 0,
    tipo: "normal",
    ...parcial,
  };
}

describe("minutosNetosTurno", () => {
  it("calcula un turno normal dentro del mismo día", () => {
    const t = turno({ fecha: "2026-09-14", horaInicio: "09:00", horaFin: "17:00", descansoMin: 60 });
    expect(minutosNetosTurno(t)).toBe(7 * 60); // 8h brutas - 1h descanso
  });

  it("calcula un turno que cruza la medianoche", () => {
    const t = turno({ fecha: "2026-09-14", horaInicio: "22:00", horaFin: "06:00", descansoMin: 30 });
    expect(minutosNetosTurno(t)).toBe(8 * 60 - 30);
  });

  it("un turno libre no aporta minutos", () => {
    const t = turno({ fecha: "2026-09-14", tipo: "libre", horaInicio: null, horaFin: null });
    expect(minutosNetosTurno(t)).toBe(0);
  });
});

describe("minutosNocturnosTurno", () => {
  it("un turno de día no tiene minutos nocturnos", () => {
    const t = turno({ fecha: "2026-09-14", horaInicio: "06:00", horaFin: "14:00" });
    expect(minutosNocturnosTurno(t, REGLAS_POR_DEFECTO)).toBe(0);
  });

  it("un turno que coincide con toda la ventana nocturna cuenta completo", () => {
    const t = turno({ fecha: "2026-09-14", horaInicio: "22:00", horaFin: "06:00" });
    expect(minutosNocturnosTurno(t, REGLAS_POR_DEFECTO)).toBe(8 * 60);
  });

  it("solo cuenta la parte del turno dentro de la ventana nocturna", () => {
    const t = turno({ fecha: "2026-09-14", horaInicio: "20:00", horaFin: "23:00" });
    // Ventana nocturna por defecto: 22:00-06:00 -> se solapan 22:00-23:00 (1h).
    expect(minutosNocturnosTurno(t, REGLAS_POR_DEFECTO)).toBe(60);
  });
});

describe("resumirSemana", () => {
  it("modo 'dia': el excedente diario es extra, sin tope semanal", () => {
    const reglas: ReglasExtras = { ...REGLAS_POR_DEFECTO, modo: "dia" };
    const turnos = [
      turno({ fecha: "2026-09-14", horaInicio: "08:00", horaFin: "18:00" }), // 10h netas
    ];
    const resumen = resumirSemana(turnos, reglas);
    expect(resumen.minutosNormales).toBe(8 * 60);
    expect(resumen.minutosTramo1).toBe(2 * 60); // primeras 2h extra
    expect(resumen.minutosTramo2).toBe(0);
  });

  it("modo 'dia': más de tramo1Horas de extra reparte entre tramo1 y tramo2", () => {
    const reglas: ReglasExtras = { ...REGLAS_POR_DEFECTO, modo: "dia" };
    const turnos = [
      turno({ fecha: "2026-09-14", horaInicio: "08:00", horaFin: "20:00" }), // 12h netas -> 4h extra
    ];
    const resumen = resumirSemana(turnos, reglas);
    expect(resumen.minutosNormales).toBe(8 * 60);
    expect(resumen.minutosTramo1).toBe(2 * 60);
    expect(resumen.minutosTramo2).toBe(2 * 60);
  });

  it("modo 'semana': ignora el exceso diario y solo mira el total semanal", () => {
    const reglas: ReglasExtras = { ...REGLAS_POR_DEFECTO, modo: "semana" };
    const turnos = Array.from({ length: 6 }, (_, i) =>
      turno({ fecha: `2026-09-${14 + i}`, horaInicio: "08:00", horaFin: "17:00" }), // 9h netas x 6 = 54h
    );
    const resumen = resumirSemana(turnos, reglas);
    expect(resumen.minutosNormales).toBe(48 * 60);
    expect(resumen.minutosTramo1).toBe(2 * 60);
    expect(resumen.minutosTramo2).toBe(4 * 60); // 54h - 48h = 6h extra -> 2h tramo1 + 4h tramo2
  });

  it("modo 'ambos': suma el excedente diario y, si aún sobra, el semanal", () => {
    const reglas: ReglasExtras = { ...REGLAS_POR_DEFECTO, modo: "ambos" };
    const turnos = Array.from({ length: 7 }, (_, i) =>
      turno({ fecha: `2026-09-${8 + i}`, horaInicio: "08:00", horaFin: "17:00" }), // 9h netas x 7 = 63h
    );
    const resumen = resumirSemana(turnos, reglas);
    // Excedente diario: 1h x 7 días = 7h. Lo que queda "normal" es 8h x 7 = 56h,
    // que todavía supera las 48h semanales -> 8h adicionales pasan a extra.
    expect(resumen.minutosNormales).toBe(48 * 60);
    const totalExtra = resumen.minutosTramo1 + resumen.minutosTramo2;
    expect(totalExtra).toBe(15 * 60);
    expect(resumen.minutosTramo1).toBe(2 * 60);
    expect(resumen.minutosTramo2).toBe(13 * 60);
  });

  it("las horas de un turno feriado se cuentan aparte, no como normales ni extra", () => {
    const turnos = [
      turno({ fecha: "2026-09-14", tipo: "feriado", horaInicio: "09:00", horaFin: "17:00" }), // 8h
    ];
    const resumen = resumirSemana(turnos, REGLAS_POR_DEFECTO);
    expect(resumen.minutosFeriado).toBe(8 * 60);
    expect(resumen.minutosNormales).toBe(0);
    expect(resumen.minutosTramo1).toBe(0);
    expect(resumen.minutosTramo2).toBe(0);
  });

  it("un día libre no suma minutos", () => {
    const turnos = [turno({ fecha: "2026-09-14", tipo: "libre", horaInicio: null, horaFin: null })];
    const resumen = resumirSemana(turnos, REGLAS_POR_DEFECTO);
    expect(resumen.minutosTotales).toBe(0);
  });
});

describe("calcularPagoEstimado", () => {
  it("aplica tarifa, recargos por tramo/feriado y el recargo nocturno aparte", () => {
    const resumen = {
      minutosNormales: 8 * 60,
      minutosTramo1: 2 * 60,
      minutosTramo2: 1 * 60,
      minutosFeriado: 0,
      minutosNocturnos: 60,
      minutosTotales: 11 * 60,
    };
    const tarifaHora = 20; // S/ 20 la hora
    const pago = calcularPagoEstimado(resumen, tarifaHora, REGLAS_POR_DEFECTO);

    const esperado =
      8 * 20 + // normales
      2 * 20 * 1.25 + // tramo1
      1 * 20 * 1.35 + // tramo2
      1 * 20 * 0.35; // recargo nocturno de 1h

    expect(pago).toBeCloseTo(esperado, 6);
  });
});
