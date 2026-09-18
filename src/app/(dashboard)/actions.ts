"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const ajustesSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(100, "El nombre es muy largo"),
  fechaNacimiento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida")
    .optional()
    .or(z.literal("")),
  tarifaHora: z.coerce.number().min(0, "La tarifa no puede ser negativa"),
  horasDia: z.coerce.number().min(1).max(24),
  horasSemana: z.coerce.number().min(1).max(168),
  modo: z.enum(["dia", "semana", "ambos"]),
  tramo1Horas: z.coerce.number().min(0),
  tramo1Pct: z.coerce.number().min(0).max(5),
  tramo2Pct: z.coerce.number().min(0).max(5),
});

export async function actualizarAjustes(formData: FormData) {
  const parsed = ajustesSchema.safeParse({
    nombre: formData.get("nombre"),
    fechaNacimiento: formData.get("fechaNacimiento"),
    tarifaHora: formData.get("tarifaHora"),
    horasDia: formData.get("horasDia"),
    horasSemana: formData.get("horasSemana"),
    modo: formData.get("modo"),
    tramo1Horas: formData.get("tramo1Horas"),
    tramo1Pct: formData.get("tramo1Pct"),
    tramo2Pct: formData.get("tramo2Pct"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos");
  }

  const { nombre, fechaNacimiento, tarifaHora, horasDia, horasSemana, modo, tramo1Horas, tramo1Pct, tramo2Pct } =
    parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ error: errorPerfil }, { error: errorReglas }] = await Promise.all([
    supabase
      .from("profiles")
      .update({ nombre, tarifa_hora: tarifaHora, fecha_nacimiento: fechaNacimiento || null })
      .eq("id", user.id),
    supabase
      .from("overtime_rules")
      .update({
        horas_dia: horasDia,
        horas_semana: horasSemana,
        modo,
        tramo1_horas: tramo1Horas,
        tramo1_pct: tramo1Pct,
        tramo2_pct: tramo2Pct,
      })
      .eq("user_id", user.id),
  ]);

  if (errorPerfil) throw new Error(errorPerfil.message);
  if (errorReglas) throw new Error(errorReglas.message);

  revalidatePath("/inicio");
  revalidatePath("/dashboard");
}
