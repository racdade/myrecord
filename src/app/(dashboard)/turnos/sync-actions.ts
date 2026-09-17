"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { rangoSemanaActual } from "@/lib/semana";
import { filaATurno } from "@/lib/shift-mapper";
import { actualizarEvento, borrarEvento, crearCalendarioTurnos, crearEvento, obtenerAccessToken } from "@/lib/calendar/client";

export async function sincronizarSemana(): Promise<{ sincronizados: number }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: conexion } = await supabase
    .from("google_connections")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!conexion) {
    throw new Error("Conecta Google Calendar primero (desde el Dashboard).");
  }

  const accessToken = await obtenerAccessToken(conexion.refresh_token);

  let calendarId = conexion.calendar_id;
  if (!calendarId) {
    calendarId = await crearCalendarioTurnos(accessToken);
    await supabase.from("google_connections").update({ calendar_id: calendarId }).eq("user_id", user.id);
  }

  const { inicio, fin } = rangoSemanaActual();
  const { data: turnos, error } = await supabase
    .from("shifts")
    .select("*")
    .eq("user_id", user.id)
    .gte("fecha", inicio)
    .lte("fecha", fin);

  if (error) throw new Error(error.message);

  let sincronizados = 0;

  for (const fila of turnos ?? []) {
    if (fila.tipo === "libre") {
      if (fila.gcal_event_id) {
        await borrarEvento(accessToken, calendarId, fila.gcal_event_id);
        await supabase.from("shifts").update({ gcal_event_id: null }).eq("id", fila.id);
      }
      continue;
    }

    const turno = filaATurno(fila);
    if (fila.gcal_event_id) {
      await actualizarEvento(accessToken, calendarId, fila.gcal_event_id, turno);
    } else {
      const eventId = await crearEvento(accessToken, calendarId, turno);
      await supabase.from("shifts").update({ gcal_event_id: eventId }).eq("id", fila.id);
    }
    sincronizados++;
  }

  revalidatePath("/turnos");
  return { sincronizados };
}
