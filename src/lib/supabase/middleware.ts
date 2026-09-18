import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresca la sesión de Supabase en cada request antes de que llegue a un
 * Server Component. Sin esto, una sesión expirada no se renueva y el usuario
 * queda deslogueado aunque tenga un refresh token válido.
 */
export async function updateSession(request: NextRequest) {
  // El intercambio del código PKCE en /auth/callback depende de la cookie
  // del "code verifier" puesta por el cliente al iniciar el login. Si este
  // middleware llama getUser() antes de esa ruta, puede terminar limpiando
  // esa cookie (no hay sesión todavía) y el intercambio falla con
  // "invalid flow state, no valid flow state found". Esa ruta no necesita
  // sesión refrescada de todas formas: solo procesa el código y redirige.
  if (request.nextUrl.pathname.startsWith("/auth/callback")) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  await supabase.auth.getUser();

  return supabaseResponse;
}
