import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { calcularPagoEstimado, minutosAHoras, resumirSemana } from "@/lib/calc";
import { filaAReglas, filaATurno } from "@/lib/shift-mapper";
import { rangoSemanaActual } from "@/lib/semana";
import type { OvertimeRuleRow, ProfileRow, ShiftRow } from "@/types/database";
import { crearEquipo, crearInvitacion, quitarMiembro, salirDeEquipo } from "./actions";
import { CopyLinkButton } from "./copy-link-button";

async function origenSitio() {
  const listaHeaders = await headers();
  const host = listaHeaders.get("host");
  const protocolo = host?.startsWith("localhost") || host?.startsWith("127.0.0.1") ? "http" : "https";
  return `${protocolo}://${host}`;
}

export default async function EquipoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("admin_habilitado")
    .eq("id", user.id)
    .single();

  const { data: membresias } = await supabase
    .from("team_members")
    .select("team_id, rol")
    .eq("user_id", user.id);

  const membresia = membresias?.[0];

  if (!membresia) {
    return (
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Equipo</CardTitle>
          </CardHeader>
          <CardContent>
            {profile?.admin_habilitado ? (
              <form action={crearEquipo} className="flex flex-col gap-4 sm:max-w-sm">
                <p className="text-sm text-muted-foreground">
                  Crea un equipo para invitar a otras personas y ver sus horas.
                </p>
                <div className="grid gap-1.5">
                  <Label htmlFor="nombre">Nombre del equipo</Label>
                  <Input id="nombre" name="nombre" placeholder="Ej: Hotel X – Recepción" required />
                </div>
                <div>
                  <Button type="submit">Crear equipo</Button>
                </div>
              </form>
            ) : (
              <p className="text-sm text-muted-foreground">
                Todavía no perteneces a ningún equipo. Si tu empleador administra uno, pídele que te
                comparta el enlace de invitación.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: equipo } = await supabase
    .from("teams")
    .select("id, nombre, owner_id")
    .eq("id", membresia.team_id)
    .single();

  if (!equipo) redirect("/equipo");

  if (membresia.rol === "miembro") {
    return (
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{equipo.nombre}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Eres miembro de este equipo. El admin puede ver los turnos que registres marcados para
              este equipo; tus turnos personales siguen siendo solo tuyos.
            </p>
            <form action={salirDeEquipo.bind(null, equipo.id)}>
              <Button variant="destructive" type="submit">
                Salir del equipo
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vista de admin: miembros del equipo con sus horas de la semana.
  const { data: miembros } = await supabase
    .from("team_members")
    .select("user_id, rol")
    .eq("team_id", equipo.id);

  const idsUsuarios = (miembros ?? []).map((m) => m.user_id);

  const [
    { data: perfiles },
    { data: reglas },
    { data: turnosEquipo },
    { data: invitaciones },
    { data: activa },
  ] = await Promise.all([
      idsUsuarios.length
        ? supabase.from("profiles").select("*").in("id", idsUsuarios)
        : Promise.resolve({ data: [] as ProfileRow[] }),
      idsUsuarios.length
        ? supabase.from("overtime_rules").select("*").in("user_id", idsUsuarios)
        : Promise.resolve({ data: [] as OvertimeRuleRow[] }),
      supabase.from("shifts").select("*").eq("team_id", equipo.id),
      supabase
        .from("invitations")
        .select("*")
        .eq("team_id", equipo.id)
        .is("aceptada_en", null)
        .order("created_at", { ascending: false }),
      supabase.rpc("suscripcion_activa", { p_team_id: equipo.id }),
    ]);

  const { inicio: inicioSemana, fin: finSemana } = rangoSemanaActual();
  const turnosSemana = (turnosEquipo ?? []).filter(
    (t: ShiftRow) => t.fecha >= inicioSemana && t.fecha <= finSemana,
  );
  const origen = await origenSitio();

  const filasMiembros = (miembros ?? []).map((miembro) => {
    const perfil = perfiles?.find((p) => p.id === miembro.user_id);
    const reglaFila = reglas?.find((r) => r.user_id === miembro.user_id);
    const reglasExtras = filaAReglas(reglaFila);
    const turnosDelMiembro = turnosSemana.filter((t) => t.user_id === miembro.user_id).map(filaATurno);
    const resumen = resumirSemana(turnosDelMiembro, reglasExtras);
    const horasSemana = minutosAHoras(resumen.minutosNormales + resumen.minutosTramo1 + resumen.minutosTramo2);
    const extrasSemana = minutosAHoras(resumen.minutosTramo1 + resumen.minutosTramo2);
    const pagoEstimado = calcularPagoEstimado(resumen, perfil?.tarifa_hora ?? 0, reglasExtras);
    const moneda = perfil?.moneda ?? "PEN";
    const formatoMoneda = new Intl.NumberFormat("es-PE", { style: "currency", currency: moneda });

    return {
      userId: miembro.user_id,
      rol: miembro.rol,
      nombre: perfil?.nombre ?? perfil?.email ?? miembro.user_id,
      horasSemana,
      extrasSemana,
      pagoEstimado: formatoMoneda.format(pagoEstimado),
    };
  });

  return (
    <div className="flex flex-col gap-6">
      {!activa && (
        <Card className="border-destructive/50">
          <CardContent className="flex flex-wrap items-center justify-between gap-2 pt-4">
            <p className="text-sm text-destructive">
              La suscripción del equipo no está activa: solo lectura, no se pueden crear turnos de
              equipo ni invitar hasta renovar.
            </p>
            <Link href="/planes" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Ir a Planes
            </Link>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{equipo.nombre} — esta semana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Horas</TableHead>
                  <TableHead>Extras</TableHead>
                  <TableHead>Pago estimado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filasMiembros.map((fila) => (
                  <TableRow key={fila.userId}>
                    <TableCell>{fila.nombre}</TableCell>
                    <TableCell>{fila.rol === "admin" ? "Admin" : "Miembro"}</TableCell>
                    <TableCell>{fila.horasSemana.toFixed(1)} h</TableCell>
                    <TableCell>{fila.extrasSemana.toFixed(1)} h</TableCell>
                    <TableCell>{fila.pagoEstimado}</TableCell>
                    <TableCell className="flex justify-end gap-2 text-right">
                      <Link
                        href={`/equipo/${fila.userId}`}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        Ver detalle
                      </Link>
                      {fila.userId !== equipo.owner_id && (
                        <form action={quitarMiembro.bind(null, equipo.id, fila.userId)}>
                          <Button variant="destructive" size="sm" type="submit">
                            Quitar
                          </Button>
                        </form>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invitar a alguien</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {activa ? (
            <form action={crearInvitacion.bind(null, equipo.id)} className="flex flex-wrap items-end gap-2">
              <div className="grid gap-1.5">
                <Label htmlFor="rol">Rol</Label>
                <select
                  id="rol"
                  name="rol"
                  defaultValue="miembro"
                  className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                >
                  <option value="miembro">Miembro</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <Button type="submit">Generar enlace de invitación</Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">
              Renueva la suscripción en Planes para poder invitar a más personas.
            </p>
          )}

          {invitaciones && invitaciones.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Invitaciones pendientes</p>
              {invitaciones.map((inv) => (
                <div key={inv.id} className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-muted-foreground">
                    {inv.rol === "admin" ? "Admin" : "Miembro"} · vence {inv.expira_en.slice(0, 10)}
                  </span>
                  <CopyLinkButton enlace={`${origen}/invitacion/${inv.token}`} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
