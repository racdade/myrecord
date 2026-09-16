import { z } from "zod";

const horaRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Forma que le pedimos a la IA (Claude) al leer una foto o texto de horario. */
export const turnoPropuestoSchema = z
  .object({
    fecha: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida")
      .describe("Fecha en formato YYYY-MM-DD, resuelta a partir de la semana de referencia"),
    tipo: z.enum(["normal", "feriado", "libre"]).describe("'libre' si no hay turno ese día"),
    horaInicio: z
      .string()
      .regex(horaRegex, "Hora inválida")
      .nullable()
      .describe("Hora de entrada HH:MM en 24h; null si tipo es 'libre'"),
    horaFin: z
      .string()
      .regex(horaRegex, "Hora inválida")
      .nullable()
      .describe("Hora de salida HH:MM en 24h; null si tipo es 'libre'"),
    descansoMin: z.number().int().min(0).describe("Descanso en minutos, 0 si no se menciona"),
    nota: z.string().nullable().describe("Cualquier detalle adicional del horario original, o null"),
  })
  .refine((turno) => turno.tipo === "libre" || (!!turno.horaInicio && !!turno.horaFin), {
    message: "Un turno que no es 'libre' necesita hora de entrada y salida.",
    path: ["horaInicio"],
  });

export const horarioExtraidoSchema = z.object({
  turnos: z.array(turnoPropuestoSchema),
});

export type TurnoPropuesto = z.infer<typeof turnoPropuestoSchema>;
export type HorarioExtraido = z.infer<typeof horarioExtraidoSchema>;
