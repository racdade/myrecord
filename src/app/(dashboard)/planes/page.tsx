import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";
import { cancelarPlan, guardarPersonasExtra, marcarComoPagado } from "../equipo/actions";

const ETIQUETA_ESTADO: Record<string, string> = {
  trial: "En prueba",
  activa: "Activa",
  vencida: "Vencida",
  cancelada: "Cancelada",
};

function diasRestantes(fechaISO: string): number {
  const diff = new Date(fechaISO).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

export default async function PlanesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membresias } = await supabase
    .from("team_members")
    .select("team_id, rol")
    .eq("user_id", user.id);
  const membresia = membresias?.[0];

  if (!membresia || membresia.rol !== "admin") {
    return (
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Planes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
            <p>
              <strong>Personal (gratis):</strong> registra y ve solo tus propias horas. Incluye foto,
              texto, dashboard y (más adelante) Google Calendar.
            </p>
            <p>
              <strong>Administración:</strong> crea un equipo, invita personas y ve las horas de todos.
              Se administra desde <code>/equipo</code>.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [{ data: equipo }, { data: suscripcion }, { count: personasUsadas }] = await Promise.all([
    supabase.from("teams").select("id, nombre").eq("id", membresia.team_id).single(),
    supabase.from("subscriptions").select("*").eq("team_id", membresia.team_id).single(),
    supabase
      .from("team_members")
      .select("user_id", { count: "exact", head: true })
      .eq("team_id", membresia.team_id),
  ]);

  if (!equipo || !suscripcion) redirect("/equipo");

  const activa = suscripcion.estado === "activa" || (suscripcion.estado === "trial" && new Date(suscripcion.trial_fin) > new Date());
  const limite = suscripcion.personas_incluidas + suscripcion.personas_extra;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Facturación — {equipo.nombre}</CardTitle>
          <Badge variant={activa ? "secondary" : "destructive"}>
            {ETIQUETA_ESTADO[suscripcion.estado] ?? suscripcion.estado}
          </Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {suscripcion.estado === "trial" && (
            <p className="text-sm text-muted-foreground">
              {activa
                ? `Prueba gratis: quedan ${diasRestantes(suscripcion.trial_fin)} día(s).`
                : "Tu prueba gratis venció."}
            </p>
          )}
          {suscripcion.estado === "activa" && suscripcion.periodo_fin && (
            <p className="text-sm text-muted-foreground">
              Plan activo hasta {suscripcion.periodo_fin.slice(0, 10)}.
            </p>
          )}
          {!activa && (
            <p className="text-sm text-destructive">
              El equipo está en modo solo lectura: no se pueden crear turnos de equipo ni invitar hasta
              renovar.
            </p>
          )}

          <p className="text-sm">
            Personas: {personasUsadas ?? 0} de {limite} incluidas.
          </p>

          <div className="flex flex-wrap gap-2">
            {!activa && (
              <form action={marcarComoPagado.bind(null, equipo.id)}>
                <Button type="submit">Marcar como pagado (prueba)</Button>
              </form>
            )}
            {suscripcion.estado !== "cancelada" && (
              <form action={cancelarPlan.bind(null, equipo.id)}>
                <Button type="submit" variant="destructive">
                  Cancelar plan
                </Button>
              </form>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            El pago todavía es simulado — no hay una pasarela conectada. &quot;Marcar como pagado&quot;
            no cobra nada de verdad.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personas extra</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={guardarPersonasExtra.bind(null, equipo.id)}
            className="flex flex-wrap items-end gap-2"
          >
            <div className="grid gap-1.5">
              <Label htmlFor="personasExtra">
                Personas extra (además de las {suscripcion.personas_incluidas} incluidas)
              </Label>
              <Input
                id="personasExtra"
                name="personasExtra"
                type="number"
                min={0}
                defaultValue={suscripcion.personas_extra}
                className="w-32"
              />
            </div>
            <Button type="submit">Guardar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
