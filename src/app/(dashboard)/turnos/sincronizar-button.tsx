"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { sincronizarSemana } from "./sync-actions";

export function SincronizarButton() {
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [esError, setEsError] = useState(false);
  const [pendiente, iniciar] = useTransition();

  function sincronizar() {
    setMensaje(null);
    iniciar(async () => {
      try {
        const resultado = await sincronizarSemana();
        setEsError(false);
        setMensaje(`Listo: se sincronizaron ${resultado.sincronizados} turno(s) de esta semana.`);
      } catch (err) {
        setEsError(true);
        setMensaje(err instanceof Error ? err.message : "No se pudo sincronizar.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" variant="outline" onClick={sincronizar} disabled={pendiente}>
        {pendiente ? "Sincronizando…" : "Sincronizar semana con Google Calendar"}
      </Button>
      {mensaje && (
        <p className={`text-sm ${esError ? "text-destructive" : "text-muted-foreground"}`}>{mensaje}</p>
      )}
    </div>
  );
}
