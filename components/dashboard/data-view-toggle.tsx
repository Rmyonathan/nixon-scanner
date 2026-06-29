import type { DataViewMode } from "@/lib/data-view-mode";
import { DATA_VIEW_LABELS } from "@/lib/data-view-mode";
import { formatDateRangeLabel } from "@/lib/resi-filters";

type DataViewToggleProps = {
  mode: DataViewMode;
  dateFrom: string;
  dateTo: string;
  onModeChange: (mode: DataViewMode) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
};

const fieldClass =
  "min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm shadow-sm outline-none ring-emerald-500/30 transition focus:border-emerald-400 focus:ring-2 sm:w-auto";

export function DataViewToggle({
  mode,
  dateFrom,
  dateTo,
  onModeChange,
  onDateFromChange,
  onDateToChange,
}: DataViewToggleProps) {
  const isToday = mode === "today";
  const rangeLabel = formatDateRangeLabel(dateFrom, dateTo);

  return (
    <div className="space-y-4" data-pause-scanner-focus>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Tampilan data
          </p>
          <p className="mt-0.5 text-sm text-zinc-600" suppressHydrationWarning>
            {rangeLabel
              ? `Total, Pack, dan Kirim mengikuti filter tanggal (${rangeLabel})`
              : "Menampilkan semua tanggal — Total, Pack, dan Kirim untuk seluruh data"}
          </p>
        </div>

        <div className="inline-flex min-h-11 shrink-0 rounded-xl border border-zinc-200 bg-zinc-100 p-1 shadow-inner">
          <button
            type="button"
            role="switch"
            aria-checked={isToday}
            onClick={() => onModeChange("today")}
            className={`min-h-9 rounded-lg px-3 text-sm font-medium transition sm:px-4 ${
              isToday
                ? "bg-white text-sky-900 shadow-sm ring-1 ring-sky-200"
                : "text-zinc-600 active:bg-zinc-200/80"
            }`}
          >
            {DATA_VIEW_LABELS.today}
          </button>
          <button
            type="button"
            role="switch"
            aria-checked={!isToday}
            onClick={() => onModeChange("all")}
            className={`min-h-9 rounded-lg px-3 text-sm font-medium transition sm:px-4 ${
              !isToday
                ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-300"
                : "text-zinc-600 active:bg-zinc-200/80"
            }`}
          >
            {DATA_VIEW_LABELS.all}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 border-t border-zinc-100 pt-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
        <label className="block text-sm text-zinc-600">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
            Dari tanggal
          </span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className={fieldClass}
          />
        </label>

        <label className="block text-sm text-zinc-600">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
            Sampai tanggal
          </span>
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => onDateToChange(e.target.value)}
            className={fieldClass}
          />
        </label>

        <p className="text-xs leading-relaxed text-zinc-500 lg:pb-3">
          Kosongkan kedua tanggal untuk melihat semua data. Isi satu atau kedua
          tanggal untuk memfilter berdasarkan kolom Diperbarui.
        </p>
      </div>
    </div>
  );
}
