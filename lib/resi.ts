import { getSupabase } from "@/lib/supabase";
import type { ResiRow, ResiStatus } from "@/lib/database.types";

export type NewResiInput = {
  resi: string;
  name: string;
  status: ResiStatus;
  alamat?: string;
  courier?: string;
  notes?: string;
};

export type UpdateResiInput = {
  name: string;
  status: ResiStatus;
  alamat?: string;
  courier?: string;
  notes?: string;
};

export function isConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  return (
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("err_name_not_resolved") ||
    message.includes("fetch failed") ||
    message.includes("supabase.co")
  );
}

export function formatResiError(error: unknown): string {
  if (error instanceof Error) {
    if (isConnectionError(error)) {
      return "Tidak dapat terhubung ke Supabase. Periksa NEXT_PUBLIC_SUPABASE_URL di .env.local (Dashboard → Settings → API → Project URL).";
    }
    return error.message;
  }

  return "Terjadi kesalahan";
}

export function resiHasDetails(row: ResiRow): boolean {
  return Boolean(row.name?.trim());
}

export async function getResiByNumber(resi: string): Promise<ResiRow | null> {
  const { data, error } = await getSupabase()
    .from("resi")
    .select("*")
    .eq("resi", resi.trim())
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getRecentResi(limit = 50): Promise<ResiRow[]> {
  const { data, error } = await getSupabase()
    .from("resi")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function insertResi(input: NewResiInput): Promise<ResiRow> {
  const { data, error } = await getSupabase()
    .from("resi")
    .insert({
      resi: input.resi.trim(),
      name: input.name.trim(),
      status: input.status,
      alamat: input.alamat?.trim() || null,
      courier: input.courier?.trim() || null,
      notes: input.notes?.trim() || null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateResi(
  id: string,
  input: UpdateResiInput,
): Promise<ResiRow> {
  const { data, error } = await getSupabase()
    .from("resi")
    .update({
      name: input.name.trim(),
      status: input.status,
      alamat: input.alamat?.trim() || null,
      courier: input.courier?.trim() || null,
      notes: input.notes?.trim() || null,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateResiStatus(
  id: string,
  status: ResiStatus,
): Promise<ResiRow> {
  const { data, error } = await getSupabase()
    .from("resi")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
