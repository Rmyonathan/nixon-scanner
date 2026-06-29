import type { ResiRow } from "@/lib/database.types";
import { getResiStats } from "@/lib/resi-filters";

type StatsCardsProps = {
  rows: ResiRow[];
};

export function StatsCards({ rows }: StatsCardsProps) {
  const stats = getResiStats(rows);

  return (
    <div className="mb-4 grid grid-cols-3 gap-2 sm:mb-6 sm:gap-4">
      <div className="rounded-xl border border-zinc-200/80 bg-white px-3 py-3 shadow-sm ring-1 ring-zinc-950/5 sm:rounded-2xl sm:px-5 sm:py-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 sm:text-xs">
          Total
        </p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-900 sm:mt-2 sm:text-3xl">
          {stats.total}
        </p>
      </div>
      <div className="rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50 px-3 py-3 shadow-sm ring-1 ring-amber-950/5 sm:rounded-2xl sm:px-5 sm:py-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-800/80 sm:text-xs">
          Pack
        </p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-amber-950 sm:mt-2 sm:text-3xl">
          {stats.belumDiPack}
        </p>
      </div>
      <div className="rounded-xl border border-blue-200/80 bg-gradient-to-br from-blue-50 to-sky-50 px-3 py-3 shadow-sm ring-1 ring-blue-950/5 sm:rounded-2xl sm:px-5 sm:py-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-800/80 sm:text-xs">
          Kirim
        </p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-blue-950 sm:mt-2 sm:text-3xl">
          {stats.dikirim}
        </p>
      </div>
    </div>
  );
}
