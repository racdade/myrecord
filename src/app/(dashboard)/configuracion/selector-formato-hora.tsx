"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { FormatoHoraDB } from "@/types/database";
import { actualizarFormatoHora } from "./actions";

const OPCIONES: FormatoHoraDB[] = ["24h", "12h"];

export function SelectorFormatoHora({ valorActual }: { valorActual: FormatoHoraDB }) {
  const t = useTranslations("configuracion.formatoHora");
  const [pendiente, iniciar] = useTransition();

  const ETIQUETAS: Record<FormatoHoraDB, string> = {
    "24h": t("formato24"),
    "12h": t("formato12"),
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      {OPCIONES.map((opcion) => (
        <Button
          key={opcion}
          type="button"
          variant={valorActual === opcion ? "default" : "outline"}
          size="sm"
          disabled={pendiente}
          onClick={() => iniciar(() => actualizarFormatoHora(opcion))}
        >
          {ETIQUETAS[opcion]}
        </Button>
      ))}
    </div>
  );
}
