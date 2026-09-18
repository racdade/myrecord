-- Notificaciones dentro de la app: le permiten al desarrollador responderle
-- a alguien que escribió por el enlace de contacto, y que esa persona vea la
-- respuesta con una campanita en el header.

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mensaje text not null,
  leido boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "notifications: cada quien ve las suyas"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "notifications: cada quien marca como leidas las suyas"
  on public.notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create index notifications_user_id_leido_idx on public.notifications (user_id, leido);

-- Envía una notificación a una persona por su correo. Solo el correo del
-- desarrollador (dueño del proyecto) puede llamarla. Está hardcodeado porque
-- hoy hay un solo administrador; si en el futuro hay más de uno, esto se
-- puede mover a una tabla `app_admins`.
create or replace function public.enviar_notificacion(p_email text, p_mensaje text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_email_admin constant text := 'britoadolfo9@gmail.com';
  v_email_llamador text;
  v_destinatario uuid;
begin
  select email into v_email_llamador from public.profiles where id = auth.uid();

  if v_email_llamador is distinct from v_email_admin then
    raise exception 'No autorizado';
  end if;

  select id into v_destinatario from public.profiles where email = p_email;
  if v_destinatario is null then
    raise exception 'No existe una persona registrada con ese correo.';
  end if;

  insert into public.notifications (user_id, mensaje) values (v_destinatario, p_mensaje);
end;
$$;
