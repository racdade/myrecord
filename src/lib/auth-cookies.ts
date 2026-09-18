"use client";

/**
 * Borra cookies de intentos de login anteriores que quedaron a medias
 * (code-verifier de PKCE). Si se acumulan varias, el navegador puede acabar
 * mandando la del intento equivocado y Supabase responde "flow state not
 * found" aunque el login se haga bien. Llamar antes de cada signInWithOAuth
 * nuevo para que siempre arranque de cero.
 */
export function limpiarCookiesDeIntentosAnteriores() {
  for (const cookie of document.cookie.split(";")) {
    const nombre = cookie.split("=")[0]?.trim();
    if (nombre && /^sb-.*-code-verifier$/.test(nombre)) {
      document.cookie = `${nombre}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  }
}
