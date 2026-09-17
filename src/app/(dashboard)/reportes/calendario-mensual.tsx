import { eachDayOfInterval, endOfMonth, format, getDay, startOfMonth } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { minutosAHoras, minutosNetosTurno } from "@/lib/calc";
import { filaATurno } from "@/lib/shift-mapper";
import { fechaISO } from "@/lib/semana";
import type { ShiftRow } from "@/types/database";

const LOCALES_DATE_FNS = { es, en: enUS };

interface CalendarioMensualProps {
  mesRef: Date;
  turnos: ShiftRow[];
  feriados: { fecha: string; nombre: string }[];
  locale: string;
  diasSemana: string[];
}

export function CalendarioMensual({ mesRef, turnos, feriados, locale, diasSemana }: CalendarioMensualProps) {
  const dateFnsLocale = LOCALES_DATE_FNS[locale as "es" | "en"] ?? es;
  const inicio = startOfMonth(mesRef);
  const fin = endOfMonth(mesRef);
  const dias = eachDayOfInterval({ start: inicio, end: fin });

  // getDay(): 0=domingo..6=sábado; se pasa a lunes=0..domingo=6 para alinear la grilla.
  const espaciosVacios = (getDay(inicio) + 6) % 7;
  const feriadosPorFecha = new Map(feriados.map((f) => [f.fecha, f.nombre]));

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium capitalize">{format(mesRef, "MMMM yyyy", { locale: dateFnsLocale })}</p>
      <div className="grid grid-cols-7 gap-1 text-xs">
        {diasSemana.map((dia) => (
          <div key={dia} className="text-center font-medium text-muted-foreground">
            {dia}
          </div>
        ))}
        {Array.from({ length: espaciosVacios }).map((_, i) => (
          <div key={`vacio-${i}`} />
        ))}
        {dias.map((dia) => {
          const fecha = fechaISO(dia);
          const minutos = turnos
            .filter((t) => t.fecha === fecha)
            .reduce((total, t) => total + minutosNetosTurno(filaATurno(t)), 0);
          const feriado = feriadosPorFecha.get(fecha);

          return (
            <div
              key={fecha}
              className={`flex min-h-16 flex-col gap-0.5 rounded-md border p-1 ${
                feriado ? "border-primary/40 bg-primary/5" : "border-border"
              }`}
            >
              <span className="font-medium">{format(dia, "d")}</span>
              {minutos > 0 && (
                <span className="text-muted-foreground">{minutosAHoras(minutos).toFixed(1)} h</span>
              )}
              {feriado && <span className="truncate text-[10px] text-primary">{feriado}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
