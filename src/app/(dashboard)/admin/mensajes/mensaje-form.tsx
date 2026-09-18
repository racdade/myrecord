"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { enviarNotificacion } from "./actions";

export function MensajeForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [esError, setEsError] = useState(false);
  const [pendiente, iniciar] = useTransition();

  function enviar(formData: FormData) {
    setMensaje(null);
    const email = String(formData.get("email") ?? "");
    const texto = String(formData.get("mensaje") ?? "");
    iniciar(async () => {
      try {
        await enviarNotificacion(email, texto);
        setEsError(false);
        setMensaje("Mensaje enviado.");
        formRef.current?.reset();
      } catch (err) {
        setEsError(true);
        setMensaje(err instanceof Error ? err.message : "No se pudo enviar el mensaje.");
      }
    });
  }

  return (
    <form ref={formRef} action={enviar} className="flex flex-col gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="email">Correo de la persona</Label>
        <Input id="email" name="email" type="email" required placeholder="persona@correo.com" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="mensaje">Mensaje</Label>
        <Textarea id="mensaje" name="mensaje" required rows={5} placeholder="Escribe tu respuesta…" />
      </div>
      <div>
        <Button type="submit" disabled={pendiente}>
          {pendiente ? "Enviando…" : "Enviar mensaje"}
        </Button>
      </div>
      {mensaje && <p className={`text-sm ${esError ? "text-destructive" : "text-muted-foreground"}`}>{mensaje}</p>}
    </form>
  );
}
