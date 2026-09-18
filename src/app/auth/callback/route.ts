import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cifrar } from "@/lib/calendar/crypto";
import { enviarCorreoBienvenida } from "@/lib/email/bienvenida";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/inicio";
  const conectandoCalendar = searchParams.get("calendar") === "1";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Solo guardamos el refresh token cuando el usuario pidió explícitamente
      // conectar Calendar (con scope + consent), no en cada login normal: si
      // no, un re-login sin ese scope pisaría un token bueno con uno inútil.
      const refreshToken = data.session?.provider_refresh_token;
      if (conectandoCalendar && refreshToken && data.user) {
        await supabase
          .from("google_connections")
          .upsert({ user_id: data.user.id, refresh_token: cifrar(refreshToken) });
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("nombre, email, bienvenida_enviada")
          .eq("id", data.user.id)
          .single();

        if (profile && !profile.bienvenida_enviada && (profile.email ?? data.user.email)) {
          await enviarCorreoBienvenida(profile.email ?? data.user.email!, profile.nombre);
          await supabase.from("profiles").update({ bienvenida_enviada: true }).eq("id", data.user.id);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[auth/callback] exchangeCodeForSession error:", error.message, error.status, error.code);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
