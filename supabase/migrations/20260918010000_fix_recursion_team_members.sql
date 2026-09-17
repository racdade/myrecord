-- Corrige "infinite recursion detected in policy for relation team_members".
-- Causa: las políticas de team_members que comprobaban "¿soy admin de este
-- equipo?" hacían un subselect sobre la propia tabla team_members. Postgres
-- vuelve a aplicar las políticas de RLS dentro de ese subselect, y como una
-- de esas políticas es la misma, entra en un ciclo infinito.
--
-- Arreglo: mover esa comprobación a una función `security definer` (que no
-- dispara RLS en sus propias consultas) y usarla en vez del subselect.

create or replace function public.es_admin_de_equipo(p_team_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.team_members
    where team_id = p_team_id and user_id = auth.uid() and rol = 'admin'
  );
$$;

grant execute on function public.es_admin_de_equipo(uuid) to authenticated;

drop policy "team_members: el admin ve a todos los miembros de su equipo" on public.team_members;
create policy "team_members: el admin ve a todos los miembros de su equipo"
  on public.team_members for select
  using (public.es_admin_de_equipo(team_members.team_id));

drop policy "team_members: el admin agrega miembros a su equipo" on public.team_members;
create policy "team_members: el admin agrega miembros a su equipo"
  on public.team_members for insert
  with check (public.es_admin_de_equipo(team_members.team_id));

drop policy "team_members: el admin quita miembros de su equipo" on public.team_members;
create policy "team_members: el admin quita miembros de su equipo"
  on public.team_members for delete
  using (public.es_admin_de_equipo(team_members.team_id));
