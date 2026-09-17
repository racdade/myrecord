"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { crearEquipoSchema, invitarSchema } from "@/lib/validations/equipo";
import {
  actualizarPersonasExtra,
  cancelarSuscripcion,
  crearSuscripcionTrial,
  procesarPagoExitoso,
} from "@/lib/billing/subscriptions";

async function usuarioActual() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function crearEquipo(formData: FormData) {
  const parsed = crearEquipoSchema.safeParse({ nombre: formData.get("nombre") });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos");
  }
  const { supabase, user } = await usuarioActual();

  const { data: equipo, error: errorEquipo } = await supabase
    .from("teams")
    .insert({ nombre: parsed.data.nombre, owner_id: user.id })
    .select("id")
    .single();

  if (errorEquipo || !equipo) {
    throw new Error(errorEquipo?.message ?? "No se pudo crear el equipo.");
  }

  const { error: errorMiembro } = await supabase
    .from("team_members")
    .insert({ team_id: equipo.id, user_id: user.id, rol: "admin" });

  if (errorMiembro) throw new Error(errorMiembro.message);

  await crearSuscripcionTrial(user.id, equipo.id);

  revalidatePath("/equipo");
  revalidatePath("/planes");
}

export async function crearInvitacion(teamId: string, formData: FormData) {
  const parsed = invitarSchema.safeParse({ rol: formData.get("rol") });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos");
  }
  const { supabase } = await usuarioActual();

  const { data: activa } = await supabase.rpc("suscripcion_activa", { p_team_id: teamId });
  if (!activa) {
    throw new Error("El equipo no tiene una suscripción activa. Ve a Planes para renovarla.");
  }

  const { error } = await supabase
    .from("invitations")
    .insert({ team_id: teamId, rol: parsed.data.rol });

  if (error) throw new Error(error.message);

  revalidatePath("/equipo");
}

export async function quitarMiembro(teamId: string, userId: string) {
  const { supabase, user } = await usuarioActual();

  const { data: equipo } = await supabase.from("teams").select("owner_id").eq("id", teamId).single();
  if (equipo?.owner_id === userId && userId !== user.id) {
    throw new Error("No se puede quitar al dueño del equipo.");
  }

  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  revalidatePath("/equipo");
}

export async function marcarComoPagado(teamId: string) {
  await usuarioActual();
  await procesarPagoExitoso(teamId);
  revalidatePath("/equipo");
  revalidatePath("/planes");
}

export async function cancelarPlan(teamId: string) {
  await usuarioActual();
  await cancelarSuscripcion(teamId);
  revalidatePath("/equipo");
  revalidatePath("/planes");
}

export async function guardarPersonasExtra(teamId: string, formData: FormData) {
  await usuarioActual();
  const personasExtra = Number(formData.get("personasExtra") ?? 0);
  if (!Number.isInteger(personasExtra) || personasExtra < 0) {
    throw new Error("El número de personas extra no es válido.");
  }
  await actualizarPersonasExtra(teamId, personasExtra);
  revalidatePath("/planes");
}

export async function salirDeEquipo(teamId: string) {
  const { supabase, user } = await usuarioActual();

  const { data: equipo } = await supabase.from("teams").select("owner_id").eq("id", teamId).single();
  if (equipo?.owner_id === user.id) {
    throw new Error("El dueño no puede salir de su propio equipo.");
  }

  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/equipo");
}
