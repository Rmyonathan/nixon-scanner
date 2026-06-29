-- Allow scan-only rows (resi only) and dikirim status for post-pack scans.
-- Order matters: drop old constraint BEFORE updating status values.

alter table public.resi alter column name drop not null;

alter table public.resi drop constraint if exists resi_status_check;

update public.resi set status = 'dikirim' where status = 'pengiriman';

alter table public.resi
  add constraint resi_status_check
  check (status in ('belum di pack', 'dikirim'));

notify pgrst, 'reload schema';
