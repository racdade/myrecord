"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TipoTurnoDB } from "@/types/database";
import { guardarTurnosImportados, interpretarHorario } from "./actions";

interface FilaEditable {
  fecha: string;
  tipo: TipoTurnoDB;
  horaInicio: string;
  horaFin: string;
  descansoMin: string;
  nota: string;
}

interface Revision {
  scheduleImportId: string;
  origen: "texto" | "foto";
  teamId: string | null;
  filas: FilaEditable[];
}

const CLASE_SELECT =
  "h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

const LOCALES_DATE_FNS = { es, en: enUS };

interface ImportarHorarioFormProps {
  semanaInicioPorDefecto: string;
  equipo?: { id: string; nombre: string } | null;
}

export function ImportarHorarioForm({ semanaInicioPorDefecto, equipo }: ImportarHorarioFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("turnosImportar");
  const tc = useTranslations("comun");
  const [modo, setModo] = useState<"foto" | "texto">("foto");
  const [semanaInicio, setSemanaInicio] = useState(semanaInicioPorDefecto);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState<Revision | null>(null);
  const [pendienteInterpretar, iniciarInterpretar] = useTransition();
  const [pendienteGuardar, iniciarGuardar] = useTransition();

  function nombreDia(fechaISO: string): string {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaISO)) return "—";
    const nombre = format(parseISO(fechaISO), "EEEE", { locale: LOCALES_DATE_FNS[locale as "es" | "en"] ?? es });
    return nombre.charAt(0).toUpperCase() + nombre.slice(1);
  }

  function manejarSubmit(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);
    const formData = new FormData(evento.currentTarget);
    iniciarInterpretar(async () => {
      const resultado = await interpretarHorario(formData);
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      setRevision({
        scheduleImportId: resultado.scheduleImportId,
        origen: modo,
        teamId: String(formData.get("teamId") ?? "").trim() || null,
        filas: resultado.turnos.map((turno) => ({
          fecha: turno.fecha,
          tipo: turno.tipo,
          horaInicio: turno.horaInicio ?? "",
          horaFin: turno.horaFin ?? "",
          descansoMin: String(turno.descansoMin),
          nota: turno.nota ?? "",
        })),
      });
    });
  }

  function actualizarFila(indice: number, cambios: Partial<FilaEditable>) {
    setRevision((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        filas: prev.filas.map((fila, i) => (i === indice ? { ...fila, ...cambios } : fila)),
      };
    });
  }

  function quitarFila(indice: number) {
    setRevision((prev) => (prev ? { ...prev, filas: prev.filas.filter((_, i) => i !== indice) } : prev));
  }

  function confirmar() {
    if (!revision) return;
    setError(null);
    iniciarGuardar(async () => {
      try {
        await guardarTurnosImportados(revision.scheduleImportId, revision.origen, revision.teamId, revision.filas);
        router.push("/turnos");
      } catch (err) {
        setError(err instanceof Error ? err.message : t("noSePudoGuardar"));
      }
    });
  }

  if (revision) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{t("revisaYCorrige")}</p>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tc("fecha")}</TableHead>
                <TableHead>{t("dia")}</TableHead>
                <TableHead>{tc("tipo")}</TableHead>
                <TableHead>{t("entrada")}</TableHead>
                <TableHead>{t("salida")}</TableHead>
                <TableHead>{tc("descanso")}</TableHead>
                <TableHead>{tc("nota")}</TableHead>
                <TableHead className="text-right">{tc("quitar")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revision.filas.map((fila, indice) => (
                <TableRow key={indice}>
                  <TableCell>
                    <Input
                      type="date"
                      value={fila.fecha}
                      onChange={(e) => actualizarFila(indice, { fecha: e.target.value })}
                    />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{nombreDia(fila.fecha)}</TableCell>
                  <TableCell>
                    <select
                      value={fila.tipo}
                      onChange={(e) => actualizarFila(indice, { tipo: e.target.value as TipoTurnoDB })}
                      className={CLASE_SELECT}
                    >
                      <option value="normal">{tc("normal")}</option>
                      <option value="feriado">{tc("feriado")}</option>
                      <option value="libre">{tc("libre")}</option>
                    </select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="time"
                      value={fila.horaInicio}
                      disabled={fila.tipo === "libre"}
                      onChange={(e) => actualizarFila(indice, { horaInicio: e.target.value })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="time"
                      value={fila.horaFin}
                      disabled={fila.tipo === "libre"}
                      onChange={(e) => actualizarFila(indice, { horaFin: e.target.value })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      className="w-20"
                      value={fila.descansoMin}
                      onChange={(e) => actualizarFila(indice, { descansoMin: e.target.value })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input value={fila.nota} onChange={(e) => actualizarFila(indice, { nota: e.target.value })} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button type="button" variant="outline" size="sm" onClick={() => quitarFila(indice)}>
                      {tc("quitar")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-2">
          <Button onClick={confirmar} disabled={pendienteGuardar || revision.filas.length === 0}>
            {pendienteGuardar ? t("guardando") : t("guardarNTurnos", { cantidad: revision.filas.length })}
          </Button>
          <Button type="button" variant="outline" onClick={() => setRevision(null)} disabled={pendienteGuardar}>
            {tc("cancelar")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={manejarSubmit} className="flex flex-col gap-4">
      <div className="grid gap-1.5 sm:max-w-xs">
        <Label htmlFor="semanaInicio">{t("semanaDelHorario")}</Label>
        <Input
          id="semanaInicio"
          name="semanaInicio"
          type="date"
          value={semanaInicio}
          onChange={(e) => setSemanaInicio(e.target.value)}
          required
        />
      </div>

      <div className="flex gap-2">
        <Button type="button" variant={modo === "foto" ? "default" : "outline"} onClick={() => setModo("foto")}>
          {t("foto")}
        </Button>
        <Button type="button" variant={modo === "texto" ? "default" : "outline"} onClick={() => setModo("texto")}>
          {t("texto")}
        </Button>
      </div>

      {modo === "foto" ? (
        <div className="grid gap-1.5">
          <Label htmlFor="foto">{t("fotoDelHorario")}</Label>
          <Input id="foto" name="foto" type="file" accept="image/jpeg,image/png,image/webp" required />
        </div>
      ) : (
        <div className="grid gap-1.5">
          <Label htmlFor="texto">{t("describeElHorario")}</Label>
          <Textarea id="texto" name="texto" placeholder={t("placeholderTexto")} required />
        </div>
      )}

      {equipo && (
        <div className="grid gap-1.5 sm:max-w-xs">
          <Label htmlFor="teamId">{t("para")}</Label>
          <select id="teamId" name="teamId" defaultValue="" className={CLASE_SELECT}>
            <option value="">{tc("personal")}</option>
            <option value={equipo.id}>{equipo.nombre}</option>
          </select>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div>
        <Button type="submit" disabled={pendienteInterpretar}>
          {pendienteInterpretar ? t("leyendoHorario") : t("leerHorario")}
        </Button>
      </div>

      <div className="grid gap-1.5 sm:max-w-sm">
        <Label htmlFor="nombrePersona">{t("leerSoloElHorarioDe")}</Label>
        <Input
          id="nombrePersona"
          name="nombrePersona"
          type="text"
          placeholder={t("placeholderNombrePersona")}
          maxLength={100}
        />
        <p className="text-xs text-muted-foreground">{t("siLaFotoTieneVariasPersonas")}</p>
      </div>
    </form>
  );
}
