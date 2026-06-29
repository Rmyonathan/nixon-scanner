import type { CourierOptionRow, ResiRow } from "@/lib/database.types";
import { exportResiRowsToXlsx } from "@/lib/export-xlsx";
import type { DataViewMode } from "@/lib/data-view-mode";
import type { ResiFilterCourier, ResiFilterStatus } from "@/lib/resi-filters";

type ResiToolbarProps = {
  searchQuery: string;
  statusFilter: ResiFilterStatus;
  courierFilter: ResiFilterCourier;
  dateFilter: string;
  dataViewMode: DataViewMode;
  scanFilter: string | null;
  resultCount: number;
  totalCount: number;
  displayedRows: ResiRow[];
  courierOptions: CourierOptionRow[];
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: ResiFilterStatus) => void;
  onCourierFilterChange: (value: ResiFilterCourier) => void;
  onDateFilterChange: (value: string) => void;
  onClearScanFilter: () => void;
  onClearAllFilters: () => void;
};

const fieldClass =
  "w-full min-h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm shadow-sm outline-none ring-emerald-500/30 transition focus:border-emerald-400 focus:ring-2";

export function ResiToolbar({
  searchQuery,
  statusFilter,
  courierFilter,
  dateFilter,
  dataViewMode,
  scanFilter,
  resultCount,
  totalCount,
  displayedRows,
  courierOptions,
  onSearchChange,
  onStatusFilterChange,
  onCourierFilterChange,
  onDateFilterChange,
  onClearScanFilter,
  onClearAllFilters,
}: ResiToolbarProps) {
  const hasFilters =
    Boolean(scanFilter) ||
    Boolean(searchQuery.trim()) ||
    (dataViewMode === "all" && Boolean(dateFilter)) ||
    statusFilter !== "all" ||
    courierFilter !== "all";

  async function handleExportXlsx() {
    if (displayedRows.length === 0) return;
    await exportResiRowsToXlsx(displayedRows);
  }

  return (
    <div className="space-y-3 border-b border-zinc-200/80 bg-zinc-50/60 px-3 py-3 sm:px-4 sm:py-4">
      <div className="space-y-3 xl:flex xl:items-center xl:gap-3">
        <div className="relative min-w-0 flex-1">
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
            placeholder="Cari resi, nama, courier..."
            className={`${fieldClass} py-2.5 pl-9 pr-3`}
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:flex xl:flex-wrap xl:items-center">
          {dataViewMode === "all" && (
            <label className="flex min-h-11 flex-col justify-center gap-1 text-sm text-zinc-600 sm:flex-row sm:items-center sm:gap-2">
              <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-zinc-500 sm:normal-case sm:tracking-normal">
                Tanggal
              </span>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => onDateFilterChange(e.target.value)}
                className={fieldClass}
              />
            </label>
          )}

          <select
            value={courierFilter}
            onChange={(e) => onCourierFilterChange(e.target.value)}
            className={fieldClass}
          >
            <option value="all">Semua courier</option>
            {courierOptions.map((courier) => (
              <option key={courier.id} value={courier.name}>
                {courier.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              onStatusFilterChange(e.target.value as ResiFilterStatus)
            }
            className={fieldClass}
          >
            <option value="all">Semua status</option>
            <option value="belum di pack">Belum di pack</option>
            <option value="dikirim">Dikirim</option>
          </select>

          <button
            type="button"
            onClick={() => void handleExportXlsx()}
            disabled={displayedRows.length === 0}
            className="min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 shadow-sm transition active:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2 xl:w-auto"
          >
            Export to XLSX
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {scanFilter && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
              Scan: {scanFilter}
              <button
                type="button"
                onClick={onClearScanFilter}
                className="rounded-full px-1.5 py-0.5 active:bg-emerald-200"
                aria-label="Hapus filter scan"
              >
                ×
              </button>
            </span>
          )}
          {dataViewMode === "today" && (
            <span className="inline-flex min-h-11 items-center rounded-xl border border-sky-200 bg-sky-50 px-3 text-sm font-medium text-sky-800">
              Filter: hari ini
            </span>
          )}
          {dataViewMode === "all" && dateFilter && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
              Tanggal: {dateFilter}
              <button
                type="button"
                onClick={() => onDateFilterChange("")}
                className="rounded-full px-1.5 py-0.5 active:bg-blue-200"
                aria-label="Hapus filter tanggal"
              >
                ×
              </button>
            </span>
          )}
          <span className="text-xs text-zinc-500">
            {resultCount} / {totalCount} item
          </span>
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={onClearAllFilters}
            className="min-h-10 text-sm font-medium text-emerald-700 active:text-emerald-800 sm:text-xs"
          >
            Tampilkan semua
          </button>
        )}
      </div>
    </div>
  );
}
