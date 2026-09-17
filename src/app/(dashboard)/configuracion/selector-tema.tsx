"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const OPCIONES = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
  { value: "system", label: "Sistema" },
] as const;

export function SelectorTema() {
  const { theme, setTheme } = useTheme();
  // Evita un desajuste de hidratación: el tema real solo se conoce en el
  // cliente (viene de localStorage), no en el primer render del servidor.
  const [montado, setMontado] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- patrón estándar de next-themes para evitar desajustes de hidratación
    setMontado(true);
  }, []);

  return (
    <div className="flex gap-2">
      {OPCIONES.map((opcion) => (
        <Button
          key={opcion.value}
          type="button"
          variant={montado && theme === opcion.value ? "default" : "outline"}
          size="sm"
          onClick={() => setTheme(opcion.value)}
        >
          {opcion.label}
        </Button>
      ))}
    </div>
  );
}
