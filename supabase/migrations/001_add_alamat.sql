-- Run this if you already created the resi table without alamat.

alter table public.resi
  add column if not exists alamat text;
