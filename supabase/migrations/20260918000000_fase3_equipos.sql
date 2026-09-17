-- Fase 3: equipos y personas.
-- El acceso para crear equipos se activa a mano con profiles.admin_habilitado
-- (sin cobrar todavía; eso es la Fase 3B).

alter table public.profiles
  add column admin_habilitado boolean not null default false;

-- =========================================================================
-- teams
-- =========================================================================
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.teams enable row level security;

-- =========================================================================
-- team_members
-- =========================================================================
create table public.team_members (
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rol text not null default 'miembro' check (rol in ('admin', 'miembro')),
  created_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

alter table public.team_members enable row level security;

create policy "team_members: cada quien ve su propia membresía"
  on public.team_members for select
  using (user_id = auth.uid());

create policy "team_members: el admin ve a todos los miembros de su equipo"
  on public.team_members for select
  using (exists (
    select 1 from public.team_members admin_tm
    where admin_tm.team_id = team_members.team_id
      and admin_tm.user_id = auth.uid()
      and admin_tm.rol = 'admin'
  ));

create policy "team_members: el dueño se agrega como admin al crear el equipo"
  on public.team_members for insert
  with check (
    user_id = auth.uid()
    and rol = 'admin'
    and exists (select 1 from public.teams t where t.id = team_members.team_id and t.owner_id = auth.uid())
  );

create policy "team_members: el admin agrega miembros a su equipo"
  on public.team_members for insert
  with check (exists (
    select 1 from public.team_members admin_tm
    where admin_tm.team_id = team_members.team_id
      and admin_tm.user_id = auth.uid()
      and admin_tm.rol = 'admin'
  ));

create policy "team_members: el admin quita miembros de su equipo"
  on public.team_members for delete
  using (exists (
    select 1 from public.team_members admin_tm
    where admin_tm.team_id = team_members.team_id
      and admin_tm.user_id = auth.uid()
      and admin_tm.rol = 'admin'
  ));

create policy "team_members: cada quien puede salir de su equipo"
  on public.team_members for delete
  using (user_id = auth.uid());

-- Políticas de "teams" (necesitan que team_members ya exista).
create policy "teams: el dueño ve su equipo"
  on public.teams for select
  using (owner_id = auth.uid());

create policy "teams: los miembros ven su equipo"
  on public.teams for select
  using (exists (
    select 1 from public.team_members tm where tm.team_id = teams.id and tm.user_id = auth.uid()
  ));

create policy "teams: el dueño crea su equipo"
  on public.teams for insert
  with check (owner_id = auth.uid());

create policy "teams: el dueño edita su equipo"
  on public.teams for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- =========================================================================
-- invitations
-- =========================================================================
create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  email text,
  rol text not null default 'miembro' check (rol in ('admin', 'miembro')),
  token text not null unique default encode(gen_random_bytes(16), 'hex'),
  expira_en timestamptz not null default (now() + interval '7 days'),
  aceptada_en timestamptz,
  created_at timestamptz not null default now()
);

alter table public.invitations enable row level security;

create policy "invitations: el admin ve las invitaciones de su equipo"
  on public.invitations for select
  using (exists (
    select 1 from public.team_members tm
    where tm.team_id = invitations.team_id and tm.user_id = auth.uid() and tm.rol = 'admin'
  ));

create policy "invitations: el admin crea invitaciones para su equipo"
  on public.invitations for insert
  with check (exists (
    select 1 from public.team_members tm
    where tm.team_id = invitations.team_id and tm.user_id = auth.uid() and tm.rol = 'admin'
  ));

create policy "invitations: el admin borra invitaciones de su equipo"
  on public.invitations for delete
  using (exists (
    select 1 from public.team_members tm
    where tm.team_id = invitations.team_id and tm.user_id = auth.uid() and tm.rol = 'admin'
  ));

-- =========================================================================
-- Funciones para aceptar/leer una invitación por token (bypassa RLS a
-- propósito: quien recibe el enlace todavía no es miembro del equipo, así
-- que no puede leer `invitations` ni escribir en `team_members` por sí solo).
-- =========================================================================
create or replace function public.obtener_invitacion(p_token text)
returns table (equipo_nombre text, rol text, valida boolean)
language plpgsql
security definer set search_path = public
as $$
declare
  v_team_id uuid;
  v_rol text;
  v_aceptada_en timestamptz;
  v_expira_en timestamptz;
  v_team_nombre text;
