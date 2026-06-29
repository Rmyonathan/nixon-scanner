-- Allow deleting resi rows from the dashboard.

create policy "Allow anonymous delete access"
  on public.resi for delete
  to anon
  using (true);

notify pgrst, 'reload schema';
