import type { ResiFilterStatus } from "@/lib/resi-filters";

type ResiToolbarProps = {
  searchQuery: string;
  statusFilter: ResiFilterStatus;
  scanFilter: string | null;
  resultCount: number;
  totalCount: number;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: ResiFilterStatus) => void;
  onClearScanFilter: () => void;
  onClearAllFilters: () => void;
};

export function ResiToolbar({
  searchQuery,
  statusFilter,
  scanFilter,
  resultCount,
  totalCount,
  onSearchChange,
  onStatusFilterChange,
  onClearScanFilter,
  onClearAllFilters,
}: ResiToolbarProps) {
  const hasFilters =
    Boolean(scanFilter) ||
    Boolean(searchQuery.trim()) ||
    statusFilter !== "all";

  return (
    <div className="space-y-3 border-b border-zinc-200 px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
            />
          </svg>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari resi, nama, alamat, atau catatan..."
            className="w-full rounded-lg border border-zinc-300 py-2 pl-9 pr-3 text-sm outline-none ring-emerald-500 focus:border-emerald-500 focus:ring-2"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) =>
            onStatusFilterChange(e.target.value as ResiFilterStatus)
          }
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-emerald-500 focus:border-emerald-500 focus:ring-2 sm:w-44"
        >
          <option value="all">Semua status</option>
          <option value="belum di pack">Belum di pack</option>
          <option value="pengiriman">Pengiriman</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {scanFilter && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
              Scan: {scanFilter}
              <button
                type="button"
                onClick={onClearScanFilter}
                className="rounded-full px-1 hover:bg-emerald-200"
                aria-label="Hapus filter scan"
              >
                ×
              </button>
            </span>
          )}
          <span className="text-xs text-zinc-500">
            Menampilkan {resultCount} dari {totalCount} item
          </span>
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={onClearAllFilters}
            className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
          >
            Tampilkan semua
          </button>
        )}
      </div>
    </div>
  );
}
