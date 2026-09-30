"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { rangoSemanaActual } from "@/lib/semana";
import { filaATurno } from "@/lib/shift-mapper";
import {
  AccesoGoogleVencidoError,
  actualizarEvento,
  borrarEvento,
  buscarCalendarioTurnos,
  crearCalendarioTurnos,
  crearEvento,
  existeCalendario,
  obtenerAccessToken,
} from "@/lib/calendar/client";

type ResultadoSincronizacion = { ok: true; sincronizados: number } | { ok: false; error: string };

/**
 * Los errores se devuelven como dato: si se lanzaran, Next.js en producción
 * reemplaza el mensaje por uno genérico (React error #441) y el usuario no
 * sabría qué pasó.
 */
export async function sincronizarSemana(): Promise<ResultadoSincronizacion> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  try {
    const sincronizados = await sincronizar(supabase, user.id);
    revalidatePath("/turnos");
    return { ok: true, sincronizados };
  } catch (err) {
    console.error("[calendar] Falló la sincronización de la semana", err);
    if (err instanceof AccesoGoogleVencidoError) {
      // La conexión ya no sirve: se borra para que el Dashboard ofrezca conectar de nuevo.
      await supabase.from("google_connections").delete().eq("user_id", user.id);
      revalidatePath("/dashboard");
    }
    return { ok: false, error: err instanceof Error ? err.message : "No se pudo sincronizar." };
  }
}

async function sincronizar(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<number> {
  const { data: conexion } = await supabase
    .from("google_connections")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!conexion) {
    throw new Error("Conecta Google Calendar primero (desde el Dashboard).");
  }

  const accessToken = await obtenerAccessToken(conexion.refresh_token);

  let calendarId = conexion.calendar_id;
  // El calendario "Turnos de trabajo" pudo borrarse a mano: en ese caso se usa otro
  // y los ids de eventos guardados dejan de servir.
  const calendarioPerdido = calendarId !== null && !(await existeCalendario(accessToken, calendarId));
  if (!calendarId || calendarioPerdido) {
    calendarId = (await buscarCalendarioTurnos(accessToken)) ?? (await crearCalendarioTurnos(accessToken));
    await supabase.from("google_connections").update({ calendar_id: calendarId }).eq("user_id", userId);
  }

  const { inicio, fin } = rangoSemanaActual();
  const { data: turnos, error } = await supabase
    .from("shifts")
    .select("*")
    .eq("user_id", userId)
    .gte("fecha", inicio)
    .lte("fecha", fin);

  if (error) throw new Error(error.message);

  let sincronizados = 0;

  for (const fila of turnos ?? []) {
    const eventIdGuardado = calendarioPerdido ? null : fila.gcal_event_id;

    if (fila.tipo === "libre") {
      if (eventIdGuardado) {
        await borrarEvento(accessToken, calendarId, eventIdGuardado);
      }
      if (fila.gcal_event_id) {
        await supabase.from("shifts").update({ gcal_event_id: null }).eq("id", fila.id);
      }
      continue;
    }

    const turno = filaATurno(fila);
    const actualizado = eventIdGuardado !== null && (await actualizarEvento(accessToken, calendarId, eventIdGuardado, turno));
    if (!actualizado) {
      const eventId = await crearEvento(accessToken, calendarId, turno);
      await supabase.from("shifts").update({ gcal_event_id: eventId }).eq("id", fila.id);
    }
    sincronizados++;
  }

  return sincronizados;
}
