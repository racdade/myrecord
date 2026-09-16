import { describe, expect, it } from "vitest";
import { horarioExtraidoSchema, turnoPropuestoSchema } from "./schedule-import";

describe("turnoPropuestoSchema", () => {
  it("acepta un turno normal válido", () => {
    const resultado = turnoPropuestoSchema.safeParse({
      fecha: "2026-09-21",
      tipo: "normal",
      horaInicio: "09:00",
      horaFin: "18:00",
      descansoMin: 60,
      nota: null,
    });
    expect(resultado.success).toBe(true);
  });

  it("acepta un día libre sin horas", () => {
    const resultado = turnoPropuestoSchema.safeParse({
      fecha: "2026-09-21",
      tipo: "libre",
      horaInicio: null,
      horaFin: null,
      descansoMin: 0,
      nota: null,
    });
    expect(resultado.success).toBe(true);
  });

  it("rechaza una fecha con formato inválido", () => {
    const resultado = turnoPropuestoSchema.safeParse({
      fecha: "21/09/2026",
      tipo: "normal",
      horaInicio: "09:00",
      horaFin: "18:00",
      descansoMin: 0,
      nota: null,
    });
    expect(resultado.success).toBe(false);
  });

  it("rechaza una hora fuera de formato HH:MM", () => {
    const resultado = turnoPropuestoSchema.safeParse({
      fecha: "2026-09-21",
      tipo: "normal",
      horaInicio: "9am",
      horaFin: "18:00",
      descansoMin: 0,
      nota: null,
    });
    expect(resultado.success).toBe(false);
  });

  it("rechaza un tipo desconocido", () => {
    const resultado = turnoPropuestoSchema.safeParse({
      fecha: "2026-09-21",
      tipo: "vacaciones",
      horaInicio: null,
      horaFin: null,
      descansoMin: 0,
      nota: null,
    });
    expect(resultado.success).toBe(false);
  });
});

describe("horarioExtraidoSchema", () => {
  it("acepta una lista vacía de turnos", () => {
    const resultado = horarioExtraidoSchema.safeParse({ turnos: [] });
    expect(resultado.success).toBe(true);
  });

  it("rechaza si algún turno de la lista es inválido", () => {
    const resultado = horarioExtraidoSchema.safeParse({
      turnos: [
        {
          fecha: "2026-09-21",
          tipo: "normal",
          horaInicio: "09:00",
          horaFin: "18:00",
          descansoMin: 60,
          nota: null,
        },
        {
          fecha: "2026-09-22",
          tipo: "normal",
          horaInicio: null,
          horaFin: "18:00",
          descansoMin: 60,
          nota: null,
        },
      ],
    });
    expect(resultado.success).toBe(false);
  });
});
