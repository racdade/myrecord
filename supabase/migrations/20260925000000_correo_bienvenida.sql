-- Marca si ya se le mandó el correo de bienvenida a la persona, para no
-- reenviarlo en cada login (el callback de auth lo revisa cada vez que
-- alguien entra).
alter table public.profiles
  add column bienvenida_enviada boolean not null default false;
