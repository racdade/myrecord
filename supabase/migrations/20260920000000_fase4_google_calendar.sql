-- Fase 4: sincronización con Google Calendar.
-- El refresh token se guarda cifrado (AES-256-GCM) desde la app; acá solo
-- viaja como texto opaco, nunca en claro.

create table public.google_connections (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  refresh_token text not null,
  calendar_id text,
  conectado_en timestamptz not null default now()
);

alter table public.google_connections enable row level security;

create policy "google_connections: cada quien ve su propia conexión"
  on public.google_connections for select
  using (user_id = auth.uid());

create policy "google_connections: cada quien crea su propia conexión"
  on public.google_connections for insert
  with check (user_id = auth.uid());

create policy "google_connections: cada quien actualiza su propia conexión"
  on public.google_connections for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "google_connections: cada quien borra su propia conexión"
  on public.google_connections for delete
  using (user_id = auth.uid());
