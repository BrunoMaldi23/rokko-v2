alter table public.products
  add column if not exists mockup_calibrations jsonb not null default '{}'::jsonb;
