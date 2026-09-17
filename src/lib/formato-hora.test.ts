import { describe, expect, it } from "vitest";
import { formatearHora, formatearRangoHora } from "./formato-hora";

describe("formatearHora", () => {
  it("con formato 24h devuelve la hora tal cual (recortada a HH:MM)", () => {
    expect(formatearHora("14:00", "24h")).toBe("14:00");
    expect(formatearHora("14:00:00", "24h")).toBe("14:00");
  });

  it("con formato 12h convierte a a. m. / p. m.", () => {
    expect(formatearHora("14:00", "12h")).toBe("2:00 p. m.");
    expect(formatearHora("09:30", "12h")).toBe("9:30 a. m.");
    expect(formatearHora("00:00", "12h")).toBe("12:00 a. m.");
    expect(formatearHora("12:00", "12h")).toBe("12:00 p. m.");
  });

  it("devuelve vacío si no hay hora", () => {
    expect(formatearHora(null, "24h")).toBe("");
    expect(formatearHora(undefined, "12h")).toBe("");
  });
});

describe("formatearRangoHora", () => {
  it("junta las dos horas con un guion", () => {
    expect(formatearRangoHora("09:00", "18:00", "24h")).toBe("09:00 – 18:00");
  });

  it("devuelve un guion largo si falta alguna hora (turno libre)", () => {
    expect(formatearRangoHora(null, null, "24h")).toBe("—");
  });
});
