"use client";

import { useState } from "react";
import Link from "next/link";

const ENLACES = [
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#precios", label: "Precios" },
  { href: "#nosotros", label: "Nosotros" },
];

export function MobileMenu() {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="md:hidden">
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="rounded-full bg-[#0A0A0A] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-70"
        >
          Empezar
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
        </div>
      )}
    </div>
  );
}
