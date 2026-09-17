import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { esCumpleanosHoy, mensajeAlAzar, mensajeCumpleanos } from "@/lib/mensajes-animo";

const ACCESOS_RAPIDOS = [
  { href: "/dashboard", titulo: "Dashboard", descripcion: "Tus horas, extras y pago estimado de la semana." },
  { href: "/turnos", titulo: "Turnos", descripcion: "Registra un turno a mano o con foto/texto." },
  { href: "/reportes", titulo: "Reportes", descripcion: "Tendencias, calendario y exportar a CSV/PDF." },
  { href: "/equipo", titulo: "Equipo", descripcion: "Tu equipo, si administras o eres parte de uno." },
];

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

  const esCumpleanos = esCumpleanosHoy(profile?.fecha_nacimiento);
  const mensaje = esCumpleanos ? mensajeCumpleanos() : mensajeAlAzar();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 py-6">
        <h1 className="text-3xl font-medium tracking-wide">
          {esCumpleanos
            ? profile?.nombre
              ? `¡Feliz cumpleaños, ${profile.nombre}!`
              : "¡Feliz cumpleaños!"
            : profile?.nombre
              ? `Hola, ${profile.nombre}`
              : "Hola"}
        </h1>
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
