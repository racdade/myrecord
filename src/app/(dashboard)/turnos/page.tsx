import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { minutosAHoras, minutosNetosTurno } from "@/lib/calc";
import { filaATurno } from "@/lib/shift-mapper";
import { actualizarTurno, borrarTurno, crearTurno } from "./actions";
import { TurnoForm } from "./turno-form";
import { SincronizarButton } from "./sincronizar-button";

const ETIQUETAS_TIPO: Record<string, string> = {
  normal: "Normal",
  feriado: "Feriado",
  libre: "Libre",
};

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

  const [{ data: turnos, error }, { data: membresias }] = await Promise.all([
    supabase.from("shifts").select("*").eq("user_id", user.id).order("fecha", { ascending: false }).limit(60),
    supabase.from("team_members").select("team_id").eq("user_id", user.id),
  ]);

  if (error) {
    throw new Error(error.message);
  }

  const teamId = membresias?.[0]?.team_id;
  let equipo: { id: string; nombre: string } | null = null;
  if (teamId) {
    const { data: equipoRow } = await supabase.from("teams").select("id, nombre").eq("id", teamId).single();
    equipo = equipoRow ?? null;
  }

  const turnoEnEdicion = editar ? turnos?.find((t) => t.id === editar) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{turnoEnEdicion ? "Editar turno" : "Agregar turno"}</CardTitle>
          {!turnoEnEdicion && (
            <Link href="/turnos/importar" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Importar con foto o texto
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {turnoEnEdicion ? (
            <TurnoForm
              key={turnoEnEdicion.id}
              action={actualizarTurno.bind(null, turnoEnEdicion.id)}
              textoBoton="Guardar cambios"
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
            />
          ) : (
            <TurnoForm action={crearTurno} textoBoton="Agregar turno" equipo={equipo} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tus turnos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SincronizarButton />
          {!turnos || turnos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todavía no registras turnos.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Horario</TableHead>
                    <TableHead>Descanso</TableHead>
                    <TableHead>Horas netas</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {turnos.map((turno) => {
                    const horas = minutosAHoras(minutosNetosTurno(filaATurno(turno)));
                    return (
                      <TableRow key={turno.id}>
                        <TableCell>{turno.fecha}</TableCell>
                        <TableCell>{ETIQUETAS_TIPO[turno.tipo] ?? turno.tipo}</TableCell>
                        <TableCell>
                          {turno.tipo === "libre"
                            ? "—"
                            : `${turno.hora_inicio?.slice(0, 5)} – ${turno.hora_fin?.slice(0, 5)}`}
                        </TableCell>
                        <TableCell>{turno.descanso_min} min</TableCell>
                        <TableCell>{horas.toFixed(2)} h</TableCell>
                        <TableCell className="max-w-40 truncate">{turno.nota ?? "—"}</TableCell>
                        <TableCell className="flex justify-end gap-2 text-right">
                          <Link
                            href={`/turnos?editar=${turno.id}`}
                            className={buttonVariants({ variant: "outline", size: "sm" })}
                          >
                            Editar
                          </Link>
                          <form action={borrarTurno.bind(null, turno.id)}>
                            <Button variant="destructive" size="sm" type="submit">
                              Borrar
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
