"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
  filas: FilaEditable[];
}

const CLASE_SELECT =
  "h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export function ImportarHorarioForm({ semanaInicioPorDefecto }: { semanaInicioPorDefecto: string }) {
  const router = useRouter();
  const [modo, setModo] = useState<"foto" | "texto">("foto");
  const [semanaInicio, setSemanaInicio] = useState(semanaInicioPorDefecto);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState<Revision | null>(null);
  const [pendienteInterpretar, iniciarInterpretar] = useTransition();
  const [pendienteGuardar, iniciarGuardar] = useTransition();

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
        await guardarTurnosImportados(revision.scheduleImportId, revision.origen, revision.filas);
        router.push("/turnos");
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo guardar.");
      }
    });
  }

  if (revision) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Revisa y corrige los turnos antes de guardar. Todavía no se guardó nada.
        </p>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead>Salida</TableHead>
                <TableHead>Descanso</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead className="text-right">Quitar</TableHead>
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
                  <TableCell>
                    <select
                      value={fila.tipo}
                      onChange={(e) => actualizarFila(indice, { tipo: e.target.value as TipoTurnoDB })}
                      className={CLASE_SELECT}
                    >
                      <option value="normal">Normal</option>
                      <option value="feriado">Feriado</option>
                      <option value="libre">Libre</option>
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
                      Quitar
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
            {pendienteGuardar ? "Guardando…" : `Guardar ${revision.filas.length} turno(s)`}
          </Button>
          <Button type="button" variant="outline" onClick={() => setRevision(null)} disabled={pendienteGuardar}>
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={manejarSubmit} className="flex flex-col gap-4">
      <div className="grid gap-1.5 sm:max-w-xs">
        <Label htmlFor="semanaInicio">Semana del horario (lunes)</Label>
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
          Foto
        </Button>
        <Button type="button" variant={modo === "texto" ? "default" : "outline"} onClick={() => setModo("texto")}>
          Texto
        </Button>
      </div>

      {modo === "foto" ? (
        <div className="grid gap-1.5">
          <Label htmlFor="foto">Foto del horario</Label>
          <Input id="foto" name="foto" type="file" accept="image/jpeg,image/png,image/webp" required />
        </div>
      ) : (
        <div className="grid gap-1.5">
          <Label htmlFor="texto">Describe el horario</Label>
          <Textarea
            id="texto"
            name="texto"
            placeholder='Ej: "lun y mar 12pm a 10pm, miérc 2 a 10pm, viernes libre"'
            required
          />
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div>
        <Button type="submit" disabled={pendienteInterpretar}>
          {pendienteInterpretar ? "Leyendo horario…" : "Leer horario"}
        </Button>
      </div>
    </form>
  );
}
