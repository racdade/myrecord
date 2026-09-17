"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/request";
import { cambiarIdioma } from "./actions";

export function SelectorIdioma() {
  const locale = useLocale();
  const t = useTranslations("configuracion.idioma");
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();

  function elegir(nuevoLocale: Locale) {
    iniciar(async () => {
      await cambiarIdioma(nuevoLocale);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant={locale === "es" ? "default" : "outline"}
        size="sm"
        disabled={pendiente}
        onClick={() => elegir("es")}
      >
        {t("espanol")}
      </Button>
      <Button
        type="button"
        variant={locale === "en" ? "default" : "outline"}
        size="sm"
        disabled={pendiente}
        onClick={() => elegir("en")}
      >
        {t("ingles")}
      </Button>
    </div>
  );
}
