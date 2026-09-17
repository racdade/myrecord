-- Preferencia de formato de hora (12h / 24h, "formato militar") por persona.
alter table public.profiles
  add column formato_hora text not null default '24h' check (formato_hora in ('12h', '24h'));
