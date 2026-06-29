-- Run this in Supabase SQL Editor to enable custom courier dropdown options.

create table if not exists public.courier_options (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  prefix text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.courier_options enable row level security;

create policy "Allow anonymous read courier options"
  on public.courier_options for select
  to anon
  using (true);

create policy "Allow anonymous insert courier options"
  on public.courier_options for insert
  to anon
  with check (true);

create policy "Allow anonymous delete courier options"
  on public.courier_options for delete
  to anon
  using (true);

-- Default couriers (safe to re-run).
insert into public.courier_options (name, prefix, sort_order) values
  ('Shopee Xpress', 'SPX', 1),
  ('J&T Express', 'JP', 2),
  ('SiCepat', '00', 3),
  ('GoSend', null, 4),
  ('GrabExpress', null, 5)
on conflict (name) do nothing;