begin
  select i.team_id, i.rol, i.aceptada_en, i.expira_en
    into v_team_id, v_rol, v_aceptada_en, v_expira_en
  from public.invitations i
  where i.token = p_token;

  if not found then
    return query select null::text, null::text, false;
    return;
  end if;

  select t.nombre into v_team_nombre from public.teams t where t.id = v_team_id;

  return query select v_team_nombre, v_rol, (v_aceptada_en is null and v_expira_en > now());
end;
$$;

grant execute on function public.obtener_invitacion(text) to authenticated, anon;

create or replace function public.aceptar_invitacion(p_token text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_invitacion record;
begin
  select * into v_invitacion
  from public.invitations
  where token = p_token
  for update;

  if not found then
    raise exception 'Invitación no encontrada.';
  end if;

  if v_invitacion.aceptada_en is not null then
    raise exception 'Esta invitación ya fue usada.';
  end if;

  if v_invitacion.expira_en < now() then
    raise exception 'Esta invitación venció.';
  end if;

  insert into public.team_members (team_id, user_id, rol)
  values (v_invitacion.team_id, auth.uid(), v_invitacion.rol)
  on conflict (team_id, user_id) do nothing;

  update public.invitations
  set aceptada_en = now()
  where id = v_invitacion.id;
end;
$$;

grant execute on function public.aceptar_invitacion(text) to authenticated;

-- =========================================================================
-- profiles: el admin necesita ver el nombre/tarifa de su equipo
-- =========================================================================
create policy "profiles: el admin ve los perfiles de su equipo"
  on public.profiles for select
  using (exists (
    select 1
    from public.team_members admin_tm
    join public.team_members member_tm on member_tm.team_id = admin_tm.team_id
    where admin_tm.user_id = auth.uid()
      and admin_tm.rol = 'admin'
      and member_tm.user_id = profiles.id
  ));

-- =========================================================================
-- overtime_rules: el admin necesita las reglas de cada miembro para calcular
-- sus horas extra.
-- =========================================================================
alter table public.overtime_rules
  add constraint overtime_rules_team_id_fkey foreign key (team_id) references public.teams (id) on delete set null;

create policy "overtime_rules: el admin ve las reglas de su equipo"
  on public.overtime_rules for select
  using (exists (
    select 1
    from public.team_members admin_tm
    join public.team_members member_tm on member_tm.team_id = admin_tm.team_id
    where admin_tm.user_id = auth.uid()
      and admin_tm.rol = 'admin'
      and member_tm.user_id = overtime_rules.user_id
  ));

-- =========================================================================
-- shifts: turnos de equipo
-- =========================================================================
alter table public.shifts
  add constraint shifts_team_id_fkey foreign key (team_id) references public.teams (id) on delete set null;

-- Reemplaza las políticas de insert/update de Fase 1: ahora hay que
-- verificar que, si el turno trae team_id, quien lo crea/edita sea miembro
-- de ese equipo (si no, un id de equipo ajeno pasaría sin control).
drop policy "shifts: cada quien crea sus propios turnos" on public.shifts;
create policy "shifts: cada quien crea sus propios turnos"
  on public.shifts for insert
  with check (
    user_id = auth.uid()
    and (
      team_id is null
      or exists (select 1 from public.team_members tm where tm.team_id = shifts.team_id and tm.user_id = auth.uid())
    )
  );

drop policy "shifts: cada quien edita sus propios turnos" on public.shifts;
create policy "shifts: cada quien edita sus propios turnos"
  on public.shifts for update
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and (
      team_id is null
      or exists (select 1 from public.team_members tm where tm.team_id = shifts.team_id and tm.user_id = auth.uid())
    )
  );

create policy "shifts: el admin ve los turnos de su equipo"
  on public.shifts for select
  using (exists (
    select 1 from public.team_members tm
    where tm.team_id = shifts.team_id and tm.user_id = auth.uid() and tm.rol = 'admin'
  ));
