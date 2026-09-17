"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  reset: () => void;
  /** Link opcional de "volver"; se omite si no aplica (ej. adentro del dashboard). */
  volverHref?: string;
}

export function ErrorState({ reset, volverHref }: ErrorStateProps) {
  const t = useTranslations("errores");

  return (
    <div className="flex min-h-[50svh] flex-col items-center justify-center gap-4 p-6 text-center">
      <AlertTriangle className="size-10 text-muted-foreground" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-medium">{t("titulo")}</h1>
        <p className="max-w-xs text-sm text-muted-foreground">{t("descripcion")}</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={reset}>{t("reintentar")}</Button>
        {volverHref && (
          <a href={volverHref} className="inline-flex">
            <Button variant="outline">{t("volverAlInicio")}</Button>
          </a>
        )}
      </div>
    </div>
  );
}
