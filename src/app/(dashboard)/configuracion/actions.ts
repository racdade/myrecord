"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { COOKIE_IDIOMA, type Locale } from "@/i18n/request";
import type { FormatoHoraDB } from "@/types/database";

export async function actualizarFormatoHora(formato: FormatoHoraDB) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("profiles").update({ formato_hora: formato }).eq("id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/turnos");
  revalidatePath("/reportes");
  revalidatePath("/equipo");
  revalidatePath("/configuracion");
}

export async function cambiarIdioma(locale: Locale) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_IDIOMA, locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  // El idioma afecta a toda la app (layout raíz incluido), así que se
  // revalida todo en vez de una ruta puntual.
  revalidatePath("/", "layout");
}
