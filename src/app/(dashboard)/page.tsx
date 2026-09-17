import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { combinarMensaje, esCumpleanosHoy, mensajeCumpleanosAlAzar } from "@/lib/mensajes-animo";

export default async function InicioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nombre, fecha_nacimiento")
    .eq("id", user.id)
    .single();

  const t = await getTranslations("inicio");
  const tMensajes = await getTranslations("mensajesAnimo");

  const esCumpleanos = esCumpleanosHoy(profile?.fecha_nacimiento);
  const mensaje = esCumpleanos
    ? mensajeCumpleanosAlAzar(tMensajes.raw("cumpleanos"))
    : combinarMensaje(tMensajes.raw("aperturas"), tMensajes.raw("cierres"));

  const saludo = esCumpleanos
    ? profile?.nombre
      ? t("cumpleanosConNombre", { nombre: profile.nombre })
      : t("cumpleanosSinNombre")
    : profile?.nombre
      ? t("saludoConNombre", { nombre: profile.nombre })
      : t("saludoSinNombre");

  const ACCESOS_RAPIDOS = [
    { href: "/dashboard", titulo: t("accesoDashboardTitulo"), descripcion: t("accesoDashboardDescripcion") },
    { href: "/turnos", titulo: t("accesoTurnosTitulo"), descripcion: t("accesoTurnosDescripcion") },
    { href: "/reportes", titulo: t("accesoReportesTitulo"), descripcion: t("accesoReportesDescripcion") },
    { href: "/equipo", titulo: t("accesoEquipoTitulo"), descripcion: t("accesoEquipoDescripcion") },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 py-6">
        <h1 className="text-3xl font-medium tracking-wide">{saludo}</h1>
        <p className="text-base text-muted-foreground">{mensaje}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ACCESOS_RAPIDOS.map((acceso) => (
          <Link key={acceso.href} href={acceso.href}>
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle>{acceso.titulo}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{acceso.descripcion}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
