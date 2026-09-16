# CLAUDE.md — app-horas

Convenciones del proyecto para trabajar con Claude Code. Lee también `PLAN.md`
(plan completo del producto y de las fases) antes de empezar cualquier trabajo.

## Qué es este proyecto

App web instalable (PWA) para registrar horas de trabajo y horas extra, con
lectura de horarios por IA (foto o texto), dashboard, sincronización con
Google Calendar y un plan de administración de pago para gestionar equipos.
Detalle completo en `PLAN.md`.

## Cómo trabajar aquí (muy importante)

- **Una fase a la vez.** Las fases están definidas en `PLAN.md` §8. No se
  empieza una fase nueva sin que el usuario la apruebe explícitamente,
  aunque la fase anterior haya quedado "lista".
- **Plan antes que código.** Al iniciar una fase: resumir qué se va a hacer,
  señalar riesgos o decisiones pendientes, y esperar el visto bueno antes de
  escribir o modificar código.
- Al terminar una fase y que el usuario confirme que funciona, hacer commit
  con un mensaje que identifique la fase (ej. `feat: fase 1 - registro manual y cálculo de horas`).
- Si una tarea toca una decisión listada como "por confirmar" en `PLAN.md` §2,
  usar el valor por defecto propuesto ahí y dejar explícito en la respuesta
  que es un valor configurable, no preguntar salvo que sea ambiguo.

## Stack

- **Frontend:** Next.js (App Router) + TypeScript
- **Estilos/UI:** Tailwind CSS + shadcn/ui
- **Gráficos:** Recharts
- **Datos/Auth:** Supabase (Postgres + Auth + Storage), con RLS
- **IA (foto/texto → turnos):** API de Claude (Anthropic), con visión
- **Calendario:** Google Calendar API (OAuth)
- **Fechas:** date-fns + date-fns-tz
- **Validación:** Zod
- **PWA:** manifest + service worker (Serwist)
- **Hosting:** Vercel · **Código:** GitHub

## Estructura de carpetas (Next.js App Router)

```
src/
  app/                    # rutas (App Router)
    (auth)/               # login, onboarding
    (dashboard)/          # dashboard, turnos, equipo, reportes, ajustes
    api/                  # API routes (server-only): IA, Calendar, pagos, webhooks
  components/
    ui/                   # componentes shadcn/ui
    ...                   # componentes propios de la app
  lib/
    supabase/             # clientes de Supabase (server y browser, nunca mezclados)
    calc/                 # módulo de cálculo de horas y extras (con tests)
    ai/                   # prompts y parsing de la lectura de horarios (server-only)
    calendar/             # integración con Google Calendar (server-only)
    billing/              # módulo de pagos, aislado de la pasarela elegida
    validations/          # esquemas Zod
  types/
supabase/
  migrations/             # migraciones SQL (tablas + políticas RLS)
```

Los módulos `lib/ai`, `lib/calendar` y `lib/billing` contienen lógica sensible
y **solo se importan desde `app/api/*` o Server Components/Server Actions**,
nunca desde código que corre en el navegador.

## Seguridad (no negociable)

- **Claves y secretos solo en `.env.local`**, nunca hardcodeadas ni commiteadas.
  `.env.local` debe estar en `.gitignore` desde el primer commit.
- **RLS activo en todas las tablas de Supabase** desde que se crean. Cada
  persona lee/escribe solo sus propios `shifts`; un admin de equipo lee/escribe
  los `shifts` de su `team_id` (ver `PLAN.md` §5). No confiar en filtros del
  cliente para restringir datos.
- **Lógica sensible en el servidor:** llamadas a la API de Claude, a Google
  Calendar y a la pasarela de pagos van siempre en rutas de servidor (API
  routes o Server Actions), nunca en el cliente. Esto es además necesario para
  que la lógica funcione igual dentro de Capacitor en la Fase 7.
- **Fotos de horarios** van en un bucket privado de Supabase Storage.
- **Tokens de Google** se guardan cifrados; solo el servidor los usa.
- **Límites de plan** (personas por equipo, solo lectura al vencer) se validan
  en el servidor/base de datos, no solo ocultando botones en la UI.
- La salida de la IA siempre pasa por validación con Zod y por una pantalla de
  confirmación del usuario antes de guardarse; nunca se guarda directo.

## Zona horaria e idioma

- **Zona horaria:** `America/Lima` en todo cálculo, guardado y visualización
  de fechas/horas (usar `date-fns-tz`). Cuidado especial con turnos que cruzan
  la medianoche.
- **Idioma de la interfaz:** español (Perú), incluyendo textos, mensajes de
  error y validaciones que ve el usuario.

## Convenciones de código

- TypeScript estricto; evitar `any`.
- Componentes de servidor por defecto; `"use client"` solo cuando haga falta
  interactividad.
- El módulo de cálculo de horas (`lib/calc`) lleva tests (es la lógica más
  delicada del producto, según `PLAN.md` §4.3).
- Sin abstracciones ni configuración especulativa para fases futuras: construir
  para la fase actual, no adelantarse a fases que aún no se aprobaron.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
