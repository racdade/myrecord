"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { esAdmin } from "@/lib/admin";
import { enviarNotificacionSchema } from "@/lib/validations/notificacion";

export async function enviarNotificacion(email: string, mensaje: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!esAdmin(user.email)) redirect("/dashboard");

  const parsed = enviarNotificacionSchema.safeParse({ email, mensaje });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos");
  }

  const { error } = await supabase.rpc("enviar_notificacion", {
    p_email: parsed.data.email,
    p_mensaje: parsed.data.mensaje,
  });
  if (error) {
    throw new Error(error.message);
  }
}
