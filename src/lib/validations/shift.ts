import { z } from "zod";

const horaRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const turnoSchema = z
  .object({
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
    tipo: z.enum(["normal", "feriado", "libre"]),
    horaInicio: z.string().regex(horaRegex, "Hora inválida").optional().or(z.literal("")),
    horaFin: z.string().regex(horaRegex, "Hora inválida").optional().or(z.literal("")),
    descansoMin: z.coerce.number().int("El descanso debe ser un número entero").min(0, "El descanso no puede ser negativo"),
    nota: z.string().max(500, "La nota es muy larga").optional().or(z.literal("")),
  })
  .refine((data) => data.tipo === "libre" || (!!data.horaInicio && !!data.horaFin), {
    message: "La hora de entrada y salida son obligatorias salvo en un día libre.",
    path: ["horaInicio"],
  });

export type TurnoFormValues = z.infer<typeof turnoSchema>;
