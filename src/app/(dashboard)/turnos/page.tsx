import Link from "next/link";
import { Clock } from "lucide-react";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { minutosAHoras, minutosExtraTurno, minutosNetosTurno } from "@/lib/calc";
import { filaAReglas, filaATurno } from "@/lib/shift-mapper";
import { formatearRangoHora } from "@/lib/formato-hora";
import { nombreDiaSemana } from "@/lib/dia-semana";
import { actualizarTurno, borrarTurno, crearTurno } from "./actions";
import { TurnoForm } from "./turno-form";
import { SincronizarButton } from "./sincronizar-button";

export default async function TurnosPage({
  searchParams,
}: {
  searchParams: Promise<{ editar?: string }>;
}) {
  const { editar } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: turnosRecientes, error }, { data: membresias }, { data: profile }, { data: reglaRow }, { data: feriados }] =
    await Promise.all([
      // Se piden los 60 más recientes (orden descendente) y se muestran en
      // orden ascendente (más antiguo primero) para que la semana se lea de
      // arriba hacia abajo.
      supabase.from("shifts").select("*").eq("user_id", user.id).order("fecha", { ascending: false }).limit(60),
      supabase.from("team_members").select("team_id").eq("user_id", user.id),
      supabase.from("profiles").select("formato_hora").eq("id", user.id).single(),
      supabase.from("overtime_rules").select("*").eq("user_id", user.id).single(),
      supabase.from("holidays").select("fecha, nombre"),
    ]);

  if (error) {
    throw new Error(error.message);
  }

  const turnos = [...(turnosRecientes ?? [])].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const reglas = filaAReglas(reglaRow);

  const formatoHora = profile?.formato_hora ?? "24h";

  const teamId = membresias?.[0]?.team_id;
  let equipo: { id: string; nombre: string } | null = null;
  if (teamId) {
    const { data: equipoRow } = await supabase.from("teams").select("id, nombre").eq("id", teamId).single();
    equipo = equipoRow ?? null;
  }

  const turnoEnEdicion = editar ? turnos.find((t) => t.id === editar) : undefined;

  const t = await getTranslations("turnos");
  const tc = await getTranslations("comun");
  const locale = await getLocale();

  const ETIQUETAS_TIPO: Record<string, string> = {
    normal: tc("normal"),
    feriado: tc("feriado"),
    libre: tc("libre"),
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{turnoEnEdicion ? t("editarTurno") : t("agregarTurno")}</CardTitle>
          {!turnoEnEdicion && (
            <Link href="/turnos/importar" className={buttonVariants({ variant: "default", size: "sm" })}>
              {t("importarConFotoOTexto")}
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {turnoEnEdicion ? (
            <TurnoForm
              key={turnoEnEdicion.id}
              action={actualizarTurno.bind(null, turnoEnEdicion.id)}
              textoBoton={t("guardarCambios")}
              cancelarHref="/turnos"
              equipo={equipo}
              valoresIniciales={{
                fecha: turnoEnEdicion.fecha,
                tipo: turnoEnEdicion.tipo,
                horaInicio: turnoEnEdicion.hora_inicio?.slice(0, 5) ?? undefined,
                horaFin: turnoEnEdicion.hora_fin?.slice(0, 5) ?? undefined,
                descansoMin: turnoEnEdicion.descanso_min,
                nota: turnoEnEdicion.nota ?? undefined,
                teamId: turnoEnEdicion.team_id,
              }}
              feriados={feriados ?? []}
            />
          ) : (
            <TurnoForm action={crearTurno} textoBoton={t("agregarTurno")} equipo={equipo} feriados={feriados ?? []} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("tusTurnos")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SincronizarButton />
          {turnos.length === 0 ? (
            <EmptyState icon={Clock} mensaje={t("todaviaNoRegistras")} />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{tc("fecha")}</TableHead>
                    <TableHead>{tc("dia")}</TableHead>
                    <TableHead>{tc("tipo")}</TableHead>
                    <TableHead>{tc("horario")}</TableHead>
                    <TableHead>{tc("descanso")}</TableHead>
                    <TableHead>{t("horasNetas")}</TableHead>
                    <TableHead>{t("horasExtra")}</TableHead>
                    <TableHead>{tc("nota")}</TableHead>
                    <TableHead className="text-right">{tc("acciones")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {turnos.map((turno) => {
                    const turnoCalc = filaATurno(turno);
                    const horas = minutosAHoras(minutosNetosTurno(turnoCalc));
                    const horasExtra = minutosAHoras(minutosExtraTurno(turnoCalc, reglas));
                    return (
                      <TableRow key={turno.id}>
                        <TableCell>{turno.fecha}</TableCell>
                        <TableCell className="text-muted-foreground">{nombreDiaSemana(turno.fecha, locale)}</TableCell>
                        <TableCell>{ETIQUETAS_TIPO[turno.tipo] ?? turno.tipo}</TableCell>
                        <TableCell>{formatearRangoHora(turno.hora_inicio, turno.hora_fin, formatoHora)}</TableCell>
                        <TableCell>{turno.descanso_min} min</TableCell>
                        <TableCell>{horas.toFixed(2)} h</TableCell>
                        <TableCell>{horasExtra > 0 ? `${horasExtra.toFixed(2)} h` : "—"}</TableCell>
                        <TableCell className="max-w-40 truncate">{turno.nota ?? "—"}</TableCell>
                        <TableCell className="flex justify-end gap-2 text-right">
                          <Link
                            href={`/turnos?editar=${turno.id}`}
                            className={buttonVariants({ variant: "outline", size: "sm" })}
                          >
                            {tc("editar")}
                          </Link>
                          <form action={borrarTurno.bind(null, turno.id)}>
                            <Button variant="destructive" size="sm" type="submit">
                              {tc("borrar")}
                            </Button>
                          </form>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
