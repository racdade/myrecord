/**
 * Mini maquetas hechas con CSS (mismo lenguaje visual que la landing: barras,
 * filas, círculos) para las tarjetas de acceso rápido de Inicio. No son
 * imágenes de verdad, así quedan nítidas y livianas y siguen la identidad
 * de marca (blanco y negro, sin fotos).
 */

const ALTURAS_DASHBOARD = [42, 68, 50, 82, 58, 24, 16];

export function PreviewDashboard() {
  return (
    <div className="flex h-11 items-end gap-1" aria-hidden="true">
      {ALTURAS_DASHBOARD.map((altura, i) => (
        <div
          key={i}
          className={`flex-1 rounded-[2px] ${i >= 5 ? "bg-foreground/15" : "bg-foreground/70"}`}
          style={{ height: `${altura}%` }}
        />
      ))}
    </div>
  );
}

export function PreviewTurnos() {
  return (
    <div className="flex h-11 flex-col justify-center gap-1.5" aria-hidden="true">
      <div className="flex items-center justify-between rounded-full border border-border px-2.5 py-1">
        <span className="h-1.5 w-14 rounded-full bg-foreground/60" />
        <span className="flex size-3.5 items-center justify-center rounded-full bg-foreground text-[7px] font-bold text-background">
          ✓
        </span>
      </div>
      <div className="flex items-center justify-between rounded-full border border-border px-2.5 py-1">
        <span className="h-1.5 w-10 rounded-full bg-foreground/25" />
        <span className="size-3.5 rounded-full border border-border" />
      </div>
    </div>
  );
}

export function PreviewReportes() {
  return (
    <div className="flex h-11 flex-col justify-center gap-2.5" aria-hidden="true">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full w-4/5 rounded-full bg-foreground" />
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full w-2/5 rounded-full bg-foreground/50" />
      </div>
    </div>
  );
}

const INICIALES_EQUIPO = ["R", "L", "A", "J"];

export function PreviewEquipo() {
  return (
    <div className="flex h-11 items-center" aria-hidden="true">
      <div className="flex -space-x-4">
        {INICIALES_EQUIPO.map((inicial, i) => (
          <div
            key={inicial}
            className="flex size-8 items-center justify-center rounded-full border-2 border-card bg-muted text-[11px] font-medium text-muted-foreground"
            style={{ zIndex: INICIALES_EQUIPO.length - i }}
          >
            {inicial}
          </div>
        ))}
      </div>
    </div>
  );
}
