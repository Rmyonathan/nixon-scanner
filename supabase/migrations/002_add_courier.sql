-- Run this if your resi table already exists without courier.

alter table public.resi
  add column if not exists courier text;
