-- Fase 5: feriados de Perú (referencia para el calendario mensual de
-- /reportes). Fechas fijas confirmadas; las móviles (Semana Santa) están
-- calculadas para 2026 pero conviene reconfirmarlas cada año.

create table public.holidays (
  fecha date not null,
  nombre text not null,
  pais text not null default 'PE',
  primary key (fecha, pais)
);

-- Solo lectura para cualquier usuario autenticado: no es información
-- sensible ni específica de una persona.
alter table public.holidays enable row level security;

create policy "holidays: cualquier autenticado puede leerlos"
  on public.holidays for select
  to authenticated
  using (true);

insert into public.holidays (fecha, nombre, pais) values
  ('2026-01-01', 'Año Nuevo', 'PE'),
  ('2026-04-02', 'Jueves Santo', 'PE'), -- móvil: verificar cada año
  ('2026-04-03', 'Viernes Santo', 'PE'), -- móvil: verificar cada año
  ('2026-05-01', 'Día del Trabajo', 'PE'),
  ('2026-06-29', 'San Pedro y San Pablo', 'PE'),
  ('2026-07-28', 'Fiestas Patrias', 'PE'),
  ('2026-07-29', 'Fiestas Patrias', 'PE'),
  ('2026-08-30', 'Santa Rosa de Lima', 'PE'),
  ('2026-10-08', 'Combate de Angamos', 'PE'),
  ('2026-11-01', 'Todos los Santos', 'PE'),
  ('2026-12-08', 'Inmaculada Concepción', 'PE'),
  ('2026-12-25', 'Navidad', 'PE')
on conflict (fecha, pais) do nothing;
