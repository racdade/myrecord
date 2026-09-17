import { createClient } from "@/lib/supabase/server";

/**
 * Módulo de pagos, aislado de la pasarela elegida (PLAN.md §4.6). Hoy no hay
 * cuenta de Culqi conectada, así que `procesarPagoExitoso` simula un cobro.
 * El día que se conecte una pasarela real, su webhook llama a esta misma
 * función (o una con la misma firma) — el resto de la app no cambia.
 */

const DIAS_PRUEBA = 14;
const DIAS_PERIODO = 30;
const PERSONAS_INCLUIDAS_POR_DEFECTO = 5;

export async function crearSuscripcionTrial(ownerId: string, teamId: string) {
  const supabase = await createClient();
  const trialFin = new Date(Date.now() + DIAS_PRUEBA * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase.from("subscriptions").insert({
    owner_id: ownerId,
    team_id: teamId,
    plan: "admin",
    estado: "trial",
    personas_incluidas: PERSONAS_INCLUIDAS_POR_DEFECTO,
    personas_extra: 0,
    trial_fin: trialFin,
  });

  if (error) throw new Error(error.message);
}

/** Simulado por ahora: marca la suscripción como pagada por 30 días más. */
export async function procesarPagoExitoso(teamId: string) {
  const supabase = await createClient();
  const periodoFin = new Date(Date.now() + DIAS_PERIODO * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from("subscriptions")
    .update({ estado: "activa", periodo_fin: periodoFin, proveedor: "simulado" })
    .eq("team_id", teamId);

  if (error) throw new Error(error.message);
}

export async function cancelarSuscripcion(teamId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("subscriptions").update({ estado: "cancelada" }).eq("team_id", teamId);
  if (error) throw new Error(error.message);
}

export async function actualizarPersonasExtra(teamId: string, personasExtra: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("subscriptions")
    .update({ personas_extra: personasExtra })
    .eq("team_id", teamId);
  if (error) throw new Error(error.message);
}
