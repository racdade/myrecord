"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

const OPCIONES = ["light", "dark", "system"] as const;

export function SelectorTema() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("configuracion.apariencia");
  // Evita un desajuste de hidratación: el tema real solo se conoce en el
  // cliente (viene de localStorage), no en el primer render del servidor.
  const [montado, setMontado] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- patrón estándar de next-themes para evitar desajustes de hidratación
    setMontado(true);
  }, []);

  const ETIQUETAS: Record<(typeof OPCIONES)[number], string> = {
    light: t("claro"),
    dark: t("oscuro"),
    system: t("sistema"),
  };

  return (
    <div className="flex gap-2">
      {OPCIONES.map((opcion) => (
        <Button
          key={opcion}
          type="button"
          variant={montado && theme === opcion ? "default" : "outline"}
          size="sm"
          onClick={() => setTheme(opcion)}
        >
          {ETIQUETAS[opcion]}
        </Button>
      ))}
    </div>
  );
}
