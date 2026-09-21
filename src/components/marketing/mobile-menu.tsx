"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./language-switcher";

export function MobileMenu() {
  const t = useTranslations("marketing.nav");
  const [abierto, setAbierto] = useState(false);

  const ENLACES = [
    { href: "#como-funciona", label: t("comoFunciona") },
    { href: "#precios", label: t("precios") },
    { href: "#nosotros", label: t("nosotros") },
  ];

  return (
    <div className="md:hidden">
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="rounded-full bg-[#0A0A0A] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-70"
        >
          {t("empezar")}
        </Link>
        <button
          type="button"
          aria-expanded={abierto}
          aria-controls="menu-movil"
          aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setAbierto((v) => !v)}
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5"
        >
          <span
            className={`h-[2px] w-5 bg-[#0A0A0A] transition-transform duration-300 ${
              abierto ? "translate-y-[3.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-[2px] w-5 bg-[#0A0A0A] transition-transform duration-300 ${
              abierto ? "-translate-y-[3.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>
      {abierto && (
        <div
          id="menu-movil"
          className="absolute inset-x-0 top-full border-b border-[#E8E8E8] bg-white px-6 py-5 shadow-sm"
        >
          <nav className="flex flex-col gap-4 text-[15px] font-medium" aria-label="Menú móvil">
            {ENLACES.map((enlace) => (
              <a key={enlace.href} href={enlace.href} onClick={() => setAbierto(false)}>
                {enlace.label}
              </a>
            ))}
          </nav>
          <div className="mt-5 border-t border-[#E8E8E8] pt-4">
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </div>
  );
}
