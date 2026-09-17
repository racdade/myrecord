import { z } from "zod";

export const crearEquipoSchema = z.object({
  nombre: z.string().min(1, "Ponle un nombre al equipo").max(100, "El nombre es muy largo"),
});

export const invitarSchema = z.object({
  rol: z.enum(["admin", "miembro"]),
});
