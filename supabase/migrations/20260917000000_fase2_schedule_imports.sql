-- Fase 2: lectura de horarios con IA (foto y texto).
-- team_id queda reservado (sin FK) igual que en shifts/overtime_rules, para
-- cuando la Fase 3 permita importar el horario de todo un equipo.

create table public.schedule_imports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  team_id uuid, -- reservado para la Fase 3
  imagen_path text,
  texto text,
  resultado_json jsonb,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'listo', 'error', 'confirmado')),
  created_at timestamptz not null default now()
);

create index schedule_imports_user_idx on public.schedule_imports (user_id, created_at desc);

alter table public.schedule_imports enable row level security;

create policy "schedule_imports: cada quien ve sus propias importaciones"
  on public.schedule_imports for select
  using (user_id = auth.uid());

create policy "schedule_imports: cada quien crea sus propias importaciones"
  on public.schedule_imports for insert
  with check (user_id = auth.uid());

create policy "schedule_imports: cada quien actualiza sus propias importaciones"
  on public.schedule_imports for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- =========================================================================
-- Storage: fotos de horarios (bucket privado)
-- =========================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('horarios', 'horarios', false, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Cada archivo se guarda como "<user_id>/<nombre>"; el primer segmento de la
-- ruta es el dueño, igual que el patrón recomendado por Supabase Storage.
create policy "horarios: cada quien sube sus propias fotos"
  on storage.objects for insert
  with check (bucket_id = 'horarios' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "horarios: cada quien ve sus propias fotos"
  on storage.objects for select
  using (bucket_id = 'horarios' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "horarios: cada quien borra sus propias fotos"
  on storage.objects for delete
  using (bucket_id = 'horarios' and (storage.foldername(name))[1] = auth.uid()::text);
