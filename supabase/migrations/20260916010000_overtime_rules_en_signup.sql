-- Al registrarse, además del perfil, se crea una fila de overtime_rules con
-- los valores por defecto de PLAN.md §2.7-8 (editables luego por la persona).
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

  insert into public.overtime_rules (user_id)
  values (new.id);

  return new;
end;
$$;
