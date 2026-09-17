import type { Turno } from "@/lib/calc";
import { descifrar } from "./crypto";

/**
 * Cliente mínimo de la API REST de Google Calendar (sin la librería
 * `googleapis`, para no sumar peso por unas pocas llamadas).
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CALENDAR_API = "https://www.googleapis.com/calendar/v3";
const ZONA_HORARIA = "America/Lima";

/** Deja el detalle de Google en los logs del servidor antes de lanzar un error genérico al usuario. */
async function lanzarErrorConDetalle(respuesta: Response, mensaje: string): Promise<never> {
  const cuerpo = await respuesta.text().catch(() => "");
  console.error(`[calendar] ${mensaje} (HTTP ${respuesta.status})`, cuerpo);
  throw new Error(mensaje);
}

export async function obtenerAccessToken(refreshTokenCifrado: string): Promise<string> {
  const refreshToken = descifrar(refreshTokenCifrado);
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const respuesta = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!respuesta.ok) {
    await lanzarErrorConDetalle(respuesta, "No se pudo renovar el acceso a Google Calendar. Vuelve a conectar tu cuenta.");
  }

  const data = (await respuesta.json()) as { access_token: string };
  return data.access_token;
}

export async function crearCalendarioTurnos(accessToken: string): Promise<string> {
  const respuesta = await fetch(`${CALENDAR_API}/calendars`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ summary: "Turnos de trabajo", timeZone: ZONA_HORARIA }),
  });

  if (!respuesta.ok) {
    await lanzarErrorConDetalle(respuesta, 'No se pudo crear el calendario "Turnos de trabajo".');
  }

  const data = (await respuesta.json()) as { id: string };
  return data.id;
}

function sumarDia(fechaISO: string): string {
  const fecha = new Date(`${fechaISO}T00:00:00Z`);
  fecha.setUTCDate(fecha.getUTCDate() + 1);
  return fecha.toISOString().slice(0, 10);
}

/** Convierte un turno (con hora) a la forma de evento que espera Calendar. */
function turnoAEvento(turno: Turno) {
  const cruzaMedianoche = turno.horaFin! < turno.horaInicio!;
  const fechaFin = cruzaMedianoche ? sumarDia(turno.fecha) : turno.fecha;

  return {
    summary: turno.tipo === "feriado" ? "Turno de trabajo (feriado)" : "Turno de trabajo",
    start: { dateTime: `${turno.fecha}T${turno.horaInicio}:00`, timeZone: ZONA_HORARIA },
    end: { dateTime: `${fechaFin}T${turno.horaFin}:00`, timeZone: ZONA_HORARIA },
  };
}

export async function crearEvento(accessToken: string, calendarId: string, turno: Turno): Promise<string> {
  const respuesta = await fetch(`${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(turnoAEvento(turno)),
  });

  if (!respuesta.ok) await lanzarErrorConDetalle(respuesta, "No se pudo crear el evento en Calendar.");
  const data = (await respuesta.json()) as { id: string };
  return data.id;
}

export async function actualizarEvento(
  accessToken: string,
  calendarId: string,
  eventId: string,
  turno: Turno,
): Promise<void> {
  const respuesta = await fetch(
    `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(turnoAEvento(turno)),
    },
  );

  if (!respuesta.ok) await lanzarErrorConDetalle(respuesta, "No se pudo actualizar el evento en Calendar.");
}

export async function borrarEvento(accessToken: string, calendarId: string, eventId: string): Promise<void> {
  const respuesta = await fetch(
    `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } },
  );

  // 404/410: el evento ya no existe en Calendar; no es un error para nosotros.
  if (!respuesta.ok && respuesta.status !== 404 && respuesta.status !== 410) {
    await lanzarErrorConDetalle(respuesta, "No se pudo borrar el evento en Calendar.");
  }
}
