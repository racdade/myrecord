# app-horas

App web instalable (PWA) para registrar horas de trabajo y horas extra, con
lectura de horarios por IA (foto o texto), dashboard y sincronización con
Google Calendar. Ver `PLAN.md` para el plan completo del producto y `CLAUDE.md`
para las convenciones de desarrollo.

## Desarrollo

```bash
npm install
cp .env.local.example .env.local   # completar con tus claves
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Stack

Next.js (App Router) + TypeScript · Tailwind CSS + shadcn/ui · Supabase
(Postgres + Auth + Storage) · API de Claude · Google Calendar API.
