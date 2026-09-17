"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, CreditCard, FileText, Home, LayoutDashboard, Users } from "lucide-react";

const TABS = [
  { href: "/", label: "Inicio", Icon: Home },
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/turnos", label: "Turnos", Icon: Clock },
  { href: "/reportes", label: "Reportes", Icon: FileText },
  { href: "/equipo", label: "Equipo", Icon: Users },
  { href: "/planes", label: "Planes", Icon: CreditCard },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-4xl items-stretch justify-around">
        {TABS.map(({ href, label, Icon }) => {
          const activo = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                activo ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <Icon className="size-5" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
