"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { turnoSchema } from "@/lib/validations/shift";
import { borrarEvento, obtenerAccessToken } from "@/lib/calendar/client";

function leerFormulario(formData: FormData) {
  return {
    fecha: String(formData.get("fecha") ?? ""),
    tipo: String(formData.get("tipo") ?? "normal"),
    horaInicio: String(formData.get("horaInicio") ?? ""),
    horaFin: String(formData.get("horaFin") ?? ""),
    descansoMin: String(formData.get("descansoMin") ?? "0"),
    nota: String(formData.get("nota") ?? ""),
  };
}

function leerTeamId(formData: FormData): string | null {
  return String(formData.get("teamId") ?? "").trim() || null;
}

async function usuarioActual() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function crearTurno(formData: FormData) {
  const parsed = turnoSchema.safeParse(leerFormulario(formData));
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos");
  }
  const { fecha, tipo, horaInicio, horaFin, descansoMin, nota } = parsed.data;
  const { supabase, user } = await usuarioActual();

  const { error } = await supabase.from("shifts").insert({
    user_id: user.id,
    fecha,
    tipo,
    hora_inicio: tipo === "libre" ? null : horaInicio,
    hora_fin: tipo === "libre" ? null : horaFin,
    descanso_min: descansoMin,
    nota: nota || null,
    team_id: leerTeamId(formData),
  });

  if (error) throw new Error(error.message);

  revalidatePath("/turnos");
  revalidatePath("/");
}

export async function actualizarTurno(id: string, formData: FormData) {
  const parsed = turnoSchema.safeParse(leerFormulario(formData));
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos");
  }
  const { fecha, tipo, horaInicio, horaFin, descansoMin, nota } = parsed.data;
  const { supabase } = await usuarioActual();

  const { error } = await supabase
    .from("shifts")
    .update({
      fecha,
      tipo,
      hora_inicio: tipo === "libre" ? null : horaInicio,
      hora_fin: tipo === "libre" ? null : horaFin,
      descanso_min: descansoMin,
      nota: nota || null,
      team_id: leerTeamId(formData),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/turnos");
  revalidatePath("/");
}

export async function borrarTurno(id: string) {
  const { supabase, user } = await usuarioActual();

  const { data: turno } = await supabase.from("shifts").select("gcal_event_id").eq("id", id).single();

  const { error } = await supabase.from("shifts").delete().eq("id", id);
  if (error) throw new Error(error.message);

  if (turno?.gcal_event_id) {
    const { data: conexion } = await supabase
      .from("google_connections")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (conexion?.calendar_id) {
      try {
        const accessToken = await obtenerAccessToken(conexion.refresh_token);
        await borrarEvento(accessToken, conexion.calendar_id, turno.gcal_event_id);
      } catch {
        // El turno ya se borró de la app; si Calendar falla, no bloqueamos
        // la acción del usuario por un evento suelto.
      }
    }
  }

  revalidatePath("/turnos");
  revalidatePath("/");
}
