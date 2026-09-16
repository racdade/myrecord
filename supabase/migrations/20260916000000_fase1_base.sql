-- Fase 1: profiles, shifts, overtime_rules + RLS.
-- team_id queda como columna reservada (sin FK todavía) para cuando la Fase 3
-- cree la tabla `teams`; hasta entonces toda regla y turno es personal.

create extension if not exists pgcrypto;

-- Función reutilizable para mantener updated_at al día.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================================
-- profiles
-- =========================================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text,
  email text,
  avatar_url text,
  tarifa_hora numeric(10, 2) not null default 0,
  moneda text not null default 'PEN',
  zona_horaria text not null default 'America/Lima',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: cada quien ve su propio perfil"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles: cada quien edita su propio perfil"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Crea el perfil automáticamente cuando alguien se registra en auth.users.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nombre, email, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================================
-- overtime_rules
-- =========================================================================
create table public.overtime_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  team_id uuid, -- reservado para la Fase 3 (reglas a nivel de equipo)
  horas_dia numeric(4, 2) not null default 8,
  horas_semana numeric(5, 2) not null default 48,
  modo text not null default 'ambos' check (modo in ('dia', 'semana', 'ambos')),
  tramo1_horas numeric(4, 2) not null default 2,
  tramo1_pct numeric(4, 3) not null default 0.25,
  tramo2_pct numeric(4, 3) not null default 0.35,
  feriado_pct numeric(4, 3) not null default 1.00,
  nocturno_pct numeric(4, 3) not null default 0.35,
  nocturno_inicio time not null default '22:00',
  nocturno_fin time not null default '06:00',
  inicio_semana text not null default 'lunes',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.overtime_rules enable row level security;

create policy "overtime_rules: cada quien ve sus propias reglas"
  on public.overtime_rules for select
  using (user_id = auth.uid());

create policy "overtime_rules: cada quien crea sus propias reglas"
  on public.overtime_rules for insert
  with check (user_id = auth.uid());

create policy "overtime_rules: cada quien edita sus propias reglas"
  on public.overtime_rules for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "overtime_rules: cada quien borra sus propias reglas"
  on public.overtime_rules for delete
  using (user_id = auth.uid());

create trigger overtime_rules_set_updated_at
  before update on public.overtime_rules
  for each row execute function public.set_updated_at();

-- =========================================================================
-- shifts
-- =========================================================================
create table public.shifts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  team_id uuid, -- reservado para la Fase 3 (turnos vistos por un admin de equipo)
  fecha date not null,
  hora_inicio time,
  hora_fin time,
  descanso_min integer not null default 0 check (descanso_min >= 0),
  tipo text not null default 'normal' check (tipo in ('normal', 'feriado', 'libre')),
  origen text not null default 'manual' check (origen in ('manual', 'texto', 'foto', 'calendar')),
  nota text,
  gcal_event_id text,
  created_by uuid not null default auth.uid() references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shifts_horas_segun_tipo check (
    (tipo = 'libre' and hora_inicio is null and hora_fin is null)
    or (tipo <> 'libre' and hora_inicio is not null and hora_fin is not null)
  )
);

create index shifts_user_fecha_idx on public.shifts (user_id, fecha);

alter table public.shifts enable row level security;

create policy "shifts: cada quien ve sus propios turnos"
  on public.shifts for select
  using (user_id = auth.uid());

create policy "shifts: cada quien crea sus propios turnos"
  on public.shifts for insert
  with check (user_id = auth.uid());

create policy "shifts: cada quien edita sus propios turnos"
  on public.shifts for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "shifts: cada quien borra sus propios turnos"
  on public.shifts for delete
  using (user_id = auth.uid());

create trigger shifts_set_updated_at
  before update on public.shifts
  for each row execute function public.set_updated_at();
