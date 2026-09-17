import Link from "next/link";
import { Settings } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";
import { TurniaLogo } from "@/components/turnia-logo";
import { BottomNav } from "@/components/bottom-nav";
import { buttonVariants } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-svh">
      <header className="border-b" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/">
              <TurniaLogo />
            </Link>
            <nav className="hidden flex-wrap gap-4 text-sm font-medium sm:flex">
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/turnos">Turnos</Link>
              <Link href="/reportes">Reportes</Link>
              <Link href="/equipo">Equipo</Link>
              <Link href="/planes">Planes</Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/configuracion"
              aria-label="Configuración"
              className={buttonVariants({ variant: "ghost", size: "icon" })}
            >
              <Settings className="size-4" aria-hidden="true" />
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl p-4 pb-24 sm:pb-4">{children}</main>
      <BottomNav />
    </div>
  );
}
