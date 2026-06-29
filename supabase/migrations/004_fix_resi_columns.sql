-- Run this in Supabase → SQL Editor if you see "Could not find the 'alamat' column"
-- (or missing courier). Safe to run multiple times.

alter table public.resi add column if not exists alamat text;
alter table public.resi add column if not exists courier text;

-- Reload PostgREST schema cache so the API sees new columns immediately.
notify pgrst, 'reload schema';
