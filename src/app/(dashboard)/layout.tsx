import Link from "next/link";
import { Settings } from "lucide-react";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";
import { LlankiaLogo } from "@/components/llankia-logo";
import { BottomNav } from "@/components/bottom-nav";
import { NotificationBell } from "@/components/notification-bell";
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

  const t = await getTranslations("nav");

  return (
    <div className="min-h-svh">
      <header className="border-b" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/dashboard">
              <LlankiaLogo />
            </Link>
            <nav className="hidden flex-wrap gap-4 text-sm font-medium sm:flex">
              <Link href="/dashboard">{t("dashboard")}</Link>
              <Link href="/turnos">{t("turnos")}</Link>
              <Link href="/reportes">{t("reportes")}</Link>
              <Link href="/equipo">{t("equipo")}</Link>
              <Link href="/planes">{t("planes")}</Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Link
              href="/configuracion"
              aria-label={t("configuracion")}
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
