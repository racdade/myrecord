import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cifrar } from "@/lib/calendar/crypto";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
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
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[auth/callback] exchangeCodeForSession error:", error.message);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
