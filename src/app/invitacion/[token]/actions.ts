"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function aceptarInvitacion(token: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/invitacion/${token}`)}`);

  const { error } = await supabase.rpc("aceptar_invitacion", { p_token: token });
  if (error) throw new Error(error.message);

  redirect("/equipo");
}
