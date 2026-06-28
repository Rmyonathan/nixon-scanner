import type { ResiRow } from "@/lib/database.types";
import { getResiStats } from "@/lib/resi-filters";

type StatsCardsProps = {
  rows: ResiRow[];
};

export function StatsCards({ rows }: StatsCardsProps) {
  const stats = getResiStats(rows);

  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Total resi
        </p>
        <p className="mt-1 text-2xl font-semibold text-zinc-900">{stats.total}</p>
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
          Belum di pack
        </p>
        <p className="mt-1 text-2xl font-semibold text-amber-900">
          {stats.belumDiPack}
        </p>
      </div>
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-blue-700">
          Pengiriman
        </p>
        <p className="mt-1 text-2xl font-semibold text-blue-900">
          {stats.pengiriman}
        </p>
      </div>
    </div>
  );
}
