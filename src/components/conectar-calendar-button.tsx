"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function ConectarCalendarButton() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function conectar() {
    setCargando(true);
    setError(null);
    try {
      const supabase = createClient();
      const params = new URLSearchParams({ next: "/", calendar: "1" });
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          scopes: "https://www.googleapis.com/auth/calendar",
          redirectTo: `${window.location.origin}/auth/callback?${params.toString()}`,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (error) {
        setError("No se pudo conectar. Intenta de nuevo.");
        setCargando(false);
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar. Intenta de nuevo.");
      setCargando(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" onClick={conectar} disabled={cargando}>
        {cargando ? "Redirigiendo…" : "Conectar Google Calendar"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
