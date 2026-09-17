-- Fase 3B: pagos y límites del plan.
-- Todavía no hay pasarela real conectada (sin cuenta de Culqi); el pago se
-- simula desde la app (ver lib/billing). El modelo de datos y los límites
-- quedan listos para cuando se conecte una pasarela de verdad: solo cambia
-- quién llama a `procesar_pago_exitoso`, no el resto del esquema.

-- =========================================================================
-- subscriptions
-- =========================================================================
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  team_id uuid not null unique references public.teams (id) on delete cascade,
  plan text not null default 'admin' check (plan = 'admin'),
  estado text not null default 'trial' check (estado in ('trial', 'activa', 'vencida', 'cancelada')),
  personas_incluidas integer not null default 5,
  personas_extra integer not null default 0,
  proveedor text,
  proveedor_sub_id text,
  periodo_fin timestamptz,
  trial_fin timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "subscriptions: el dueño ve su suscripción"
  on public.subscriptions for select
  using (owner_id = auth.uid());

create policy "subscriptions: el dueño crea su suscripción"
  on public.subscriptions for insert
  with check (owner_id = auth.uid());

create policy "subscriptions: el dueño actualiza su suscripción"
  on public.subscriptions for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- =========================================================================
-- billing_events (registro de webhooks; sin RLS de cliente, solo backend)
-- =========================================================================
create table public.billing_events (
  id uuid primary key default gen_random_uuid(),
  proveedor text not null,
  tipo text not null,
  payload_json jsonb,
  procesado_en timestamptz,
  created_at timestamptz not null default now()
);

alter table public.billing_events enable row level security;
-- Sin políticas: nadie del lado del cliente lee/escribe esta tabla todavía.

-- =========================================================================
-- ¿Un equipo puede escribir turnos de equipo / sumar miembros ahora mismo?
-- security definer: lo puede llamar cualquier miembro del equipo, no solo el
-- dueño (que es el único con acceso de lectura directa a `subscriptions`).
-- =========================================================================
create or replace function public.suscripcion_activa(p_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.subscriptions s
    where s.team_id = p_team_id
      and (
        s.estado = 'activa'
        or (s.estado = 'trial' and s.trial_fin > now())
      )
  );
$$;

grant execute on function public.suscripcion_activa(uuid) to authenticated;

-- =========================================================================
-- aceptar_invitacion ahora respeta el estado de la suscripción y el límite
-- de personas del plan (personas_incluidas + personas_extra).
-- =========================================================================
create or replace function public.aceptar_invitacion(p_token text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_invitacion record;
  v_limite integer;
  v_actuales integer;
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

  if not public.suscripcion_activa(v_invitacion.team_id) then
    raise exception 'El equipo no tiene una suscripción activa.';
  end if;

  select (personas_incluidas + personas_extra) into v_limite
  from public.subscriptions
  where team_id = v_invitacion.team_id;

  select count(*) into v_actuales
  from public.team_members
  where team_id = v_invitacion.team_id;

  if v_actuales >= coalesce(v_limite, 0) then
    raise exception 'El equipo llegó al límite de personas de su plan.';
  end if;

  insert into public.team_members (team_id, user_id, rol)
  values (v_invitacion.team_id, auth.uid(), v_invitacion.rol)
  on conflict (team_id, user_id) do nothing;

  update public.invitations
  set aceptada_en = now()
  where id = v_invitacion.id;
end;
$$;

-- =========================================================================
-- shifts: los turnos de equipo (team_id no nulo) exigen suscripción activa.
-- Los turnos personales (team_id null) nunca se bloquean.
-- =========================================================================
drop policy "shifts: cada quien crea sus propios turnos" on public.shifts;
create policy "shifts: cada quien crea sus propios turnos"
  on public.shifts for insert
  with check (
    user_id = auth.uid()
    and (
      team_id is null
      or (
        exists (select 1 from public.team_members tm where tm.team_id = shifts.team_id and tm.user_id = auth.uid())
        and public.suscripcion_activa(shifts.team_id)
      )
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
      or (
        exists (select 1 from public.team_members tm where tm.team_id = shifts.team_id and tm.user_id = auth.uid())
        and public.suscripcion_activa(shifts.team_id)
      )
    )
  );

-- =========================================================================
-- Backfill: los equipos creados en la Fase 3 (antes de que existiera esta
-- tabla) no tienen fila en `subscriptions`. Sin esto quedarían "vencidos".
-- =========================================================================
insert into public.subscriptions (owner_id, team_id, plan, estado, personas_incluidas, personas_extra, trial_fin)
select t.owner_id, t.id, 'admin', 'trial', 5, 0, now() + interval '14 days'
from public.teams t
left join public.subscriptions s on s.team_id = t.id
where s.team_id is null;
