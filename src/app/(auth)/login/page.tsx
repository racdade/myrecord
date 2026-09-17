"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

function BotonGoogle() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function iniciarSesion() {
    setCargando(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) {
        setError("No se pudo iniciar sesión. Intenta de nuevo.");
        setCargando(false);
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo iniciar sesión. Intenta de nuevo.");
      setCargando(false);
    }
  }

  return (
    <>
      <Button onClick={iniciarSesion} disabled={cargando} size="lg">
        {cargando ? "Redirigiendo…" : "Continuar con Google"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true">
          <path
            d="M40.4 19.6 A17 17 0 1 1 32 9"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15 16 L24 24 L37.5 9.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h1 className="text-2xl font-medium tracking-wide">Turnia</h1>
        <p className="max-w-xs text-sm text-muted-foreground">
          Registra tus horas de trabajo y horas extra.
        </p>
      </div>
      <Suspense fallback={<Button size="lg" disabled>Cargando…</Button>}>
        <BotonGoogle />
      </Suspense>
    </div>
  );
}
