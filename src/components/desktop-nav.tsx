"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const TABS = [
  { href: "/dashboard", key: "dashboard" },
  { href: "/turnos", key: "turnos" },
  { href: "/reportes", key: "reportes" },
  { href: "/equipo", key: "equipo" },
  { href: "/planes", key: "planes" },
] as const;

export function DesktopNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav className="hidden flex-wrap gap-5 text-sm font-medium sm:flex">
      {TABS.map(({ href, key }) => {
        const activo = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`border-b-2 pb-0.5 transition-colors ${
              activo
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );
}
