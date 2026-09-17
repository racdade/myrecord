import { describe, expect, it } from "vitest";
import { combinarMensaje, esCumpleanosHoy, mensajeCumpleanosAlAzar } from "./mensajes-animo";

describe("esCumpleanosHoy", () => {
  it("es false si no hay fecha de nacimiento", () => {
    expect(esCumpleanosHoy(null)).toBe(false);
    expect(esCumpleanosHoy(undefined)).toBe(false);
  });

  it("es true cuando el mes y el día coinciden (en America/Lima), sin importar el año de nacimiento", () => {
    const ahora = new Date("2026-03-15T15:00:00Z"); // 10:00 en Lima (UTC-5)
    expect(esCumpleanosHoy("1990-03-15", ahora)).toBe(true);
  });

  it("es false si el día no coincide", () => {
    const ahora = new Date("2026-03-15T15:00:00Z");
    expect(esCumpleanosHoy("1990-03-16", ahora)).toBe(false);
  });

  it("usa el día en America/Lima, no en UTC, cerca de la medianoche", () => {
    // 2026-03-15 23:30 en Lima (UTC-5) es 2026-03-16 04:30 en UTC.
    const ahora = new Date("2026-03-16T04:30:00Z");
    expect(esCumpleanosHoy("1990-03-15", ahora)).toBe(true);
    expect(esCumpleanosHoy("1990-03-16", ahora)).toBe(false);
  });
});

describe("combinarMensaje / mensajeCumpleanosAlAzar", () => {
  const APERTURAS = ["A1", "A2"];
  const CIERRES = ["C1", "C2", "C3"];
  const CUMPLEANOS = ["Feliz cumpleaños!"];

  it("combina una apertura y un cierre de las listas dadas", () => {
    for (let i = 0; i < 20; i++) {
      const mensaje = combinarMensaje(APERTURAS, CIERRES);
      const [apertura, cierre] = mensaje.split(" ");
      expect(APERTURAS).toContain(apertura);
      expect(CIERRES).toContain(cierre);
    }
  });

  it("elige un mensaje de cumpleaños de la lista dada", () => {
    expect(mensajeCumpleanosAlAzar(CUMPLEANOS)).toBe("Feliz cumpleaños!");
  });
});
