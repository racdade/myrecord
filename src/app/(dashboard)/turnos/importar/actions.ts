"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { turnoSchema } from "@/lib/validations/shift";
import { interpretarHorarioFoto, interpretarHorarioTexto } from "@/lib/ai/schedule-parser";
import type { TurnoPropuesto } from "@/lib/validations/schedule-import";
import type { OrigenTurnoDB } from "@/types/database";

const MIME_PERMITIDOS = new Set(["image/jpeg", "image/png", "image/webp"]);
const TAMANO_MAX_BYTES = 8 * 1024 * 1024;

async function usuarioActual() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export type ResultadoInterpretacion =
  | { ok: true; scheduleImportId: string; turnos: TurnoPropuesto[] }
  | { ok: false; error: string };

export async function interpretarHorario(formData: FormData): Promise<ResultadoInterpretacion> {
  const { supabase, user } = await usuarioActual();

  const semanaInicio = String(formData.get("semanaInicio") ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(semanaInicio)) {
    return { ok: false, error: "Elige la semana del horario." };
  }

  const texto = String(formData.get("texto") ?? "").trim();
  const nombrePersona = String(formData.get("nombrePersona") ?? "").trim() || undefined;
  const foto = formData.get("foto");
  const tieneFoto = foto instanceof File && foto.size > 0;

  if (!texto && !tieneFoto) {
    return { ok: false, error: "Escribe el horario o sube una foto." };
  }

  let imagenPath: string | null = null;
  let turnos: TurnoPropuesto[];

  try {
    if (tieneFoto) {
      const archivo = foto as File;
      if (!MIME_PERMITIDOS.has(archivo.type)) {
        return { ok: false, error: "La foto debe ser JPG, PNG o WEBP." };
      }
      if (archivo.size > TAMANO_MAX_BYTES) {
        return { ok: false, error: "La foto es muy pesada (máximo 8 MB)." };
      }

      const bytes = new Uint8Array(await archivo.arrayBuffer());
      const nombreSeguro = archivo.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      imagenPath = `${user.id}/${Date.now()}-${nombreSeguro}`;

      const { error: errorSubida } = await supabase.storage
        .from("horarios")
        .upload(imagenPath, bytes, { contentType: archivo.type });
      if (errorSubida) throw new Error(errorSubida.message);

      const base64 = Buffer.from(bytes).toString("base64");
      turnos = await interpretarHorarioFoto(
        base64,
        archivo.type as "image/jpeg" | "image/png" | "image/webp",
        semanaInicio,
        nombrePersona,
      );
    } else {
      turnos = await interpretarHorarioTexto(texto, semanaInicio, nombrePersona);
    }
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : "Error desconocido";
    await supabase.from("schedule_imports").insert({
      user_id: user.id,
      imagen_path: imagenPath,
      texto: texto || null,
      resultado_json: { error: mensaje },
      estado: "error",
    });
    return { ok: false, error: "No se pudo leer el horario. Intenta de nuevo o regístralo a mano." };
  }

  const { data: importacion, error: errorInsert } = await supabase
    .from("schedule_imports")
    .insert({
      user_id: user.id,
      imagen_path: imagenPath,
      texto: texto || null,
      resultado_json: { turnos },
      estado: "listo",
    })
    .select("id")
    .single();

  if (errorInsert || !importacion) {
    return { ok: false, error: "No se pudo guardar la importación." };
  }

  if (turnos.length === 0) {
    return {
      ok: false,
      error: "No se reconoció ningún turno. Intenta con otra foto o un texto más detallado.",
    };
  }

  return { ok: true, scheduleImportId: importacion.id, turnos };
}

interface FilaConfirmada {
  fecha: string;
  tipo: string;
  horaInicio: string;
  horaFin: string;
  descansoMin: string;
  nota: string;
}

export async function guardarTurnosImportados(
  scheduleImportId: string,
  origen: Extract<OrigenTurnoDB, "texto" | "foto">,
  filas: FilaConfirmada[],
) {
  const { supabase, user } = await usuarioActual();

  if (filas.length === 0) {
    throw new Error("No hay turnos para guardar.");
  }

  const turnosValidados = filas.map((fila) => {
    const parsed = turnoSchema.safeParse(fila);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos");
    }
    return parsed.data;
  });

  const nuevosTurnos = turnosValidados.map((turno) => ({
    user_id: user.id,
    fecha: turno.fecha,
    tipo: turno.tipo,
    hora_inicio: turno.tipo === "libre" ? null : turno.horaInicio,
    hora_fin: turno.tipo === "libre" ? null : turno.horaFin,
    descanso_min: turno.descansoMin,
    nota: turno.nota || null,
    origen,
  }));

  const { error: errorInsert } = await supabase.from("shifts").insert(nuevosTurnos);
  if (errorInsert) throw new Error(errorInsert.message);

  await supabase
    .from("schedule_imports")
    .update({ estado: "confirmado" })
    .eq("id", scheduleImportId);

  revalidatePath("/turnos");
  revalidatePath("/");
  redirect("/turnos");
}
