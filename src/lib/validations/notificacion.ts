import { z } from "zod";

export const enviarNotificacionSchema = z.object({
  email: z.string().trim().email("Ingresa un correo válido"),
  mensaje: z.string().trim().min(1, "Escribe un mensaje").max(2000, "El mensaje es muy largo"),
});
