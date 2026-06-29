import { getSupabase } from "@/lib/supabase";
import type { CourierOptionRow } from "@/lib/database.types";

export async function getCourierOptions(): Promise<CourierOptionRow[]> {
  const { data, error } = await getSupabase()
    .from("courier_options")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function addCourierOption(input: {
  name: string;
  prefix?: string;
}): Promise<CourierOptionRow> {
  const name = input.name.trim();
  if (!name) {
    throw new Error("Nama courier wajib diisi");
  }

  const { data: existing, error: existingError } = await getSupabase()
    .from("courier_options")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);

  if (existingError) {
    throw new Error(existingError.message);
  }

  const nextSortOrder = (existing?.[0]?.sort_order ?? 0) + 1;

  const { data, error } = await getSupabase()
    .from("courier_options")
    .insert({
      name,
      prefix: input.prefix?.trim() || null,
      sort_order: nextSortOrder,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteCourierOption(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from("courier_options")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
