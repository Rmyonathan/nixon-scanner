-- Run this in the Supabase SQL Editor to create the resi table.

create table if not exists public.resi (
  id uuid primary key default gen_random_uuid(),
  resi text not null unique,
  name text,
  status text not null check (status in ('belum di pack', 'dikirim')),
  alamat text,
  courier text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists resi_updated_at_idx on public.resi (updated_at desc);

alter table public.resi enable row level security;

create policy "Allow anonymous read access"
  on public.resi for select
  to anon
  using (true);

create policy "Allow anonymous insert access"
  on public.resi for insert
  to anon
  with check (true);

create policy "Allow anonymous update access"
  on public.resi for update
  to anon
  using (true)
  with check (true);

create policy "Allow anonymous delete access"
  on public.resi for delete
  to anon
  using (true);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists resi_set_updated_at on public.resi;

create trigger resi_set_updated_at
  before update on public.resi
  for each row
  execute function public.set_updated_at();
