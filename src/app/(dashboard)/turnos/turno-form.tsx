"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TipoTurnoDB } from "@/types/database";

export interface TurnoFormValoresIniciales {
  fecha?: string;
  tipo?: TipoTurnoDB;
  horaInicio?: string;
  horaFin?: string;
  descansoMin?: number;
  nota?: string;
  teamId?: string | null;
}

interface TurnoFormProps {
  action: (formData: FormData) => void;
  valoresIniciales?: TurnoFormValoresIniciales;
  textoBoton: string;
  /** Link de "Cancelar" (modo edición); se omite en el formulario de creación. */
  cancelarHref?: string;
  /** Si la persona pertenece a un equipo, permite marcar el turno como suyo. */
  equipo?: { id: string; nombre: string } | null;
}

export function TurnoForm({ action, valoresIniciales, textoBoton, cancelarHref, equipo }: TurnoFormProps) {
  const [tipo, setTipo] = useState<TipoTurnoDB>(valoresIniciales?.tipo ?? "normal");
  const tc = useTranslations("comun");
  const t = useTranslations("turnos");

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <div className="grid gap-1.5">
        <Label htmlFor="fecha">{tc("fecha")}</Label>
        <Input id="fecha" name="fecha" type="date" defaultValue={valoresIniciales?.fecha} required />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="tipo">{tc("tipo")}</Label>
        <select
          id="tipo"
          name="tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoTurnoDB)}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        >
          <option value="normal">{tc("normal")}</option>
          <option value="feriado">{tc("feriado")}</option>
          <option value="libre">{tc("libre")}</option>
        </select>
      </div>

      {tipo !== "libre" && (
        <>
          <div className="grid gap-1.5">
            <Label htmlFor="horaInicio">{t("horaEntrada")}</Label>
            <Input
              id="horaInicio"
              name="horaInicio"
              type="time"
              defaultValue={valoresIniciales?.horaInicio}
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="horaFin">{t("horaSalida")}</Label>
            <Input id="horaFin" name="horaFin" type="time" defaultValue={valoresIniciales?.horaFin} required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="descansoMin">{t("descansoMin")}</Label>
            <Input
              id="descansoMin"
              name="descansoMin"
              type="number"
              min={0}
              defaultValue={valoresIniciales?.descansoMin ?? 0}
            />
          </div>
        </>
      )}

      <div className="grid gap-1.5 sm:col-span-2">
        <Label htmlFor="nota">{t("notaOpcional")}</Label>
        <Textarea id="nota" name="nota" defaultValue={valoresIniciales?.nota} />
      </div>

      {equipo && (
        <div className="grid gap-1.5">
          <Label htmlFor="teamId">{t("para")}</Label>
          <select
            id="teamId"
            name="teamId"
            defaultValue={valoresIniciales?.teamId ?? ""}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            <option value="">{tc("personal")}</option>
            <option value={equipo.id}>{equipo.nombre}</option>
          </select>
        </div>
      )}

      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit">{textoBoton}</Button>
        {cancelarHref && (
          <Link href={cancelarHref} className={buttonVariants({ variant: "outline" })}>
            {tc("cancelar")}
          </Link>
        )}
      </div>
    </form>
  );
}
