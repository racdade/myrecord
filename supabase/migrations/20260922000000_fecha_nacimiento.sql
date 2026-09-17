-- Fecha de nacimiento opcional, para saludar el día del cumpleaños en /.
alter table public.profiles
  add column fecha_nacimiento date;
