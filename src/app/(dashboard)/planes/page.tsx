import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";
import { cancelarPlan, guardarPersonasExtra, marcarComoPagado } from "../equipo/actions";

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

  const t = await getTranslations("planes");
  const tc = await getTranslations("comun");

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
            <CardTitle>{t("titulo")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
            <p>
              <strong>{t("personalGratisTitulo")}:</strong> {t("personalGratisDescripcion")}
            </p>
            <p>
              <strong>{t("administracionTitulo")}:</strong> {t("administracionDescripcion")}{" "}
              <code>/equipo</code>.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ETIQUETA_ESTADO: Record<string, string> = {
    trial: t("estadoTrial"),
    activa: t("estadoActiva"),
    vencida: t("estadoVencida"),
    cancelada: t("estadoCancelada"),
  };

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
          <CardTitle>{t("facturacion", { equipo: equipo.nombre })}</CardTitle>
          <Badge variant={activa ? "secondary" : "destructive"}>
            {ETIQUETA_ESTADO[suscripcion.estado] ?? suscripcion.estado}
          </Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {suscripcion.estado === "trial" && (
            <p className="text-sm text-muted-foreground">
              {activa
                ? t("pruebaGratisQuedan", { dias: diasRestantes(suscripcion.trial_fin) })
                : t("pruebaGratisVencio")}
            </p>
          )}
          {suscripcion.estado === "activa" && suscripcion.periodo_fin && (
            <p className="text-sm text-muted-foreground">
              {t("planActivoHasta", { fecha: suscripcion.periodo_fin.slice(0, 10) })}
            </p>
          )}
          {!activa && <p className="text-sm text-destructive">{t("soloLecturaAviso")}</p>}

          <p className="text-sm">{t("personasDeIncluidas", { usadas: personasUsadas ?? 0, limite })}</p>

          <div className="flex flex-wrap gap-2">
            {!activa && (
              <form action={marcarComoPagado.bind(null, equipo.id)}>
                <Button type="submit">{t("marcarComoPagado")}</Button>
              </form>
            )}
            {suscripcion.estado !== "cancelada" && (
              <form action={cancelarPlan.bind(null, equipo.id)}>
                <Button type="submit" variant="destructive">
                  {t("cancelarPlan")}
                </Button>
              </form>
            )}
          </div>

          <p className="text-xs text-muted-foreground">{t("pagoSimuladoAviso")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("personasExtraTitulo")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={guardarPersonasExtra.bind(null, equipo.id)}
            className="flex flex-wrap items-end gap-2"
          >
            <div className="grid gap-1.5">
              <Label htmlFor="personasExtra">
                {t("personasExtraLabel", { incluidas: suscripcion.personas_incluidas })}
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
            <Button type="submit">{tc("guardar")}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
