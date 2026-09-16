"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { turnoSchema } from "@/lib/validations/shift";

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
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/turnos");
  revalidatePath("/");
}

export async function borrarTurno(id: string) {
  const { supabase } = await usuarioActual();
  const { error } = await supabase.from("shifts").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/turnos");
  revalidatePath("/");
}
