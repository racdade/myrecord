import type { createClient } from "@/lib/supabase/server";
import { rangoMes, rangoSemanaActual, type RangoFechas } from "@/lib/semana";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export function resolverRango(params: { modo?: string | null; desde?: string | null; hasta?: string | null }): RangoFechas {
  if (params.modo === "mes") return rangoMes();
  if (params.modo === "rango" && params.desde && params.hasta) {
    return { inicio: params.desde, fin: params.hasta };
  }
  return rangoSemanaActual();
}

/**
 * ¿`solicitanteId` puede ver el reporte de `objetivoId`? Sí si es la misma
 * persona, o si `solicitanteId` es admin de un equipo del que `objetivoId`
 * también es miembro.
 */
export async function puedeVerReporteDe(
  supabase: SupabaseServerClient,
  solicitanteId: string,
  objetivoId: string,
): Promise<boolean> {
  if (solicitanteId === objetivoId) return true;

  const { data: membresias } = await supabase
    .from("team_members")
    .select("team_id, rol")
    .eq("user_id", solicitanteId);

  const equiposAdmin = (membresias ?? []).filter((m) => m.rol === "admin").map((m) => m.team_id);
  if (equiposAdmin.length === 0) return false;

  const { data: miembroObjetivo } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", objetivoId)
    .in("team_id", equiposAdmin);

  return (miembroObjetivo ?? []).length > 0;
}
