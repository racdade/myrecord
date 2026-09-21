"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/request";
import { cambiarIdioma } from "@/app/(dashboard)/configuracion/actions";

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations("configuracion.idioma");
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();

  function elegir(nuevoLocale: Locale) {
    if (nuevoLocale === locale || pendiente) return;
    iniciar(async () => {
      await cambiarIdioma(nuevoLocale);
      router.refresh();
    });
  }

  return (
    <div className={`flex items-center gap-1 text-[14px] font-medium text-[#6B6B6B] ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => elegir("es")}
        className={`transition-opacity hover:opacity-60 ${locale === "es" ? "text-[#0A0A0A]" : ""}`}
        aria-current={locale === "es"}
      >
        {t("espanol")}
      </button>
      <span aria-hidden="true">/</span>
      <button
        type="button"
        onClick={() => elegir("en")}
        className={`transition-opacity hover:opacity-60 ${locale === "en" ? "text-[#0A0A0A]" : ""}`}
        aria-current={locale === "en"}
      >
        {t("ingles")}
      </button>
    </div>
  );
}
