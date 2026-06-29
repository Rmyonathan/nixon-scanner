import type { CourierOptionRow } from "@/lib/database.types";

// Fallback list used before courier_options table is set up in Supabase.
// Edit names/prefixes here if you need different defaults.
export const DEFAULT_COURIER_SEEDS: ReadonlyArray<{
  name: string;
  prefix: string | null;
}> = [
  { name: "Shopee Xpress", prefix: "SPX" },
  { name: "J&T Express", prefix: "JP" },
  { name: "SiCepat", prefix: "00" },
  { name: "GoSend", prefix: null },
  { name: "GrabExpress", prefix: null },
];

export function defaultCourierOptions(): CourierOptionRow[] {
  return DEFAULT_COURIER_SEEDS.map((item, index) => ({
    id: `default-${index}`,
    name: item.name,
    prefix: item.prefix,
    sort_order: index,
    created_at: new Date(0).toISOString(),
  }));
}

export function detectCourier(
  resi: string,
  options: CourierOptionRow[],
): string | null {
  const normalized = resi.trim().toUpperCase();

  const withPrefix = options
    .filter((option) => option.prefix?.trim())
    .sort(
      (a, b) => (b.prefix?.length ?? 0) - (a.prefix?.length ?? 0),
    );

  for (const option of withPrefix) {
    if (normalized.startsWith(option.prefix!.trim().toUpperCase())) {
      return option.name;
    }
  }

  return null;
}

export function getCourierNames(options: CourierOptionRow[]): string[] {
  return options.map((option) => option.name);
}
