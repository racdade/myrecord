-- obtener_invitacion decía "válida" aunque el equipo estuviera vencido o
-- cancelado (aceptar_invitacion sí lo bloqueaba, pero recién al aceptar).
-- Ahora la vista previa ya refleja el estado real de la suscripción.

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

  return query select
    v_team_nombre,
    v_rol,
    (v_aceptada_en is null and v_expira_en > now() and public.suscripcion_activa(v_team_id));
end;
$$;
