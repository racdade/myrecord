import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";

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
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2 p-4">
          <nav className="flex flex-wrap gap-4 text-sm font-medium">
            <Link href="/">Dashboard</Link>
            <Link href="/turnos">Turnos</Link>
            <Link href="/reportes">Reportes</Link>
            <Link href="/equipo">Equipo</Link>
            <Link href="/planes">Planes</Link>
          </nav>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto max-w-4xl p-4">{children}</main>
    </div>
  );
}
