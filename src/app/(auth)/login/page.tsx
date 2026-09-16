"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
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
          redirectTo: `${window.location.origin}/auth/callback`,
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
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold">app-horas</h1>
        <p className="max-w-xs text-sm text-muted-foreground">
          Registra tus horas de trabajo y horas extra.
        </p>
      </div>
      <Button onClick={iniciarSesion} disabled={cargando} size="lg">
        {cargando ? "Redirigiendo…" : "Continuar con Google"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
