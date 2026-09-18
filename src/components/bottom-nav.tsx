"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Clock, CreditCard, FileText, Home, LayoutDashboard, Users } from "lucide-react";

const TABS = [
  { href: "/inicio", key: "inicio", Icon: Home },
  { href: "/dashboard", key: "dashboard", Icon: LayoutDashboard },
  { href: "/turnos", key: "turnos", Icon: Clock },
  { href: "/reportes", key: "reportes", Icon: FileText },
  { href: "/equipo", key: "equipo", Icon: Users },
  { href: "/planes", key: "planes", Icon: CreditCard },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-4xl items-stretch justify-around">
        {TABS.map(({ href, key, Icon }) => {
          const activo = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                activo ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <Icon className="size-5" aria-hidden="true" />
              {t(key)}
              <span className={`mt-0.5 h-0.5 w-6 rounded-full ${activo ? "bg-foreground" : "bg-transparent"}`} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
